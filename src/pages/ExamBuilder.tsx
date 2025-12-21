import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Clock, ListChecks, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  selected: boolean;
}

const ExamBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const curriculumId = searchParams.get("curriculumId");
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionsPerTopic, setQuestionsPerTopic] = useState(5);
  const [examDuration, setExamDuration] = useState(30);
  const [difficulty, setDifficulty] = useState([50]);
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
    shortAnswer: true,
    scenario: false,
  });
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [curriculumContent, setCurriculumContent] = useState("");

  useEffect(() => {
    if (curriculumId) {
      loadTopics();
    } else {
      // If no curriculum ID, redirect to upload
      toast.error("يرجى رفع منهج أولاً");
      navigate("/upload");
    }
  }, [curriculumId]);

  const loadTopics = async () => {
    try {
      const { data: topicsData, error } = await supabase
        .from("topics")
        .select("*")
        .eq("curriculum_id", curriculumId)
        .order("order_index");

      if (error) throw error;

      if (!topicsData || topicsData.length === 0) {
        toast.error("لم يتم العثور على وحدات. يرجى رفع منهج جديد.");
        navigate("/upload");
        return;
      }

      setTopics(topicsData.map(t => ({ ...t, selected: true })));

      // Get curriculum content for question generation
      const { data: curriculum } = await supabase
        .from("curriculums")
        .select("*")
        .eq("id", curriculumId)
        .single();

      if (curriculum) {
        setCurriculumContent(`${curriculum.name} - ${curriculum.subject}`);
      }
    } catch (error) {
      console.error("Error loading topics:", error);
      toast.error("فشل تحميل الوحدات");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTopicsCount = topics.filter((t) => t.selected).length;
  const totalQuestions = selectedTopicsCount * questionsPerTopic;

  const toggleTopic = (id: string) => {
    setTopics(topics.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)));
  };

  const getDifficultyLabel = (value: number) => {
    if (value < 33) return "سهل";
    if (value < 66) return "متوسط";
    return "صعب";
  };

  const getDifficultyValue = (value: number): string => {
    if (value < 33) return "easy";
    if (value < 66) return "medium";
    return "hard";
  };

  const handleGenerate = async () => {
    if (selectedTopicsCount === 0) {
      toast.error("يرجى اختيار وحدة واحدة على الأقل");
      return;
    }

    setIsGenerating(true);

    try {
      const selectedTopicIds = topics.filter(t => t.selected).map(t => t.id);

      // 1. Create exam record
      const { data: exam, error: examError } = await supabase
        .from("exams")
        .insert({
          curriculum_id: curriculumId,
          title: `امتحان تشخيصي - ${new Date().toLocaleDateString("ar-EG")}`,
          duration_minutes: examDuration,
          difficulty: getDifficultyValue(difficulty[0]),
          questions_per_topic: questionsPerTopic,
          shuffle_questions: shuffleQuestions,
        })
        .select()
        .single();

      if (examError) {
        console.error("Exam creation error:", examError);
        throw new Error("فشل إنشاء الامتحان");
      }

      toast.info("جارٍ توليد الأسئلة بالذكاء الاصطناعي...");

      // 2. Generate questions using AI
      const { data: questionsData, error: questionsError } = await supabase.functions.invoke(
        "generate-questions",
        {
          body: {
            examId: exam.id,
            topicIds: selectedTopicIds,
            questionsPerTopic,
            difficulty: getDifficultyValue(difficulty[0]),
            questionTypes,
            curriculumContent,
          },
        }
      );

      if (questionsError) {
        console.error("Questions generation error:", questionsError);
        throw new Error("فشل توليد الأسئلة");
      }

      toast.success(`تم إنشاء ${questionsData.questionsCount} سؤال بنجاح!`);
      
      // Navigate to exam page
      navigate(`/exam?examId=${exam.id}`);
      
    } catch (error) {
      console.error("Generate error:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الامتحان");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جارٍ تحميل الوحدات...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">يعمل بالذكاء الاصطناعي Gemini</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              بناء <span className="text-gradient">الامتحان التشخيصي</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              حدد إعدادات الامتحان وسيتم توليد أسئلة حقيقية من المنهج
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 animate-slide-up">
            {/* Topics Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ListChecks className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">الوحدات المستخرجة</h2>
                    <p className="text-sm text-muted-foreground">تم استخراج {topics.length} وحدة من المنهج</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {topics.map((topic) => (
                    <label
                      key={topic.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        topic.selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Checkbox
                        checked={topic.selected}
                        onCheckedChange={() => toggleTopic(topic.id)}
                      />
                      <div className="flex-1">
                        <span className="font-medium">{topic.name}</span>
                        {topic.description && (
                          <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">أنواع الأسئلة</h2>
                    <p className="text-sm text-muted-foreground">حدد أنواع الأسئلة المطلوبة</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "multipleChoice", label: "اختيار من متعدد", icon: "📝" },
                    { key: "trueFalse", label: "صح وغلط", icon: "✅" },
                    { key: "shortAnswer", label: "إجابة قصيرة", icon: "✍️" },
                    { key: "scenario", label: "أسئلة تطبيقية", icon: "💡" },
                  ].map((type) => (
                    <label
                      key={type.key}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        questionTypes[type.key as keyof typeof questionTypes]
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Checkbox
                        checked={questionTypes[type.key as keyof typeof questionTypes]}
                        onCheckedChange={(checked) =>
                          setQuestionTypes({ ...questionTypes, [type.key]: checked })
                        }
                      />
                      <span className="text-xl">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6 sticky top-24">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <h2 className="font-bold text-lg">إعدادات الامتحان</h2>
                </div>

                {/* Questions per topic */}
                <div className="space-y-3">
                  <Label className="text-base">عدد الأسئلة لكل وحدة</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={questionsPerTopic}
                    onChange={(e) => setQuestionsPerTopic(Number(e.target.value))}
                    className="h-12 text-center text-lg font-bold"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <Label className="text-base">مدة الامتحان (بالدقائق)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={180}
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="h-12 text-center text-lg font-bold"
                  />
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-base">مستوى الصعوبة</Label>
                    <span className={`font-bold ${
                      difficulty[0] < 33 ? "text-success" : 
                      difficulty[0] < 66 ? "text-warning" : "text-destructive"
                    }`}>
                      {getDifficultyLabel(difficulty[0])}
                    </span>
                  </div>
                  <Slider
                    value={difficulty}
                    onValueChange={setDifficulty}
                    max={100}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Shuffle */}
                <div className="flex items-center justify-between">
                  <Label className="text-base">خلط الأسئلة</Label>
                  <Switch
                    checked={shuffleQuestions}
                    onCheckedChange={setShuffleQuestions}
                  />
                </div>

                {/* Summary */}
                <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الوحدات المختارة</span>
                    <span className="font-bold">{selectedTopicsCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">إجمالي الأسئلة</span>
                    <span className="font-bold text-primary">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الوقت المتاح</span>
                    <span className="font-bold">{examDuration} دقيقة</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={selectedTopicsCount === 0 || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      جارٍ توليد الأسئلة...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 ml-2" />
                      إنشاء الامتحان
                      <ArrowLeft className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExamBuilder;
