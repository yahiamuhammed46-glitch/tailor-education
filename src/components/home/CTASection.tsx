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
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-info dark:from-primary/90 dark:via-primary/80 dark:to-info/90" />
      
      {/* Decorative elements with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] transition-transform duration-100"
          style={{ transform: `translate(50%, calc(-50% + ${scrollOffset * 0.5}px))` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-[80px] transition-transform duration-100"
          style={{ transform: `translate(-50%, calc(50% + ${scrollOffset * 0.3}px))` }}
        />
        
        {/* Floating shapes with parallax */}
        <div 
          className="absolute top-20 right-20 w-4 h-4 bg-white/20 rounded-full animate-float transition-transform duration-100"
          style={{ transform: `translateY(${scrollOffset * 0.8}px)` }}
        />
        <div 
          className="absolute bottom-32 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-float transition-transform duration-100" 
          style={{ animationDelay: "1s", transform: `translateY(${scrollOffset * 0.6}px)` }}
        />
        <div 
          className="absolute top-1/3 left-16 w-2 h-2 bg-white/25 rounded-full animate-float transition-transform duration-100" 
          style={{ animationDelay: "2s", transform: `translateY(${scrollOffset * 0.4}px)` }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main content card with parallax */}
          <div 
            className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 text-center transition-all duration-100"
            style={{ 
              transform: `translateY(${parallax.y * 0.1}px) scale(${parallax.scale})`,
              opacity: parallax.opacity 
            }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">ابدأ مجاناً اليوم</span>
            </div>

            {/* Heading */}
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              اكتشف مستوى طلابك
              <br />
              وحقق نتائج أفضل
            </h2>

            {/* Description */}
            <p 
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              انضم لأكثر من ألف معلم يستخدمون منصتنا لتقييم طلابهم وتحديد نقطة البداية المثالية للشرح.
            </p>

            {/* Benefits list */}
            <div 
              className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm text-white font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div 
              className="flex flex-wrap justify-center gap-4 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link to="/upload">
                <Button 
                  size="xl" 
                  className="bg-white text-primary hover:bg-white/90 gap-3 shadow-xl shadow-black/20 group"
                >
                  ارفع منهجك الآن
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/exams">
                <Button 
                  variant="outline" 
                  size="xl"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
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
