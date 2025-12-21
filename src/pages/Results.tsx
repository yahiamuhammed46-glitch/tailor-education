import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Download,
  Share2,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TopicScore {
  topic_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  status: string;
  topicName?: string;
}

interface AnalysisReport {
  overall_assessment: string;
  start_point_description: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ResultsData {
  attempt: {
    id: string;
    student_name: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    time_spent_seconds: number | null;
  };
  topicScores: TopicScore[];
  analysis: AnalysisReport | null;
  startPoint: string | null;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get("attemptId");
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<ResultsData | null>(null);

  useEffect(() => {
    if (attemptId) {
      loadResults();
    } else {
      toast.error("لم يتم تحديد نتيجة");
      navigate("/");
    }
  }, [attemptId]);

  const loadResults = async () => {
    try {
      // Get attempt with analysis
      const { data: attempt, error: attemptError } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (attemptError) throw attemptError;

      // Get topic scores
      const { data: topicScores, error: scoresError } = await supabase
        .from("topic_scores")
        .select(`
          *,
          topic:topics(name)
        `)
        .eq("attempt_id", attemptId);

      if (scoresError) throw scoresError;

      // Get analysis report
      const { data: analysis, error: analysisError } = await supabase
        .from("analysis_reports")
        .select(`
          *,
          start_point_topic:topics(name)
        `)
        .eq("attempt_id", attemptId)
        .maybeSingle();

      // Format topic scores
      const formattedTopicScores = (topicScores || []).map(ts => ({
        ...ts,
        topicName: Array.isArray(ts.topic) ? ts.topic[0]?.name : ts.topic?.name,
      }));

      // Format analysis - handle JSONB arrays properly
      let formattedAnalysis: AnalysisReport | null = null;
      if (analysis) {
        formattedAnalysis = {
          overall_assessment: analysis.overall_assessment || "",
          start_point_description: analysis.start_point_description || "",
          strengths: Array.isArray(analysis.strengths) 
            ? analysis.strengths as string[]
            : [],
          weaknesses: Array.isArray(analysis.weaknesses) 
            ? analysis.weaknesses as string[]
            : [],
          recommendations: Array.isArray(analysis.recommendations) 
            ? analysis.recommendations as string[]
            : [],
        };
      }

      const startPointTopic = analysis?.start_point_topic;
      const startPointName = Array.isArray(startPointTopic) 
        ? startPointTopic[0]?.name 
        : startPointTopic?.name;

      setResults({
        attempt,
        topicScores: formattedTopicScores,
        analysis: formattedAnalysis,
        startPoint: startPointName || null,
      });
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("فشل تحميل النتائج");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = (status: string) => {
    const colors: Record<string, string> = {
      mastered: "bg-success/10 text-success border-success/20",
      good: "bg-success/10 text-success border-success/20",
      average: "bg-warning/10 text-warning border-warning/20",
      weak: "bg-destructive/10 text-destructive border-destructive/20",
      needs_review: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      mastered: "متقن",
      good: "جيد",
      average: "متوسط",
      weak: "ضعيف",
      needs_review: "يحتاج مراجعة",
    };
    return labels[status] || status;
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "غير محدد";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جارٍ تحميل النتائج...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">لم يتم العثور على النتائج</p>
            <Link to="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { attempt, topicScores, analysis, startPoint } = results;
  const score = Number(attempt.score) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)] shadow-lg mb-4">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              نتيجة <span className="text-gradient">{attempt.student_name}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              تحليل شامل لمستوى الأداء ونقطة البداية المقترحة
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-card rounded-3xl border border-border/50 shadow-soft p-8 mb-8 animate-slide-up">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {/* Main Score */}
              <div className="md:col-span-1">
                <div className={`text-6xl font-extrabold ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <p className="text-muted-foreground mt-2">النتيجة الإجمالية</p>
              </div>

              {/* Stats */}
              <div className="md:col-span-3 grid grid-cols-3 gap-6">
                <div className="bg-success/10 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-2xl font-bold text-success">{attempt.correct_answers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">إجابات صحيحة</p>
                </div>

                <div className="bg-destructive/10 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-2xl font-bold text-destructive">
                      {attempt.total_questions - attempt.correct_answers}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">إجابات خاطئة</p>
                </div>

                <div className="bg-info/10 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-info" />
                    <span className="text-2xl font-bold text-info">
                      {formatTime(attempt.time_spent_seconds)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">الوقت المستغرق</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Topics Analysis */}
            <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">تحليل الوحدات</h2>
                    <p className="text-sm text-muted-foreground">مستوى الأداء في كل وحدة</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {topicScores.map((topic, index) => (
                    <div
                      key={topic.topic_id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{topic.topicName || "وحدة غير معروفة"}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(topic.status)}`}>
                          {getStatusLabel(topic.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={Number(topic.score)}
                          className="h-3 flex-1"
                        />
                        <span className={`font-bold text-sm min-w-[3rem] text-left ${getScoreColor(Number(topic.score))}`}>
                          {topic.score}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {topic.correct_answers} من {topic.total_questions} صحيحة
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Assessment */}
              {analysis && (
                <div className="bg-card rounded-2xl border border-border/50 p-6">
                  <h3 className="font-bold text-lg mb-4">التقييم العام</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.overall_assessment}
                  </p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              {/* Start Point */}
              <div className="bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)] rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6" />
                  <h3 className="font-bold text-lg">نقطة البداية المقترحة</h3>
                </div>
                <p className="text-primary-foreground/90 leading-relaxed">
                  {analysis?.start_point_description || startPoint || "سيتم تحديدها بناءً على التحليل"}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              {analysis && (analysis.strengths?.length > 0 || analysis.weaknesses?.length > 0) && (
                <div className="bg-card rounded-2xl border border-border/50 p-6">
                  {analysis.strengths?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold text-success mb-2">✓ نقاط القوة</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {analysis.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-destructive mb-2">✗ نقاط الضعف</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {analysis.weaknesses.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-card rounded-2xl border border-border/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-bold text-lg">التوصيات</h3>
                  </div>

                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button variant="hero" size="lg" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  تحميل التقرير PDF
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2">
                  <Share2 className="h-4 w-4" />
                  مشاركة النتيجة
                </Button>
                <Link to="/dashboard" className="block">
                  <Button variant="ghost" size="lg" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    العودة للوحة التحكم
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
