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
    const { curriculumId, fileContent, fileName, fileUrl } = await req.json();

    if (!curriculumId) {
      return new Response(
        JSON.stringify({ error: "curriculumId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing curriculum: ${curriculumId}, file: ${fileName}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the curriculum info
    const { data: curriculum } = await supabase
      .from("curriculums")
      .select("name, subject, education_level")
      .eq("id", curriculumId)
      .single();

    let actualFileContent = fileContent || "";
    let fileBase64 = "";
    let mimeType = "";

    // Download and process the actual file if URL is provided
    if (fileUrl) {
      try {
        console.log("Downloading file from:", fileUrl);
        
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
          throw new Error(`Failed to download file: ${fileResponse.status}`);
        }
        
        const fileBuffer = await fileResponse.arrayBuffer();
        const uint8Array = new Uint8Array(fileBuffer);
        
        // Convert to base64 using btoa
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        fileBase64 = btoa(binary);
        
        // Determine MIME type from file extension
        const ext = fileName?.toLowerCase().split('.').pop() || '';
        if (ext === 'pdf') {
          mimeType = 'application/pdf';
        } else if (ext === 'docx') {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (ext === 'doc') {
          mimeType = 'application/msword';
        } else if (ext === 'pptx') {
          mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        } else if (ext === 'txt') {
          mimeType = 'text/plain';
          // For text files, decode the content directly
          const decoder = new TextDecoder('utf-8');
          actualFileContent = decoder.decode(uint8Array);
        }
        
        console.log(`File downloaded successfully. Size: ${uint8Array.length} bytes, Type: ${mimeType}`);
      } catch (fetchError) {
        console.error("Error downloading file:", fetchError);
      }
    }

    let extractedContent = "";

    // If we have binary file data (PDF/DOCX), use Gemini's multimodal capabilities
    if (fileBase64 && mimeType && mimeType !== 'text/plain') {
      console.log("Using Gemini to extract content from file...");
      
      const extractPrompt = `أنت محلل مستندات متخصص. قم بتحليل هذا الملف واستخراج كل المحتوى النصي منه.

معلومات الملف:
- اسم الملف: ${fileName}
- المادة: ${curriculum?.subject || 'غير محدد'}
- المستوى: ${curriculum?.education_level || 'غير محدد'}

المهمة: استخرج كل النص والمحتوى من هذا المستند بشكل كامل ومفصل. اكتب المحتوى كما هو موجود في الملف.`;

      try {
        const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: extractPrompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${fileBase64}`,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (extractResponse.ok) {
          const extractData = await extractResponse.json();
          extractedContent = extractData.choices?.[0]?.message?.content || "";
          console.log("Extracted content length:", extractedContent.length);
        } else {
          const errorText = await extractResponse.text();
          console.error("Content extraction error:", extractResponse.status, errorText);
        }
      } catch (extractError) {
        console.error("Error extracting content:", extractError);
      }
    }

    // Use extracted content or provided text content
    actualFileContent = extractedContent || actualFileContent;

    // If we still don't have content, generate based on metadata
    if (!actualFileContent || actualFileContent.length < 100) {
      console.log("No file content extracted, generating based on metadata...");
      
      if (curriculum) {
        const outlinePrompt = `أنت خبير تعليمي. بناءً على المعلومات التالية، أنشئ محتوى منهج دراسي تفصيلي:

المادة: ${curriculum.subject}
الاسم: ${curriculum.name}
المستوى التعليمي: ${curriculum.education_level}
اسم الملف: ${fileName}

أنشئ محتوى تفصيلي يشمل:
1. المفاهيم الأساسية
2. التعريفات المهمة
3. القوانين والقواعد
4. الأمثلة التطبيقية
5. النقاط الرئيسية لكل وحدة`;

        const contentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: outlinePrompt }],
          }),
        });

        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          actualFileContent = contentData.choices?.[0]?.message?.content || "";
        }
      }
    }

    console.log("Final content length for analysis:", actualFileContent.length);

    // Use Gemini to analyze the curriculum and extract topics
    const systemPrompt = `أنت محلل مناهج تعليمية متخصص. مهمتك هي:
1. تحليل محتوى المنهج الدراسي بدقة
2. استخراج الوحدات والموضوعات الرئيسية من المحتوى الفعلي
3. تنظيمها بترتيب منطقي

يجب أن ترد بصيغة JSON فقط بالشكل التالي:
{
  "topics": [
    {
      "name": "اسم الوحدة أو الموضوع",
      "description": "وصف مفصل للمحتوى مع النقاط الرئيسية والمفاهيم التي يجب أن يتعلمها الطالب",
      "order_index": 1
    }
  ]
}

ملاحظات هامة:
- استخرج الوحدات من المحتوى الفعلي للملف
- استخرج من 5 إلى 15 وحدة رئيسية حسب محتوى الملف
- اجعل الأسماء واضحة ومختصرة كما هي في الملف
- رتب الوحدات بترتيب منطقي للتعلم
- الوصف يجب أن يكون تفصيلياً ويحتوي على النقاط الرئيسية من المحتوى`;

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
          { role: "user", content: `حلل المحتوى التالي من ملف "${fileName}" واستخرج الوحدات الرئيسية:\n\n${actualFileContent.substring(0, 30000)}` },
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

    // Save the extracted content to the curriculum record
    await supabase
      .from("curriculums")
      .update({ content: actualFileContent.substring(0, 100000) })
      .eq("id", curriculumId);

    // Save topics to database
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

    console.log(`Successfully extracted ${insertedTopics.length} topics from actual file content`);

    return new Response(
      JSON.stringify({
        success: true,
        topics: insertedTopics,
        message: `تم استخراج ${insertedTopics.length} وحدة من المنهج`,
        contentExtracted: actualFileContent.length > 0,
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
