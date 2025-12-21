import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract text from DOCX file
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    const doc = await zip.loadAsync(arrayBuffer);
    
    // Get the main document content
    const documentXml = await doc.file("word/document.xml")?.async("string");
    if (!documentXml) {
      throw new Error("Could not find document.xml in DOCX");
    }
    
    // Extract text from XML by removing tags and keeping content
    let text = documentXml
      // Replace paragraph breaks with newlines
      .replace(/<\/w:p>/g, '\n')
      // Replace line breaks
      .replace(/<w:br[^>]*\/>/g, '\n')
      // Remove all XML tags
      .replace(/<[^>]+>/g, '')
      // Clean up multiple spaces and newlines
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n+/g, '\n')
      .trim();
    
    return text;
  } catch (error) {
    console.error("Error extracting DOCX:", error);
    throw error;
  }
}

// Extract text from PDF using Gemini's vision capabilities
async function extractTextFromPdf(base64Data: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
                text: "استخرج كل النص الموجود في هذا الملف PDF بالكامل. اكتب النص كما هو موجود في الملف دون أي تعديلات.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Data}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } else {
      const errorText = await response.text();
      console.error("PDF extraction error:", response.status, errorText);
      return "";
    }
  } catch (error) {
    console.error("Error extracting PDF:", error);
    return "";
  }
}

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
        
        // Determine file type from extension
        const ext = fileName?.toLowerCase().split('.').pop() || '';
        console.log(`File downloaded successfully. Size: ${uint8Array.length} bytes, Extension: ${ext}`);
        
        if (ext === 'txt') {
          // For text files, decode directly
          const decoder = new TextDecoder('utf-8');
          actualFileContent = decoder.decode(uint8Array);
          console.log("Extracted text file content, length:", actualFileContent.length);
        } else if (ext === 'docx') {
          // Extract text from DOCX using JSZip
          console.log("Extracting content from DOCX file...");
          actualFileContent = await extractTextFromDocx(fileBuffer);
          console.log("Extracted DOCX content, length:", actualFileContent.length);
        } else if (ext === 'pdf') {
          // Extract text from PDF using Gemini
          console.log("Extracting content from PDF file...");
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64 = btoa(binary);
          actualFileContent = await extractTextFromPdf(base64, LOVABLE_API_KEY);
          console.log("Extracted PDF content, length:", actualFileContent.length);
        }
      } catch (fetchError) {
        console.error("Error downloading/extracting file:", fetchError);
      }
    }

    // If we still don't have content, generate based on metadata
    if (!actualFileContent || actualFileContent.length < 50) {
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
    console.log("Content preview:", actualFileContent.substring(0, 500));

    // Use Gemini to analyze the curriculum and extract topics
    const systemPrompt = `أنت محلل مناهج تعليمية متخصص. مهمتك هي:
1. تحليل محتوى المنهج الدراسي بدقة
2. استخراج الوحدات والموضوعات الرئيسية من المحتوى الفعلي
3. تنظيمها بترتيب منطقي

يجب أن ترد بصيغة JSON فقط بالشكل التالي (بدون أي نص إضافي):
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
- اجعل الأسماء واضحة ومختصرة
- رتب الوحدات بترتيب منطقي للتعلم
- الوصف يجب أن يكون تفصيلياً`;

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
          { role: "user", content: `حلل المحتوى التالي من ملف "${fileName}" واستخرج الوحدات الرئيسية. رد بـ JSON فقط:\n\n${actualFileContent.substring(0, 30000)}` },
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
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedTopics = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create default topics based on subject
        console.log("No JSON found, creating default topics");
        parsedTopics = {
          topics: [
            { name: "مقدمة ومفاهيم أساسية", description: "المفاهيم والتعريفات الأساسية للمادة", order_index: 1 },
            { name: "الوحدة الأولى", description: "محتوى الوحدة الأولى من المنهج", order_index: 2 },
            { name: "الوحدة الثانية", description: "محتوى الوحدة الثانية من المنهج", order_index: 3 },
            { name: "الوحدة الثالثة", description: "محتوى الوحدة الثالثة من المنهج", order_index: 4 },
            { name: "مراجعة وتطبيقات", description: "تمارين ومراجعة شاملة للمادة", order_index: 5 },
          ]
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Create default topics as fallback
      parsedTopics = {
        topics: [
          { name: "مقدمة ومفاهيم أساسية", description: "المفاهيم والتعريفات الأساسية للمادة", order_index: 1 },
          { name: "الوحدة الأولى", description: "محتوى الوحدة الأولى من المنهج", order_index: 2 },
          { name: "الوحدة الثانية", description: "محتوى الوحدة الثانية من المنهج", order_index: 3 },
          { name: "الوحدة الثالثة", description: "محتوى الوحدة الثالثة من المنهج", order_index: 4 },
          { name: "مراجعة وتطبيقات", description: "تمارين ومراجعة شاملة للمادة", order_index: 5 },
        ]
      };
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

    console.log(`Successfully extracted ${insertedTopics.length} topics`);

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
