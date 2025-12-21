import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, curriculumId, topicId, conversationHistory } = await req.json();

    if (!question || !curriculumId) {
      return new Response(
        JSON.stringify({ error: "question and curriculumId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Explaining topic for curriculum: ${curriculumId}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get curriculum content
    const { data: curriculum, error: curriculumError } = await supabase
      .from("curriculums")
      .select("name, subject, content")
      .eq("id", curriculumId)
      .single();

    if (curriculumError || !curriculum) {
      throw new Error("Curriculum not found");
    }

    // Get topic details if specified
    let topicInfo = "";
    if (topicId) {
      const { data: topic } = await supabase
        .from("topics")
        .select("name, description")
        .eq("id", topicId)
        .single();

      if (topic) {
        topicInfo = `\n\nالوحدة المحددة: ${topic.name}\nوصف الوحدة: ${topic.description || ""}`;
      }
    }

    // Build conversation context
    const previousMessages = (conversationHistory || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const systemPrompt = `أنت معلم خبير ومتخصص في الشرح والتدريس. مهمتك هي شرح المفاهيم الدراسية بطريقة سهلة ومفهومة للطلاب.

قواعد الشرح:
1. استخدم لغة بسيطة وواضحة مناسبة لمستوى الطالب
2. قسم الشرح إلى نقاط ومراحل واضحة
3. استخدم أمثلة عملية من الحياة اليومية
4. إذا كان الموضوع يتطلب خطوات، اشرحها بالتسلسل
5. في نهاية الشرح، قدم ملخصاً سريعاً للنقاط الرئيسية
6. إذا كان السؤال عن معادلة أو قانون، اشرح كيفية استخدامه مع مثال
7. شجع الطالب وحفزه على الفهم

المنهج: ${curriculum.name}
المادة: ${curriculum.subject}${topicInfo}

${curriculum.content ? `\nمحتوى المنهج للمرجعية:\n${curriculum.content.substring(0, 15000)}` : ""}

أجب على أسئلة الطالب بناءً على هذا المنهج. إذا كان السؤال خارج نطاق المنهج، أخبر الطالب بذلك بلطف وحاول مساعدته قدر الإمكان.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...previousMessages,
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد للمتابعة" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const explanation = aiData.choices?.[0]?.message?.content;

    if (!explanation) {
      throw new Error("No explanation received from AI");
    }

    console.log("Successfully generated explanation");

    return new Response(
      JSON.stringify({
        success: true,
        explanation,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in explain-topic:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء توليد الشرح";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
