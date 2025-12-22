import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Image, 
  Presentation, 
  FileImage, 
  Loader2, 
  Download,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface VisualGeneratorProps {
  topic: string;
  context?: string;
}

interface Slide {
  type: "title" | "objectives" | "content" | "summary";
  title: string;
  content: string[];
  notes?: string;
}

interface GeneratedPresentation {
  slides: Slide[];
}

const VisualGenerator = ({ topic, context }: VisualGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string>("");
  const [presentation, setPresentation] = useState<GeneratedPresentation | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isPresentationDialogOpen, setIsPresentationDialogOpen] = useState(false);

  const generateVisual = async (type: "diagram" | "infographic" | "presentation") => {
    if (!topic.trim()) {
      toast.error("لا يوجد موضوع للتوليد");
      return;
    }

    setIsGenerating(type);

    try {
      const { data, error } = await supabase.functions.invoke("generate-visual", {
        body: { topic, type, context }
      });

      if (error) throw error;

      if (type === "presentation") {
        setPresentation(data.presentation);
        setCurrentSlide(0);
        setIsPresentationDialogOpen(true);
        toast.success("تم توليد العرض التقديمي بنجاح!");
      } else {
        setGeneratedImage(data.imageUrl);
        setImageDescription(data.description);
        setIsImageDialogOpen(true);
        toast.success(`تم توليد ${type === "diagram" ? "الرسم التوضيحي" : "الإنفوجرافيك"} بنجاح!`);
      }
    } catch (error) {
      console.error("Error generating visual:", error);
      toast.error("فشل توليد المحتوى المرئي");
    } finally {
      setIsGenerating(null);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `${topic.substring(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSlideBackground = (type: Slide["type"]) => {
    switch (type) {
      case "title":
        return "bg-gradient-to-br from-primary/20 to-primary/5";
      case "objectives":
        return "bg-gradient-to-br from-accent/20 to-accent/5";
      case "summary":
        return "bg-gradient-to-br from-secondary/40 to-secondary/20";
      default:
        return "bg-card";
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Image className="h-4 w-4" />
        توليد محتوى مرئي
      </h4>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateVisual("diagram")}
          disabled={isGenerating !== null}
          className="flex-1 min-w-[100px]"
        >
          {isGenerating === "diagram" ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <FileImage className="h-4 w-4 ml-2" />
          )}
          رسم توضيحي
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => generateVisual("infographic")}
          disabled={isGenerating !== null}
          className="flex-1 min-w-[100px]"
        >
          {isGenerating === "infographic" ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Image className="h-4 w-4 ml-2" />
          )}
          إنفوجرافيك
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => generateVisual("presentation")}
          disabled={isGenerating !== null}
          className="flex-1 min-w-[100px]"
        >
          {isGenerating === "presentation" ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Presentation className="h-4 w-4 ml-2" />
          )}
          عرض تقديمي
        </Button>
      </div>

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold truncate flex-1">{imageDescription}</span>
              <Button variant="default" size="sm" onClick={downloadImage} className="shrink-0">
                <Download className="h-4 w-4 ml-2" />
                تحميل الصورة
              </Button>
            </DialogTitle>
          </DialogHeader>
          {generatedImage && (
            <div className="mt-4 rounded-xl overflow-hidden border-2 border-border bg-muted/30 p-2">
              <img 
                src={generatedImage} 
                alt={imageDescription}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                style={{ direction: 'rtl' }}
              />
            </div>
          )}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              تم توليد هذه الصورة بالذكاء الاصطناعي بناءً على الموضوع المحدد
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Presentation Dialog */}
      <Dialog open={isPresentationDialogOpen} onOpenChange={setIsPresentationDialogOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col" dir="rtl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">العرض التقديمي</span>
              <div className="flex items-center gap-3">
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {presentation && `الشريحة ${currentSlide + 1} من ${presentation.slides.length}`}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {presentation && presentation.slides.length > 0 && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Slide Content */}
              <div className={`flex-1 rounded-xl p-8 shadow-inner ${getSlideBackground(presentation.slides[currentSlide].type)}`}>
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <h2 className={`font-bold mb-8 leading-relaxed ${
                    presentation.slides[currentSlide].type === "title" ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
                  }`}>
                    {presentation.slides[currentSlide].title}
                  </h2>
                  
                  <ul className="space-y-5 text-lg md:text-xl max-w-3xl w-full">
                    {presentation.slides[currentSlide].content.map((point, idx) => (
                      <li 
                        key={idx}
                        className={`flex items-start gap-4 animate-fade-in ${
                          presentation.slides[currentSlide].type === "title" ? "justify-center text-center" : "text-right"
                        }`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        {presentation.slides[currentSlide].type !== "title" && (
                          <span className="w-3 h-3 rounded-full bg-primary mt-2 shrink-0" />
                        )}
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 px-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                  className="gap-2"
                >
                  <ChevronRight className="h-5 w-5" />
                  السابق
                </Button>

                <div className="flex gap-2">
                  {presentation.slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? "bg-primary scale-125" : "bg-muted hover:bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentSlide(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                  disabled={currentSlide === presentation.slides.length - 1}
                  className="gap-2"
                >
                  التالي
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* Speaker Notes */}
              {presentation.slides[currentSlide].notes && (
                <div className="mt-4 p-4 bg-muted/70 rounded-xl border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">ملاحظات للمعلم:</strong> {presentation.slides[currentSlide].notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisualGenerator;
