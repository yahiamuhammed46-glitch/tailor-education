import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-primary opacity-95" />
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">ابدأ مجاناً اليوم</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight">
            اكتشف مستوى طلابك
            <br />
            وحقق نتائج أفضل
          </h2>

          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
            انضم لأكثر من ألف معلم يستخدمون منصتنا لتقييم طلابهم وتحديد نقطة البداية المثالية للشرح.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/upload">
              <Button 
                size="xl" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-3"
              >
                ارفع منهجك الآن
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/exam">
              <Button 
                variant="outline" 
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                جرّب امتحان تجريبي
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
