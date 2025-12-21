import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Clock, BookOpen, Play, CheckCircle } from "lucide-react";

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  duration_minutes: number;
  questions_per_topic: number;
  created_at: string;
  curriculum: {
    name: string;
    subject: string;
  };
  hasAttempt?: boolean;
  attemptScore?: number;
}

const Exams = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, [user]);

  const loadExams = async () => {
    try {
      // Get all exams
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select(`
          *,
          curriculums(name, subject)
        `)
        .order("created_at", { ascending: false });

      if (examsError) throw examsError;

      // Get user's attempts
      let userAttempts: Record<string, number> = {};
      if (user) {
        const { data: attempts } = await supabase
          .from("exam_attempts")
          .select("exam_id, score, status")
          .eq("user_id", user.id)
          .eq("status", "completed");

        if (attempts) {
          attempts.forEach((a) => {
            userAttempts[a.exam_id] = Number(a.score) || 0;
          });
        }
      }

      const formattedExams = (examsData || []).map((exam) => ({
        id: exam.id,
        title: exam.title,
        difficulty: exam.difficulty,
        duration_minutes: exam.duration_minutes,
        questions_per_topic: exam.questions_per_topic,
        created_at: exam.created_at,
        curriculum: exam.curriculums as { name: string; subject: string },
        hasAttempt: exam.id in userAttempts,
        attemptScore: userAttempts[exam.id],
      }));

      setExams(formattedExams);
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error("فشل تحميل الامتحانات");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-success/10 text-success border-success/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "hard":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "سهل";
      case "medium":
        return "متوسط";
      case "hard":
        return "صعب";
      default:
        return difficulty;
    }
  };

  const startExam = (examId: string) => {
    navigate(`/exam?examId=${examId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جارٍ تحميل الامتحانات...</p>
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
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient">الامتحانات</span> المتاحة
            </h1>
            <p className="text-muted-foreground">
              اختر امتحاناً لبدء التقييم ومعرفة مستواك
            </p>
          </div>

          {/* Exams Grid */}
          {exams.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">لا توجد امتحانات متاحة</h2>
              <p className="text-muted-foreground">
                لم يتم إنشاء أي امتحانات بعد. تواصل مع مدرسك لإضافة امتحانات.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, index) => (
                <Card
                  key={exam.id}
                  className="group hover:shadow-lg transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1">{exam.title}</CardTitle>
                        <CardDescription>
                          {exam.curriculum?.subject || "منهج دراسي"}
                        </CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(exam.difficulty)}>
                        {getDifficultyLabel(exam.difficulty)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{exam.duration_minutes} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{exam.curriculum?.name}</span>
                      </div>
                    </div>

                    {exam.hasAttempt ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">
                            اكتملت - {exam.attemptScore}%
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startExam(exam.id)}
                        >
                          إعادة المحاولة
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-primary hover:opacity-90"
                        onClick={() => startExam(exam.id)}
                      >
                        <Play className="h-4 w-4 ml-2" />
                        ابدأ الامتحان
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Exams;
