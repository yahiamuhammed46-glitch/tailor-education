import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
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

// Mock questions data
const mockQuestions = [
  {
    id: "1",
    type: "multipleChoice",
    topic: "المعادلات الخطية",
    question: "ما هو حل المعادلة: 2x + 5 = 15؟",
    options: ["x = 5", "x = 10", "x = 7.5", "x = 3"],
    correctAnswer: "x = 5",
  },
  {
    id: "2",
    type: "trueFalse",
    topic: "المعادلات الخطية",
    question: "المعادلة الخطية هي معادلة من الدرجة الأولى.",
    options: ["صح", "غلط"],
    correctAnswer: "صح",
  },
  {
    id: "3",
    type: "multipleChoice",
    topic: "المعادلات التربيعية",
    question: "ما هو التمييز (Δ) للمعادلة: x² - 4x + 4 = 0؟",
    options: ["Δ = 0", "Δ = 16", "Δ = -16", "Δ = 4"],
    correctAnswer: "Δ = 0",
  },
  {
    id: "4",
    type: "shortAnswer",
    topic: "الهندسة المستوية",
    question: "ما هو مجموع زوايا المثلث؟",
    correctAnswer: "180",
  },
  {
    id: "5",
    type: "multipleChoice",
    topic: "الهندسة المستوية",
    question: "ما هي مساحة مستطيل طوله 8 سم وعرضه 5 سم؟",
    options: ["40 سم²", "26 سم²", "13 سم²", "80 سم²"],
    correctAnswer: "40 سم²",
  },
];

const Exam = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const question = mockQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
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
  }, []);

  // Auto-save
  useEffect(() => {
    const saveTimer = setInterval(() => {
      localStorage.setItem("examAnswers", JSON.stringify(answers));
    }, 10000);

    return () => clearInterval(saveTimer);
  }, [answers]);

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
    if (index >= 0 && index < mockQuestions.length) {
      setCurrentQuestion(index);
    }
  };

  const handleSubmit = useCallback(() => {
    localStorage.removeItem("examAnswers");
    toast.success("تم تسليم الامتحان بنجاح!");
    navigate("/results");
  }, [navigate]);

  const getTimeColor = () => {
    if (timeLeft <= 60) return "text-destructive";
    if (timeLeft <= 300) return "text-warning";
    return "text-foreground";
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
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
                {currentQuestion + 1} / {mockQuestions.length}
              </span>
            </div>

            {/* Submit */}
            <Button variant="hero" size="sm" onClick={() => setShowSubmitDialog(true)}>
              تسليم الامتحان
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
                {question.topic}
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
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                  {currentQuestion + 1}
                </div>
                <h2 className="text-xl font-bold leading-relaxed">{question.question}</h2>
              </div>

              {/* Answer Options */}
              {question.type === "multipleChoice" || question.type === "trueFalse" ? (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {question.options?.map((option, index) => (
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

              {currentQuestion < mockQuestions.length - 1 ? (
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
                {mockQuestions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                      currentQuestion === index
                        ? "bg-primary text-primary-foreground shadow-glow"
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
                  <span className="font-bold">{answeredCount} / {mockQuestions.length}</span>
                </div>
                <Progress value={(answeredCount / mockQuestions.length) * 100} className="h-2" />
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
                أجبت على {answeredCount} من {mockQuestions.length} سؤال
              </p>
              {answeredCount < mockQuestions.length && (
                <p className="text-destructive">
                  ⚠️ لديك {mockQuestions.length - answeredCount} سؤال بدون إجابة
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>العودة للامتحان</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-gradient-primary">
              تسليم الامتحان
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exam;
