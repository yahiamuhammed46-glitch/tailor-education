import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useElementParallax, useParallax } from "@/hooks/use-parallax";

const benefits = [
  "تحليل شامل للمنهج",
  "أسئلة ذكية مخصصة",
  "تقارير مفصلة",
  "دعم فني متواصل",
];

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const parallax = useElementParallax(sectionRef, { speed: 0.2 });
  const scrollOffset = useParallax({ speed: 0.1, direction: "down" });

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-info dark:from-primary/90 dark:via-primary/80 dark:to-info/90" />
      
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] transition-transform duration-100"
          style={{ transform: `translate(30%, calc(-30% + ${scrollOffset * 0.3}px))` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-48 h-48 bg-info/10 rounded-full blur-[60px] transition-transform duration-100"
          style={{ transform: `translate(-30%, calc(30% + ${scrollOffset * 0.2}px))` }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Main content card - more compact */}
          <div 
            className="bg-white/5 dark:bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8 text-center transition-all duration-100"
            style={{ 
              transform: `translateY(${parallax.y * 0.05}px)`,
              opacity: parallax.opacity 
            }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-semibold text-white">ابدأ مجاناً اليوم</span>
            </div>

            {/* Heading - smaller */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
              اكتشف مستوى طلابك وحقق نتائج أفضل
            </h2>

            {/* Description - more compact */}
            <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto mb-5">
              انضم لأكثر من ألف معلم يستخدمون منصتنا لتقييم طلابهم وتحديد نقطة البداية المثالية للشرح.
            </p>

            {/* Benefits list - smaller pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {benefits.map((benefit) => (
                <div 
                  key={benefit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs text-white/90 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons - smaller */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/upload">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 gap-2 shadow-lg shadow-black/10 group text-sm"
                >
                  ارفع منهجك الآن
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/exams">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-sm"
                >
                  جرّب امتحان تجريبي
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
