import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  ClipboardList, 
  TrendingUp, 
  Trophy, 
  Clock,
  ChevronLeft,
  Loader2,
  GraduationCap,
  FileText,
  Brain
} from "lucide-react";

interface ExamAttempt {
  id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  exam: {
    title: string;
  };
}

interface Stats {
  totalExams: number;
  averageScore: number;
  bestScore: number;
  totalTime: number;
}

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      const { data: attemptsData, error } = await supabase
        .from("exam_attempts")
        .select(`
          id,
          score,
          total_questions,
          correct_answers,
          completed_at,
          time_spent_seconds,
          exams(title)
        `)
        .eq("user_id", user?.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedAttempts = (attemptsData || []).map((a) => ({
        id: a.id,
        score: Number(a.score) || 0,
        total_questions: a.total_questions,
        correct_answers: a.correct_answers,
        completed_at: a.completed_at || "",
        exam: { title: (a.exams as any)?.title || "امتحان" },
      }));

      setAttempts(formattedAttempts);

      // Calculate stats
      const total = formattedAttempts.length;
      const avgScore = total > 0
        ? Math.round(formattedAttempts.reduce((sum, a) => sum + a.score, 0) / total)
        : 0;
      const best = total > 0
        ? Math.max(...formattedAttempts.map((a) => a.score))
        : 0;
      const totalTime = (attemptsData || []).reduce(
        (sum, a) => sum + (a.time_spent_seconds || 0),
        0
      );

      setStats({
        totalExams: total,
        averageScore: avgScore,
        bestScore: best,
        totalTime,
      });
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} ساعة ${mins} دقيقة`;
    return `${mins} دقيقة`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const quickLinks = [
    { 
      title: "الامتحانات المتاحة", 
      description: "ابدأ امتحان جديد", 
      icon: ClipboardList, 
      href: "/exams",
      color: "primary"
    },
    { 
      title: "المناهج الدراسية", 
      description: "استعرض المناهج المتاحة", 
      icon: BookOpen, 
      href: "/student/curriculums",
      color: "info"
    },
    { 
      title: "الشرح الذكي", 
      description: "احصل على شرح بالذكاء الاصطناعي", 
      icon: Brain, 
      href: "/student/explain",
      color: "accent"
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جارٍ تحميل البيانات...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  مرحباً، <span className="text-gradient">{profile?.full_name || "طالب"}</span>
                </h1>
                <p className="text-muted-foreground">تابع تقدمك وابدأ امتحانات جديدة</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "الامتحانات", value: stats.totalExams, icon: ClipboardList, color: "primary" },
              { label: "متوسط النتائج", value: `${stats.averageScore}%`, icon: TrendingUp, color: "info" },
              { label: "أفضل نتيجة", value: `${stats.bestScore}%`, icon: Trophy, color: "success" },
              { label: "وقت الدراسة", value: formatTime(stats.totalTime), icon: Clock, color: "warning" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.label} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 text-${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} to={link.href}>
                  <Card 
                    className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer group"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-${link.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 text-${link.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{link.title}</h3>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Recent Exams */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                آخر الامتحانات
              </CardTitle>
              <CardDescription>نتائج امتحاناتك الأخيرة</CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">لم تخض أي امتحانات بعد</p>
                  <Link to="/exams">
                    <Button className="bg-gradient-primary">ابدأ امتحانك الأول</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className={`text-lg font-bold ${getScoreColor(attempt.score)}`}>
                            {attempt.score}%
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{attempt.exam.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {attempt.correct_answers} من {attempt.total_questions} صحيحة
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleDateString("ar-EG")}
                        </p>
                        <Link to={`/results?attemptId=${attempt.id}`}>
                          <Button variant="ghost" size="sm" className="mt-1">
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
