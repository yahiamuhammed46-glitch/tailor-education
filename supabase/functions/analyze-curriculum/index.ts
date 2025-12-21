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
    const { curriculumId, fileContent, fileName } = await req.json();

    if (!curriculumId || !fileContent) {
      return new Response(
        JSON.stringify({ error: "curriculumId and fileContent are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing curriculum: ${curriculumId}, file: ${fileName}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Gemini to analyze the curriculum and extract topics
    const systemPrompt = `أنت محلل مناهج تعليمية متخصص. مهمتك هي:
1. تحليل محتوى المنهج الدراسي المرفوع
2. استخراج الوحدات والموضوعات الرئيسية
3. تنظيمها بترتيب منطقي

يجب أن ترد بصيغة JSON فقط بالشكل التالي:
{
  "topics": [
    {
      "name": "اسم الوحدة أو الموضوع",
      "description": "وصف مختصر للمحتوى",
      "order_index": 1
    }
  ]
}

ملاحظات:
- استخرج من 3 إلى 10 وحدات رئيسية
- اجعل الأسماء واضحة ومختصرة
- رتب الوحدات بترتيب منطقي للتعلم
- الوصف يجب أن يكون جملة أو جملتين فقط`;

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
          { role: "user", content: `حلل المنهج التالي واستخرج الوحدات الرئيسية:\n\n${fileContent.substring(0, 15000)}` },
        ],
        temperature: 0.3,
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
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("AI Response:", content);

    // Parse the JSON response
    let parsedTopics;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedTopics = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse curriculum analysis");
    }

    // Save topics to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const topicsToInsert = parsedTopics.topics.map((topic: any, index: number) => ({
      curriculum_id: curriculumId,
      name: topic.name,
      description: topic.description || null,
      order_index: topic.order_index || index + 1,
    }));

    const { data: insertedTopics, error: insertError } = await supabase
      .from("topics")
      .insert(topicsToInsert)
      .select();

    if (insertError) {
      console.error("Failed to insert topics:", insertError);
      throw new Error("Failed to save topics");
    }

    console.log(`Successfully extracted ${insertedTopics.length} topics`);

    return new Response(
      JSON.stringify({
        success: true,
        topics: insertedTopics,
        message: `تم استخراج ${insertedTopics.length} وحدة من المنهج`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in analyze-curriculum:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحليل المنهج";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
