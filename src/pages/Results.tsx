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
  Clock,
  ArrowLeft,
  Download,
  Share2,
  Loader2,
  Award,
  Flame,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  BarChart3,
  Brain,
  Zap,
  Star
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
  examDurationMinutes?: number;
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
      const { data: attempt, error: attemptError } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          exam:exams(duration_minutes, title)
        `)
        .eq("id", attemptId)
        .single();

      if (attemptError) throw attemptError;

      const { data: topicScores, error: scoresError } = await supabase
        .from("topic_scores")
        .select(`
          *,
          topic:topics(name)
        `)
        .eq("attempt_id", attemptId);

      if (scoresError) throw scoresError;

      const { data: analysis, error: analysisError } = await supabase
        .from("analysis_reports")
        .select(`
          *,
          start_point_topic:topics(name)
        `)
        .eq("attempt_id", attemptId)
        .maybeSingle();

      const formattedTopicScores = (topicScores || []).map(ts => ({
        ...ts,
        topicName: Array.isArray(ts.topic) ? ts.topic[0]?.name : ts.topic?.name,
      }));

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

      const examData = Array.isArray(attempt.exam) ? attempt.exam[0] : attempt.exam;

      setResults({
        attempt,
        topicScores: formattedTopicScores,
        analysis: formattedAnalysis,
        startPoint: startPointName || null,
        examDurationMinutes: examData?.duration_minutes,
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

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  const getStatusBg = (status: string) => {
    const colors: Record<string, string> = {
      mastered: "bg-success/10 text-success border-success/30",
      good: "bg-success/10 text-success border-success/30",
      average: "bg-warning/10 text-warning border-warning/30",
      weak: "bg-destructive/10 text-destructive border-destructive/30",
      needs_review: "bg-destructive/10 text-destructive border-destructive/30",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mastered":
      case "good":
        return <Star className="h-4 w-4" />;
      case "average":
        return <Zap className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
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

  const formatTimeDetailed = (seconds: number | null) => {
    if (!seconds) return { mins: 0, secs: 0 };
    return {
      mins: Math.floor(seconds / 60),
      secs: seconds % 60
    };
  };

  const getGradeInfo = (score: number) => {
    if (score >= 90) return { grade: "A+", label: "ممتاز", color: "text-success", emoji: "🏆" };
    if (score >= 80) return { grade: "A", label: "جيد جداً", color: "text-success", emoji: "🌟" };
    if (score >= 70) return { grade: "B", label: "جيد", color: "text-info", emoji: "👍" };
    if (score >= 60) return { grade: "C", label: "مقبول", color: "text-warning", emoji: "📚" };
    return { grade: "D", label: "يحتاج تحسين", color: "text-destructive", emoji: "💪" };
  };

  const getTimeAnalysis = (spentSeconds: number | null, durationMinutes: number | undefined) => {
    if (!spentSeconds || !durationMinutes) return null;
    const totalSeconds = durationMinutes * 60;
    const percentage = (spentSeconds / totalSeconds) * 100;
    
    if (percentage < 50) {
      return { status: "سريع جداً", message: "أنهيت الامتحان بسرعة، تأكد من مراجعة إجاباتك", color: "text-warning" };
    } else if (percentage < 80) {
      return { status: "وقت مناسب", message: "استخدمت الوقت بشكل جيد", color: "text-success" };
    } else if (percentage < 100) {
      return { status: "استغللت الوقت", message: "أخذت وقتك في التفكير، هذا جيد!", color: "text-info" };
    }
    return { status: "انتهى الوقت", message: "حاول إدارة وقتك بشكل أفضل", color: "text-destructive" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
              <Brain className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-muted-foreground mt-6 text-lg">جارٍ تحليل نتائجك...</p>
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

  const { attempt, topicScores, analysis, startPoint, examDurationMinutes } = results;
  const score = Number(attempt.score) || 0;
  const gradeInfo = getGradeInfo(score);
  const timeDetails = formatTimeDetailed(attempt.time_spent_seconds);
  const timeAnalysis = getTimeAnalysis(attempt.time_spent_seconds, examDurationMinutes);

  const weakTopics = topicScores.filter(t => t.status === 'weak' || t.status === 'needs_review');
  const strongTopics = topicScores.filter(t => t.status === 'mastered' || t.status === 'good');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)] shadow-lg shadow-primary/30 mb-6 animate-scale-in">
              <Trophy className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              أحسنت يا <span className="text-gradient">{attempt.student_name}</span>! {gradeInfo.emoji}
            </h1>
            <p className="text-muted-foreground text-lg">
              إليك تحليل شامل لأدائك مع توصيات مخصصة لتحسين مستواك
            </p>
          </div>

          {/* Main Score Card */}
          <div className="bg-card rounded-3xl border border-border/50 shadow-lg overflow-hidden mb-8 animate-slide-up">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border/50">
              {/* Score Section */}
              <div className="p-8 text-center">
                <div className="relative inline-block mb-4">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted/30"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${score * 4.4} 440`}
                      strokeLinecap="round"
                      className={getScoreColor(score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-extrabold ${getScoreColor(score)}`}>
                      {score}%
                    </span>
                    <span className={`text-sm font-medium ${gradeInfo.color}`}>
                      {gradeInfo.grade} - {gradeInfo.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-lg font-bold text-success">{attempt.correct_answers}</span>
                    <span className="text-muted-foreground text-sm">صحيحة</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-lg font-bold text-destructive">
                      {attempt.total_questions - attempt.correct_answers}
                    </span>
                    <span className="text-muted-foreground text-sm">خاطئة</span>
                  </div>
                </div>
              </div>

              {/* Time Section */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">تحليل الوقت</h3>
                    <p className="text-sm text-muted-foreground">كيف استخدمت وقتك</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {timeDetails.mins}<span className="text-lg">د</span> {timeDetails.secs}<span className="text-lg">ث</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">الوقت المستغرق</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {examDurationMinutes || "—"}<span className="text-lg">د</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">المدة المحددة</p>
                  </div>
                </div>

                {timeAnalysis && (
                  <div className={`flex items-start gap-3 p-3 rounded-xl bg-muted/30`}>
                    <Zap className={`h-5 w-5 mt-0.5 ${timeAnalysis.color}`} />
                    <div>
                      <p className={`font-medium ${timeAnalysis.color}`}>{timeAnalysis.status}</p>
                      <p className="text-sm text-muted-foreground">{timeAnalysis.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl border border-border/50 p-5 text-center animate-slide-up" style={{ animationDelay: "0.05s" }}>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{topicScores.length}</div>
              <p className="text-sm text-muted-foreground">وحدات</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-5 text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-success" />
              </div>
              <div className="text-2xl font-bold text-success">{strongTopics.length}</div>
              <p className="text-sm text-muted-foreground">وحدات متقنة</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-5 text-center animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <Flame className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-destructive">{weakTopics.length}</div>
              <p className="text-sm text-muted-foreground">تحتاج مراجعة</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-5 text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <div className="text-2xl font-bold">{attempt.total_questions}</div>
              <p className="text-sm text-muted-foreground">سؤال</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Topics Analysis - Left Side */}
            <div className="lg:col-span-3 space-y-6">
              {/* Topics Performance */}
              <div className="bg-card rounded-2xl border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">تحليل الوحدات التفصيلي</h2>
                    <p className="text-sm text-muted-foreground">مستوى أدائك في كل وحدة</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {topicScores.map((topic, index) => (
                    <div
                      key={topic.topic_id}
                      className={`p-4 rounded-2xl border ${getScoreBg(Number(topic.score))} animate-fade-in`}
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`p-2 rounded-xl ${getStatusBg(topic.status)}`}>
                            {getStatusIcon(topic.status)}
                          </span>
                          <div>
                            <span className="font-bold text-lg">{topic.topicName || "وحدة غير معروفة"}</span>
                            <p className="text-sm text-muted-foreground">
                              {topic.correct_answers} من {topic.total_questions} إجابات صحيحة
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className={`text-2xl font-extrabold ${getScoreColor(Number(topic.score))}`}>
                            {topic.score}%
                          </span>
                          <p className={`text-xs font-medium ${getStatusBg(topic.status).replace('bg-', 'text-').split(' ')[0].replace('10', '')}`}>
                            {getStatusLabel(topic.status)}
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={Number(topic.score)}
                        className="h-2.5"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Assessment */}
              {analysis?.overall_assessment && (
                <div className="bg-card rounded-2xl border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">التقييم العام</h3>
                      <p className="text-sm text-muted-foreground">تحليل شامل لمستواك</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {analysis.overall_assessment}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Start Point */}
              <div className="bg-gradient-to-br from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)] rounded-2xl p-6 text-primary-foreground shadow-lg shadow-primary/20 animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">ابدأ من هنا! 🚀</h3>
                    <p className="text-primary-foreground/80 text-sm">نقطة البداية المقترحة</p>
                  </div>
                </div>
                <p className="text-primary-foreground/90 leading-relaxed">
                  {analysis?.start_point_description || startPoint || "راجع الوحدات التي تحتاج تحسين وابدأ بها تدريجياً"}
                </p>
              </div>

              {/* Topics to Study */}
              {weakTopics.length > 0 && (
                <div className="bg-card rounded-2xl border border-destructive/20 p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">الوحدات المطلوب مذاكرتها</h3>
                      <p className="text-sm text-muted-foreground">ركز على هذه الوحدات أولاً</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {weakTopics.map((topic, i) => (
                      <li key={topic.topic_id} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-xl">
                        <span className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <span className="font-medium">{topic.topicName}</span>
                          <p className="text-xs text-muted-foreground">{topic.score}% - {getStatusLabel(topic.status)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              {analysis && (analysis.strengths?.length > 0 || analysis.weaknesses?.length > 0) && (
                <div className="bg-card rounded-2xl border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "0.25s" }}>
                  {analysis.strengths?.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <h4 className="font-bold text-success">نقاط القوة</h4>
                      </div>
                      <ul className="space-y-2">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-success mt-1">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.weaknesses?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <h4 className="font-bold text-destructive">نقاط الضعف</h4>
                      </div>
                      <ul className="space-y-2">
                        {analysis.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-destructive mt-1">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-card rounded-2xl border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">توصيات لتحسين مستواك</h3>
                      <p className="text-sm text-muted-foreground">اتبع هذه الخطوات</p>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)] text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground pt-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.35s" }}>
                <Button variant="hero" size="lg" className="w-full gap-2 h-14 text-base">
                  <Download className="h-5 w-5" />
                  تحميل التقرير PDF
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2 h-12">
                  <Share2 className="h-4 w-4" />
                  مشاركة النتيجة
                </Button>
                <Link to="/student-dashboard" className="block">
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