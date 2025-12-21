import { Link } from "react-router-dom";
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
  Share2
} from "lucide-react";

// Mock results data
const mockResults = {
  score: 72,
  totalQuestions: 15,
  correctAnswers: 11,
  wrongAnswers: 4,
  timeTaken: "18:32",
  startPoint: "الوحدة الثالثة: الهندسة المستوية",
  topics: [
    { name: "المعادلات الخطية", score: 95, status: "متقن", color: "success" },
    { name: "المعادلات التربيعية", score: 80, status: "جيد", color: "success" },
    { name: "الهندسة المستوية", score: 60, status: "متوسط", color: "warning" },
    { name: "حساب المثلثات", score: 45, status: "ضعيف", color: "destructive" },
    { name: "الإحصاء والاحتمالات", score: 30, status: "يحتاج مراجعة", color: "destructive" },
  ],
  recommendations: [
    "ابدأ الشرح من الوحدة الثالثة: الهندسة المستوية",
    "راجع أساسيات حساب المثلثات قبل التعمق",
    "الوحدتان الأولى والثانية لا تحتاجان شرحاً مفصلاً",
  ],
};

const Results = () => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = (color: string) => {
    const colors: Record<string, string> = {
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      destructive: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[color] || colors.success;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary shadow-glow mb-4">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              نتيجة <span className="text-gradient">الامتحان التشخيصي</span>
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
                <div className={`text-6xl font-extrabold ${getScoreColor(mockResults.score)}`}>
                  {mockResults.score}%
                </div>
                <p className="text-muted-foreground mt-2">النتيجة الإجمالية</p>
              </div>

              {/* Stats */}
              <div className="md:col-span-3 grid grid-cols-3 gap-6">
                <div className="bg-success/10 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-2xl font-bold text-success">{mockResults.correctAnswers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">إجابات صحيحة</p>
                </div>

                <div className="bg-destructive/10 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-2xl font-bold text-destructive">{mockResults.wrongAnswers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">إجابات خاطئة</p>
                </div>

                <div className="bg-info/10 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-info" />
                    <span className="text-2xl font-bold text-info">{mockResults.timeTaken}</span>
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
                  {mockResults.topics.map((topic, index) => (
                    <div
                      key={topic.name}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{topic.name}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(topic.color)}`}>
                          {topic.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={topic.score}
                          className="h-3 flex-1"
                        />
                        <span className={`font-bold text-sm min-w-[3rem] text-left ${getScoreColor(topic.score)}`}>
                          {topic.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              {/* Start Point */}
              <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6" />
                  <h3 className="font-bold text-lg">نقطة البداية المقترحة</h3>
                </div>
                <p className="text-primary-foreground/90 leading-relaxed">
                  {mockResults.startPoint}
                </p>
              </div>

              {/* Recommendations */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg">التوصيات</h3>
                </div>

                <ul className="space-y-3">
                  {mockResults.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

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
