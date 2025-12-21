import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  }, []);

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || "");
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const validateAndSetFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.ms-powerpoint",
      "text/plain",
    ];

    // Allow text files for demo purposes
    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      toast.error("نوع الملف غير مدعوم. يرجى رفع ملف PDF أو Word أو PowerPoint أو نص.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت.");
      return;
    }

    setFile(file);
    
    // Extract text content for analysis
    try {
      const content = await extractTextFromFile(file);
      setFileContent(content);
      toast.success("تم تحميل الملف بنجاح!");
    } catch (error) {
      // For PDF/DOCX, we'll use a placeholder since browser can't read them directly
      setFileContent(`ملف: ${file.name}\n\nمحتوى المنهج الدراسي - سيتم تحليله بواسطة الذكاء الاصطناعي`);
      toast.success("تم تحميل الملف بنجاح!");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileContent("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !subjectName || !educationLevel) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("curriculums")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("فشل رفع الملف");
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("curriculums")
        .getPublicUrl(fileName);

      // 2. Create curriculum record
      const { data: curriculum, error: curriculumError } = await supabase
        .from("curriculums")
        .insert({
          name: subjectName,
          subject: subjectName,
          education_level: educationLevel,
          file_url: publicUrl,
          file_name: file.name,
        })
        .select()
        .single();

      if (curriculumError) {
        console.error("Curriculum error:", curriculumError);
        throw new Error("فشل حفظ بيانات المنهج");
      }

      toast.info("جارٍ تحليل المنهج بالذكاء الاصطناعي...");

      // 3. Call AI to analyze curriculum and extract topics
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-curriculum",
        {
          body: {
            curriculumId: curriculum.id,
            fileContent: fileContent || `المادة: ${subjectName}\nالمستوى: ${educationLevel}\nمنهج دراسي شامل يتضمن عدة وحدات ومواضيع`,
            fileName: file.name,
          },
        }
      );

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw new Error("فشل تحليل المنهج");
      }

      toast.success(`تم استخراج ${analysisData.topics?.length || 0} وحدة من المنهج!`);
      
      // Navigate to exam builder with curriculum ID
      navigate(`/exam-builder?curriculumId=${curriculum.id}`);
      
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء رفع المنهج");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("presentation") || type.includes("powerpoint")) return "📊";
    return "📁";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              رفع <span className="text-gradient">المنهج الدراسي</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              ارفع ملف المنهج وسيقوم الذكاء الاصطناعي بتحليله واستخراج الوحدات
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : file
                  ? "border-success bg-success/5"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getFileIcon(file.type)}</div>
                    <div>
                      <p className="font-semibold text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    اسحب الملف هنا أو اضغط للاختيار
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF, Word, PowerPoint, TXT (الحد الأقصى 50 ميجابايت)
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleFileInput}
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="h-4 w-4 ml-2" />
                      اختر ملفاً
                    </label>
                  </Button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-medium">
                  اسم المادة
                </Label>
                <Input
                  id="subject"
                  placeholder="مثال: الرياضيات، الفيزياء، اللغة العربية"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-base font-medium">
                  المستوى التعليمي
                </Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر المستوى التعليمي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">المرحلة الابتدائية</SelectItem>
                    <SelectItem value="preparatory">المرحلة الإعدادية</SelectItem>
                    <SelectItem value="secondary">المرحلة الثانوية</SelectItem>
                    <SelectItem value="university">المرحلة الجامعية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={!file || !subjectName || !educationLevel || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جارٍ الرفع والتحليل...
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5 ml-2" />
                  رفع وتحليل المنهج
                </>
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Upload;
