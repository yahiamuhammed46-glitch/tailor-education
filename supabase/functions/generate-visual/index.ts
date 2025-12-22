import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, type, context } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating ${type} for topic: ${topic}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate visual content based on type
    if (type === "diagram" || type === "infographic") {
      // Use image generation model
      const prompt = `Create an educational ${type === "diagram" ? "diagram" : "infographic"} in Arabic language about: ${topic}. 
${context ? `Context: ${context}` : ""}
Style: Clean, modern, educational design with clear labels in Arabic. Use professional colors and clear visual hierarchy. Make it suitable for students.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: prompt }
          ],
          modalities: ["image", "text"]
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
      const images = aiData.choices?.[0]?.message?.images;
      const textContent = aiData.choices?.[0]?.message?.content;

      if (!images || images.length === 0) {
        throw new Error("No image generated");
      }

      console.log("Successfully generated visual");

      return new Response(
        JSON.stringify({
          success: true,
          type: type,
          imageUrl: images[0].image_url.url,
          description: textContent || `${type === "diagram" ? "رسم توضيحي" : "إنفوجرافيك"} لموضوع: ${topic}`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === "presentation") {
      // Generate presentation slides content
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `أنت مصمم عروض تقديمية تعليمية محترف. قم بإنشاء محتوى عرض تقديمي تعليمي بتنسيق JSON.

قم بإنشاء 5-7 شرائح تعليمية تشمل:
1. شريحة العنوان
2. شريحة الأهداف التعليمية
3. 2-4 شرائح للمحتوى الرئيسي
4. شريحة الملخص

أجب بتنسيق JSON فقط:
{
  "slides": [
    {
      "type": "title" | "objectives" | "content" | "summary",
      "title": "عنوان الشريحة",
      "content": ["نقطة 1", "نقطة 2"],
      "notes": "ملاحظات للمعلم"
    }
  ]
}`
            },
            {
              role: "user",
              content: `أنشئ عرضاً تقديمياً عن: ${topic}${context ? `\n\nالسياق: ${context}` : ""}`
            }
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
      let presentationContent = aiData.choices?.[0]?.message?.content;

      if (!presentationContent) {
        throw new Error("No presentation content generated");
      }

      // Parse JSON from response
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = presentationContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          presentationContent = jsonMatch[1];
        }
        const slides = JSON.parse(presentationContent);
        
        console.log("Successfully generated presentation");

        return new Response(
          JSON.stringify({
            success: true,
            type: "presentation",
            presentation: slides,
            topic: topic
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error("Error parsing presentation JSON:", parseError);
        throw new Error("Failed to parse presentation content");
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use 'diagram', 'infographic', or 'presentation'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Error in generate-visual:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء توليد المحتوى";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
