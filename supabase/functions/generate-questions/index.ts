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
    const { 
      examId, 
      topicIds, 
      questionsPerTopic, 
      difficulty, 
      questionTypes,
      curriculumContent 
    } = await req.json();

    if (!examId || !topicIds || !topicIds.length) {
      return new Response(
        JSON.stringify({ error: "examId and topicIds are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating questions for exam: ${examId}, topics: ${topicIds.length}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get topics details
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*, curriculums(content, name, subject)")
      .in("id", topicIds)
      .order("order_index");

    if (topicsError || !topics) {
      throw new Error("Failed to fetch topics");
    }

    // Get curriculum content from the first topic's curriculum
    let fullCurriculumContent = curriculumContent || "";
    if (topics.length > 0 && topics[0].curriculums) {
      const curriculum = topics[0].curriculums as any;
      fullCurriculumContent = curriculum.content || curriculumContent || "";
      console.log("Using curriculum content, length:", fullCurriculumContent.length);
    }

    const difficultyMap: Record<string, string> = {
      easy: "سهل - أسئلة مباشرة تختبر الفهم الأساسي",
      medium: "متوسط - أسئلة تتطلب فهماً عميقاً وتطبيقاً",
      hard: "صعب - أسئلة تحليلية وتطبيقية معقدة",
    };

    const questionTypesList = [];
    if (questionTypes?.multipleChoice) questionTypesList.push("اختيار من متعدد (4 خيارات)");
    if (questionTypes?.trueFalse) questionTypesList.push("صح وغلط");
    if (questionTypes?.shortAnswer) questionTypesList.push("إجابة قصيرة");
    if (questionTypes?.scenario) questionTypesList.push("سؤال تطبيقي/موقفي");

    const allQuestions: any[] = [];

    // Generate questions for each topic
    for (const topic of topics) {
      console.log(`Generating ${questionsPerTopic} questions for topic: ${topic.name}`);

      const systemPrompt = `أنت خبير في إنشاء أسئلة امتحانات تعليمية. مهمتك هي إنشاء أسئلة من المحتوى الفعلي للمنهج الدراسي المقدم.

قواعد مهمة جداً:
1. الأسئلة يجب أن تكون مستخرجة مباشرة من محتوى المنهج المقدم
2. لا تنشئ أسئلة من معلوماتك الخاصة - استخدم فقط ما هو موجود في المنهج
3. الأسئلة يجب أن تكون واضحة ومحددة
4. تجنب الأسئلة الغامضة أو المربكة
5. اجعل الخيارات في أسئلة الاختيار من متعدد متقاربة في الطول
6. الإجابة الصحيحة يجب أن تكون واحدة فقط وواضحة
7. أسئلة صح وغلط يجب أن تكون جمل كاملة وواضحة
8. الأسئلة التطبيقية يجب أن تكون سيناريوهات واقعية من المنهج

رد بصيغة JSON فقط:
{
  "questions": [
    {
      "question_type": "multipleChoice|trueFalse|shortAnswer|scenario",
      "question_text": "نص السؤال - يجب أن يكون من محتوى المنهج",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correct_answer": "الإجابة الصحيحة بالضبط كما هي في الخيارات",
      "explanation": "شرح الإجابة مع الإشارة للجزء ذي الصلة من المنهج",
      "difficulty": "easy|medium|hard"
    }
  ]
}

ملاحظات:
- options مطلوبة فقط لأسئلة multipleChoice (4 خيارات) و trueFalse (خياران: صح، غلط)
- للأسئلة القصيرة والتطبيقية: options يكون null
- difficulty يجب أن يتوافق مع المستوى المطلوب`;

      // Extract relevant content for this topic from curriculum
      const topicDescription = topic.description || topic.name;
      
      const userPrompt = `أنشئ ${questionsPerTopic} أسئلة من محتوى المنهج التالي عن الموضوع المحدد.

═══════════════════════════════════════
📚 محتوى المنهج الدراسي الكامل:
═══════════════════════════════════════
${fullCurriculumContent.substring(0, 12000)}

═══════════════════════════════════════
🎯 الوحدة المستهدفة: ${topic.name}
📝 وصف الوحدة: ${topicDescription}
═══════════════════════════════════════

⚙️ إعدادات الأسئلة:
- مستوى الصعوبة: ${difficultyMap[difficulty] || "متوسط"}
- أنواع الأسئلة المطلوبة: ${questionTypesList.join("، ") || "جميع الأنواع"}
- عدد الأسئلة: ${questionsPerTopic}

🔴 تنبيه مهم: يجب أن تكون جميع الأسئلة مستخرجة من المحتوى أعلاه فقط. لا تستخدم معلومات خارجية.`;

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
            { role: "user", content: userPrompt },
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
        
        continue; // Skip this topic and continue with others
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content;

      if (!content) {
        console.error("No content for topic:", topic.name);
        continue;
      }

      console.log("Generated questions response for topic:", topic.name);

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const questions = parsed.questions || [];
          
          questions.forEach((q: any, idx: number) => {
            allQuestions.push({
              exam_id: examId,
              topic_id: topic.id,
              question_type: q.question_type,
              question_text: q.question_text,
              options: q.options || null,
              correct_answer: q.correct_answer,
              explanation: q.explanation || null,
              difficulty: q.difficulty || difficulty,
              order_index: allQuestions.length + idx + 1,
            });
          });
          
          console.log(`Added ${questions.length} questions for topic: ${topic.name}`);
        }
      } catch (parseError) {
        console.error("Failed to parse questions for topic:", topic.name, parseError);
      }
    }

    if (allQuestions.length === 0) {
      throw new Error("Failed to generate any questions");
    }

    // Shuffle questions if needed
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    // Insert questions into database
    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(shuffledQuestions)
      .select();

    if (insertError) {
      console.error("Failed to insert questions:", insertError);
      throw new Error("Failed to save questions");
    }

    // Insert exam_topics junction records
    const examTopics = topicIds.map((topicId: string) => ({
      exam_id: examId,
      topic_id: topicId,
    }));

    await supabase.from("exam_topics").insert(examTopics);

    console.log(`Successfully generated ${insertedQuestions.length} questions`);

    return new Response(
      JSON.stringify({
        success: true,
        questionsCount: insertedQuestions.length,
        message: `تم إنشاء ${insertedQuestions.length} سؤال بنجاح`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-questions:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الأسئلة";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
