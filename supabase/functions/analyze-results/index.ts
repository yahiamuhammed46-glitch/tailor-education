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
    const { attemptId } = await req.json();

    if (!attemptId) {
      return new Response(
        JSON.stringify({ error: "attemptId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing results for attempt: ${attemptId}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get attempt with answers
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select(`
        *,
        exam:exams(
          *,
          curriculum:curriculums(*)
        ),
        student_answers(
          *,
          question:questions(*, topic:topics(*))
        )
      `)
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      throw new Error("Failed to fetch attempt data");
    }

    // Calculate scores per topic
    const topicScoresMap: Record<string, { 
      total: number; 
      correct: number; 
      topicName: string;
      topicId: string;
    }> = {};

    let totalCorrect = 0;
    const totalQuestions = attempt.student_answers.length;

    for (const answer of attempt.student_answers) {
      const question = answer.question;
      const topic = question.topic;
      
      if (!topicScoresMap[topic.id]) {
        topicScoresMap[topic.id] = {
          total: 0,
          correct: 0,
          topicName: topic.name,
          topicId: topic.id,
        };
      }

      topicScoresMap[topic.id].total++;

      // Check if answer is correct
      const isCorrect = answer.answer?.trim().toLowerCase() === 
                       question.correct_answer?.trim().toLowerCase();
      
      if (isCorrect) {
        topicScoresMap[topic.id].correct++;
        totalCorrect++;
      }

      // Update individual answer
      await supabase
        .from("student_answers")
        .update({ is_correct: isCorrect })
        .eq("id", answer.id);
    }

    // Calculate overall score
    const overallScore = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    // Update attempt with score
    await supabase
      .from("exam_attempts")
      .update({
        score: overallScore,
        total_questions: totalQuestions,
        correct_answers: totalCorrect,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    // Calculate and save topic scores
    const topicScores = Object.entries(topicScoresMap).map(([topicId, data]) => {
      const score = Math.round((data.correct / data.total) * 100);
      let status: string;
      
      if (score >= 85) status = "mastered";
      else if (score >= 70) status = "good";
      else if (score >= 50) status = "average";
      else if (score >= 30) status = "weak";
      else status = "needs_review";

      return {
        attempt_id: attemptId,
        topic_id: topicId,
        score,
        total_questions: data.total,
        correct_answers: data.correct,
        status,
      };
    });

    await supabase.from("topic_scores").insert(topicScores);

    // Find the starting point (first weak or needs_review topic)
    const sortedTopics = Object.entries(topicScoresMap)
      .map(([topicId, data]) => ({
        ...data,
        score: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => {
        // Sort by order_index of topics (assumed from original order)
        return 0;
      });

    const weakTopics = sortedTopics.filter(t => t.score < 60);
    const startPointTopic = weakTopics[0] || sortedTopics[sortedTopics.length - 1];

    // Get wrong answers details for detailed weakness analysis
    const wrongAnswers = attempt.student_answers
      .filter((a: any) => a.answer?.trim().toLowerCase() !== a.question.correct_answer?.trim().toLowerCase())
      .map((a: any) => ({
        questionText: a.question.question_text,
        studentAnswer: a.answer,
        correctAnswer: a.question.correct_answer,
        topicName: a.question.topic.name,
        topicDescription: a.question.topic.description,
        explanation: a.question.explanation,
      }));

    // Use AI to generate comprehensive analysis
    const topicsSummary = sortedTopics.map(t => 
      `- ${t.topicName}: ${t.score}% (${t.correct}/${t.total})`
    ).join("\n");

    const wrongAnswersSummary = wrongAnswers.map((w: any, i: number) => 
      `${i + 1}. السؤال: ${w.questionText}\n   إجابة الطالب: ${w.studentAnswer}\n   الإجابة الصحيحة: ${w.correctAnswer}\n   الوحدة: ${w.topicName}`
    ).join("\n\n");

    const systemPrompt = `أنت محلل تعليمي متخصص. مهمتك تحليل نتائج الطالب وتقديم تقرير شامل مع تحديد نقاط الضعف المحددة من المنهج.

رد بصيغة JSON:
{
  "overall_assessment": "تقييم عام شامل للأداء في 2-3 جمل",
  "start_point_description": "وصف لنقطة البداية المقترحة للشرح",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
  "recommendations": [
    "توصية 1 للتحسين",
    "توصية 2 للتحسين",
    "توصية 3 للتحسين"
  ],
  "detailed_weaknesses": [
    {
      "topic": "اسم الوحدة",
      "specific_gaps": ["المفهوم أو المهارة المحددة التي يحتاج الطالب لتحسينها"],
      "estimated_hours": 2,
      "priority": "high"
    }
  ],
  "study_plan": {
    "total_hours": 10,
    "daily_hours": 2,
    "completion_days": 5,
    "tasks": [
      {
        "task": "وصف المهمة",
        "topic": "الوحدة",
        "duration_hours": 2,
        "deadline_days": 1
      }
    ]
  }
}`;

    const userPrompt = `حلل نتائج الطالب التالية:

النتيجة الإجمالية: ${overallScore}%
الأسئلة الصحيحة: ${totalCorrect} من ${totalQuestions}

نتائج الوحدات:
${topicsSummary}

الأسئلة الخاطئة:
${wrongAnswersSummary || "لا توجد أسئلة خاطئة"}

الوحدة المقترح البدء منها: ${startPointTopic?.topicName || "غير محدد"}

المطلوب:
1. قدم تحليلاً شاملاً مع توصيات عملية
2. حدد نقاط الضعف المحددة من المنهج بناءً على الأسئلة الخاطئة
3. اقترح خطة دراسية مع وقت تقديري للإنجاز
4. حدد الأولوية لكل نقطة ضعف (high, medium, low)`;

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
        temperature: 0.5,
      }),
    });

    let analysis = {
      overall_assessment: `حصل الطالب على ${overallScore}% في الامتحان التشخيصي.`,
      start_point_description: `يُنصح بالبدء من وحدة "${startPointTopic?.topicName}"`,
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: ["مراجعة الوحدات الضعيفة", "التركيز على الفهم العميق", "حل المزيد من التمارين"],
      detailed_weaknesses: [] as Array<{
        topic: string;
        specific_gaps: string[];
        estimated_hours: number;
        priority: string;
      }>,
      study_plan: {
        total_hours: weakTopics.length * 2,
        daily_hours: 2,
        completion_days: Math.max(weakTopics.length, 3),
        tasks: weakTopics.map((t, i) => ({
          task: `مراجعة وفهم ${t.topicName}`,
          topic: t.topicName,
          duration_hours: 2,
          deadline_days: i + 1,
        })),
      },
    };

    if (response.ok) {
      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = { ...analysis, ...JSON.parse(jsonMatch[0]) };
          }
        } catch (e) {
          console.error("Failed to parse AI analysis:", e);
        }
      }
    }

    // Save analysis report
    await supabase.from("analysis_reports").insert({
      attempt_id: attemptId,
      start_point_topic_id: startPointTopic?.topicId || null,
      start_point_description: analysis.start_point_description,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      overall_assessment: analysis.overall_assessment,
    });

    console.log(`Analysis complete for attempt: ${attemptId}`);

    return new Response(
      JSON.stringify({
        success: true,
        score: overallScore,
        totalQuestions,
        correctAnswers: totalCorrect,
        topicScores: topicScores.map(ts => ({
          ...ts,
          topicName: topicScoresMap[ts.topic_id]?.topicName,
        })),
        analysis,
        startPoint: startPointTopic?.topicName,
        wrongAnswers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in analyze-results:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحليل النتائج";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
