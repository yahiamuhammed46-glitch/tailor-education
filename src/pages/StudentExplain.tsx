import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, 
  Send, 
  Loader2, 
  BookOpen,
  Sparkles,
  User,
  Bot,
  Trash2,
  Volume2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VoicePlayer from "@/components/VoicePlayer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Topic {
  id: string;
  name: string;
  description: string | null;
}

interface Curriculum {
  id: string;
  name: string;
  subject: string;
  content: string | null;
  topics: Topic[];
}

const StudentExplain = () => {
  const [searchParams] = useSearchParams();
  const initialCurriculumId = searchParams.get("curriculumId");
  
  const { user } = useAuth();
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>(initialCurriculumId || "");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCurriculums, setIsLoadingCurriculums] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurriculums();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadCurriculums = async () => {
    try {
      const { data, error } = await supabase
        .from("curriculums")
        .select(`
          id,
          name,
          subject,
          content,
          topics(id, name, description)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCurriculums(data || []);
      
      if (initialCurriculumId && data) {
        const found = data.find((c) => c.id === initialCurriculumId);
        if (found) {
          setSelectedCurriculum(found.id);
        }
      }
    } catch (error) {
      console.error("Error loading curriculums:", error);
      toast.error("فشل تحميل المناهج");
    } finally {
      setIsLoadingCurriculums(false);
    }
  };

  const selectedCurriculumData = curriculums.find((c) => c.id === selectedCurriculum);
  const topics = selectedCurriculumData?.topics || [];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!selectedCurriculum) {
      toast.error("يرجى اختيار منهج أولاً");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("explain-topic", {
        body: {
          question: userMessage,
          curriculumId: selectedCurriculum,
          topicId: selectedTopic || null,
          conversationHistory: messages.slice(-6), // Last 6 messages for context
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.explanation },
      ]);
    } catch (error) {
      console.error("Error getting explanation:", error);
      toast.error("فشل الحصول على الشرح");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "عذراً، حدث خطأ أثناء توليد الشرح. يرجى المحاولة مرة أخرى." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestedQuestions = [
    "اشرح لي هذا الموضوع بالتفصيل",
    "ما هي النقاط الرئيسية التي يجب أن أفهمها؟",
    "أعطني أمثلة عملية",
    "ما هي الأخطاء الشائعة في هذا الموضوع؟",
  ];

  if (isLoadingCurriculums) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جارٍ تحميل المناهج...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 py-6">
        <div className="container mx-auto px-4 h-full">
          <div className="grid lg:grid-cols-4 gap-6 h-full">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="animate-fade-in">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    اختر المنهج
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر منهجاً" />
                    </SelectTrigger>
                    <SelectContent>
                      {curriculums.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {topics.length > 0 && (
                    <Select value={selectedTopic} onValueChange={(val) => setSelectedTopic(val === "all" ? "" : val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر وحدة (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الوحدات</SelectItem>
                        {topics.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* Suggested Questions */}
              <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-accent" />
                    أسئلة مقترحة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-right h-auto py-2 px-3"
                      onClick={() => setInput(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-12rem)] animate-slide-up">
              <CardHeader className="border-b flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">الشرح الذكي</CardTitle>
                    <CardDescription>اسأل أي سؤال عن المنهج</CardDescription>
                  </div>
                </div>
                {messages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearChat}>
                    <Trash2 className="h-4 w-4 ml-1" />
                    مسح المحادثة
                  </Button>
                )}
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <Brain className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">مرحباً بك في الشرح الذكي</h3>
                      <p className="text-muted-foreground text-sm">
                        اختر منهجاً من القائمة ثم اسأل أي سؤال عنه وسأقوم بشرحه لك بالتفصيل
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          
                          {/* Voice Player for assistant messages */}
                          {msg.role === "assistant" && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <VoicePlayer text={msg.content} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-card border border-border rounded-2xl px-4 py-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب سؤالك هنا..."
                    className="min-h-[48px] max-h-[120px] resize-none"
                    disabled={isLoading || !selectedCurriculum}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim() || !selectedCurriculum}
                    className="bg-gradient-primary hover:opacity-90 h-12 w-12 shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentExplain;
