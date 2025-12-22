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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{imageDescription}</span>
              <Button variant="outline" size="sm" onClick={downloadImage}>
                <Download className="h-4 w-4 ml-2" />
                تحميل
              </Button>
            </DialogTitle>
          </DialogHeader>
          {generatedImage && (
            <div className="mt-4 rounded-lg overflow-hidden border">
              <img 
                src={generatedImage} 
                alt={imageDescription}
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Presentation Dialog */}
      <Dialog open={isPresentationDialogOpen} onOpenChange={setIsPresentationDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>العرض التقديمي</span>
              <span className="text-sm text-muted-foreground">
                {presentation && `${currentSlide + 1} / ${presentation.slides.length}`}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {presentation && presentation.slides.length > 0 && (
            <div className="flex-1 flex flex-col">
              {/* Slide Content */}
              <div className={`flex-1 rounded-lg p-8 ${getSlideBackground(presentation.slides[currentSlide].type)}`}>
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <h2 className={`font-bold mb-6 ${
                    presentation.slides[currentSlide].type === "title" ? "text-4xl" : "text-2xl"
                  }`}>
                    {presentation.slides[currentSlide].title}
                  </h2>
                  
                  <ul className="space-y-4 text-lg max-w-2xl">
                    {presentation.slides[currentSlide].content.map((point, idx) => (
                      <li 
                        key={idx}
                        className={`flex items-start gap-3 ${
                          presentation.slides[currentSlide].type === "title" ? "justify-center" : ""
                        }`}
                      >
                        {presentation.slides[currentSlide].type !== "title" && (
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        )}
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                >
                  <ChevronRight className="h-4 w-4 ml-2" />
                  السابق
                </Button>

                <div className="flex gap-1">
                  {presentation.slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentSlide ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                  disabled={currentSlide === presentation.slides.length - 1}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 mr-2" />
                </Button>
              </div>

              {/* Speaker Notes */}
              {presentation.slides[currentSlide].notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>ملاحظات:</strong> {presentation.slides[currentSlide].notes}
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
