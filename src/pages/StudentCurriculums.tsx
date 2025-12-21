import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BookOpen, 
  Search, 
  FileText, 
  Download, 
  ExternalLink, 
  Loader2,
  GraduationCap,
  Brain,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Curriculum {
  id: string;
  name: string;
  subject: string;
  education_level: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  topics_count: number;
}

const StudentCurriculums = () => {
  const { user } = useAuth();
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    loadCurriculums();
  }, []);

  const loadCurriculums = async () => {
    try {
      const { data, error } = await supabase
        .from("curriculums")
        .select(`
          id,
          name,
          subject,
          education_level,
          file_url,
          file_name,
          created_at,
          topics(id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCurriculums = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        education_level: c.education_level,
        file_url: c.file_url,
        file_name: c.file_name,
        created_at: c.created_at,
        topics_count: Array.isArray(c.topics) ? c.topics.length : 0,
      }));

      setCurriculums(formattedCurriculums);
    } catch (error) {
      console.error("Error loading curriculums:", error);
      toast.error("فشل تحميل المناهج");
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      primary: "ابتدائي",
      preparatory: "إعدادي",
      secondary: "ثانوي",
      university: "جامعي",
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      primary: "bg-success/10 text-success border-success/20",
      preparatory: "bg-info/10 text-info border-info/20",
      secondary: "bg-warning/10 text-warning border-warning/20",
      university: "bg-primary/10 text-primary border-primary/20",
    };
    return colors[level] || "bg-muted text-muted-foreground";
  };

  const getFileIcon = (fileName: string | null) => {
    if (!fileName) return "📄";
    if (fileName.endsWith(".pdf")) return "📕";
    if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) return "📘";
    if (fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) return "📙";
    if (fileName.endsWith(".txt")) return "📝";
    return "📄";
  };

  const openFile = (fileUrl: string | null) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      toast.error("الملف غير متاح");
    }
  };

  const filteredCurriculums = curriculums.filter((c) => {
    const matchesSearch =
      c.name.includes(searchQuery) ||
      c.subject.includes(searchQuery);
    const matchesLevel = levelFilter === "all" || c.education_level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (isLoading) {
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

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient">المناهج</span> الدراسية
            </h1>
            <p className="text-muted-foreground">
              استعرض المناهج المتاحة واحصل على شرح مفصل بالذكاء الاصطناعي
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 animate-slide-up">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منهج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="المرحلة التعليمية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المراحل</SelectItem>
                <SelectItem value="primary">المرحلة الابتدائية</SelectItem>
                <SelectItem value="preparatory">المرحلة الإعدادية</SelectItem>
                <SelectItem value="secondary">المرحلة الثانوية</SelectItem>
                <SelectItem value="university">المرحلة الجامعية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Curriculums Grid */}
          {filteredCurriculums.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {searchQuery || levelFilter !== "all" 
                  ? "لا توجد نتائج مطابقة" 
                  : "لا توجد مناهج متاحة"}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery || levelFilter !== "all"
                  ? "جرب تغيير معايير البحث"
                  : "لم يتم رفع أي مناهج بعد"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCurriculums.map((curriculum, index) => (
                <Card
                  key={curriculum.id}
                  className="group hover:shadow-lg transition-all duration-300 animate-slide-up overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getFileIcon(curriculum.file_name)}</span>
                        <div>
                          <CardTitle className="text-lg line-clamp-1">
                            {curriculum.name}
                          </CardTitle>
                          <CardDescription>{curriculum.subject}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getLevelColor(curriculum.education_level)}>
                        {getLevelLabel(curriculum.education_level)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {curriculum.topics_count} وحدة
                      </span>
                    </div>

                    {curriculum.file_name && (
                      <div className="text-sm text-muted-foreground truncate">
                        <FileText className="h-4 w-4 inline ml-1" />
                        {curriculum.file_name}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {curriculum.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openFile(curriculum.file_url)}
                        >
                          <ExternalLink className="h-4 w-4 ml-1" />
                          فتح الملف
                        </Button>
                      )}
                      <Link to={`/student/explain?curriculumId=${curriculum.id}`} className="flex-1">
                        <Button
                          size="sm"
                          className="w-full bg-gradient-primary hover:opacity-90"
                        >
                          <Brain className="h-4 w-4 ml-1" />
                          شرح ذكي
                        </Button>
                      </Link>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      أُضيف في {new Date(curriculum.created_at).toLocaleDateString("ar-EG")}
                    </p>
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

export default StudentCurriculums;
