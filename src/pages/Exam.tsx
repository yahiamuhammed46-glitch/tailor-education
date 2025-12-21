import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  options: string[] | null;
  topic: {
    id: string;
    name: string;
  };
}

const Exam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    if (examId) {
      loadExam();
    } else {
      toast.error("لم يتم تحديد امتحان");
      navigate("/");
    }
  }, [examId]);

  const loadExam = async () => {
    try {
      // Get exam details
      const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) throw examError;

      setTimeLeft(exam.duration_minutes * 60);

      // Get questions with topics
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select(`
          id,
          question_type,
          question_text,
          options,
          topic:topics(id, name)
        `)
        .eq("exam_id", examId)
        .order("order_index");

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        toast.error("لا توجد أسئلة في هذا الامتحان");
        navigate("/");
        return;
      }

      // Transform the data to match our interface
      const formattedQuestions = questionsData.map(q => ({
        ...q,
        topic: Array.isArray(q.topic) ? q.topic[0] : q.topic
      }));

      setQuestions(formattedQuestions as Question[]);
    } catch (error) {
      console.error("Error loading exam:", error);
      toast.error("فشل تحميل الامتحان");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const startExam = async () => {
    if (!studentName.trim()) {
      toast.error("يرجى إدخال اسمك");
      return;
    }

    try {
      // Create exam attempt
      const { data: attempt, error } = await supabase
        .from("exam_attempts")
        .insert({
          exam_id: examId,
          student_name: studentName.trim(),
          student_email: studentEmail.trim() || null,
          total_questions: questions.length,
        })
        .select()
        .single();

      if (error) throw error;

      setAttemptId(attempt.id);
      setShowStartDialog(false);
      setExamStarted(true);
      toast.success("بدأ الامتحان! بالتوفيق 🎯");
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("فشل بدء الامتحان");
    }
  };

  // Timer
  useEffect(() => {
    if (!examStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        if (prev === 300 && !showTimeWarning) {
          setShowTimeWarning(true);
          toast.warning("تبقى 5 دقائق فقط!");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted]);

  // Auto-save answers
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    const saveAnswers = async () => {
      const answersToSave = Object.entries(answers).map(([questionId, answer]) => ({
        attempt_id: attemptId,
        question_id: questionId,
        answer,
      }));

      for (const ans of answersToSave) {
        await supabase
          .from("student_answers")
          .upsert(ans, { onConflict: "attempt_id,question_id" });
      }
    };

    const saveTimer = setTimeout(saveAnswers, 2000);
    return () => clearTimeout(saveTimer);
  }, [answers, attemptId]);

  const question = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(question.id)) {
      newFlagged.delete(question.id);
    } else {
      newFlagged.add(question.id);
    }
    setFlagged(newFlagged);
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;

    setIsSubmitting(true);

    try {
      // Save all remaining answers
      const answersToSave = Object.entries(answers).map(([questionId, answer]) => ({
        attempt_id: attemptId,
        question_id: questionId,
        answer,
      }));

      for (const ans of answersToSave) {
        await supabase
          .from("student_answers")
          .upsert(ans, { onConflict: "attempt_id,question_id" });
      }

      toast.info("جارٍ تحليل النتائج...");

      // Call analyze-results function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-results",
        { body: { attemptId } }
      );

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw new Error("فشل تحليل النتائج");
      }

      toast.success("تم تسليم الامتحان بنجاح!");
      navigate(`/results?attemptId=${attemptId}`);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("حدث خطأ أثناء التسليم");
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, answers, navigate]);

  const getTimeColor = () => {
    if (timeLeft <= 60) return "text-destructive";
    if (timeLeft <= 300) return "text-warning";
    return "text-foreground";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جارٍ تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Start Dialog */}
      <AlertDialog open={showStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">مرحباً بك في الامتحان التشخيصي</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <p>قبل البدء، يرجى إدخال بياناتك:</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>الاسم الكامل *</Label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني (اختياري)</Label>
                  <Input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                <p className="font-medium mb-2">معلومات الامتحان:</p>
                <ul className="text-sm space-y-1">
                  <li>• عدد الأسئلة: {questions.length}</li>
                  <li>• المدة: {Math.floor(timeLeft / 60)} دقيقة</li>
                  <li>• سيتم حفظ إجاباتك تلقائياً</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate("/")}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={startExam} className="bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)]">
              ابدأ الامتحان
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {examStarted && question && (
        <>
          {/* Header */}
          <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-soft">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Timer */}
                <div className={`flex items-center gap-2 text-xl font-bold ${getTimeColor()}`}>
                  <Clock className="h-5 w-5" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>

                {/* Progress */}
                <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
                  <Progress value={progress} className="h-2" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>

                {/* Submit */}
                <Button 
                  variant="hero" 
                  size="sm" 
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "تسليم الامتحان"
                  )}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Question */}
              <div className="lg:col-span-3 space-y-6 animate-fade-in">
                {/* Topic Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {question.topic?.name || "موضوع عام"}
                  </span>
                  <Button
                    variant={flagged.has(question.id) ? "destructive" : "ghost"}
                    size="sm"
                    onClick={toggleFlag}
                    className="gap-2"
                  >
                    <Flag className="h-4 w-4" />
                    {flagged.has(question.id) ? "تم التعليم" : "علّم للمراجعة"}
                  </Button>
                </div>

                {/* Question Card */}
                <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-soft">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)] flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                      {currentQuestion + 1}
                    </div>
                    <h2 className="text-xl font-bold leading-relaxed">{question.question_text}</h2>
                  </div>

                  {/* Answer Options */}
                  {question.question_type === "multipleChoice" || question.question_type === "trueFalse" ? (
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={handleAnswer}
                      className="space-y-3"
                    >
                      {(question.options || []).map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            answers[question.id] === option
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                            {option}
                          </Label>
                        </label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Textarea
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="اكتب إجابتك هنا..."
                      className="min-h-[120px] text-base"
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => goToQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>

                  {currentQuestion < questions.length - 1 ? (
                    <Button
                      variant="default"
                      onClick={() => goToQuestion(currentQuestion + 1)}
                      className="gap-2"
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="hero"
                      onClick={() => setShowSubmitDialog(true)}
                      className="gap-2"
                      disabled={isSubmitting}
                    >
                      تسليم الامتحان
                    </Button>
                  )}
                </div>
              </div>

              {/* Question Navigator */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-24">
                  <h3 className="font-bold mb-4">الأسئلة</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                          currentQuestion === index
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : answers[q.id]
                            ? "bg-success/20 text-success border border-success/30"
                            : flagged.has(q.id)
                            ? "bg-warning/20 text-warning border border-warning/30"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
                      <span className="text-muted-foreground">تم الإجابة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
                      <span className="text-muted-foreground">معلّم للمراجعة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-secondary" />
                      <span className="text-muted-foreground">لم يتم الإجابة</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">تم الإجابة</span>
                      <span className="font-bold">{answeredCount} / {questions.length}</span>
                    </div>
                    <Progress value={(answeredCount / questions.length) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Submit Dialog */}
          <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  تأكيد تسليم الامتحان
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>هل أنت متأكد من تسليم الامتحان؟</p>
                  <p className="font-medium">
                    أجبت على {answeredCount} من {questions.length} سؤال
                  </p>
                  {answeredCount < questions.length && (
                    <p className="text-destructive">
                      ⚠️ لديك {questions.length - answeredCount} سؤال بدون إجابة
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>العودة للامتحان</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSubmit} 
                  className="bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جارٍ التسليم...
                    </>
                  ) : (
                    "تسليم الامتحان"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default Exam;
