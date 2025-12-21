import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Sparkles, BookOpen, Target, BarChart3, Upload, Clock, Users, GraduationCap, Lightbulb, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParallax } from "@/hooks/use-parallax";

// Grid icons for the creative background
const gridIcons = [
  { icon: Brain, delay: 0 },
  { icon: BookOpen, delay: 0.1 },
  { icon: Target, delay: 0.2 },
  { icon: BarChart3, delay: 0.3 },
  { icon: Upload, delay: 0.4 },
  { icon: Clock, delay: 0.5 },
  { icon: Users, delay: 0.6 },
  { icon: GraduationCap, delay: 0.7 },
  { icon: Lightbulb, delay: 0.8 },
  { icon: Award, delay: 0.9 },
  { icon: Sparkles, delay: 1.0 },
  { icon: Brain, delay: 1.1 },
];

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(5);
  const parallaxOffset = useParallax({ speed: 0.3 });
  const parallaxOffsetSlow = useParallax({ speed: 0.15 });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 12);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[95vh] flex items-center bg-background">
      {/* Creative 3D Grid Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10" />
        
        {/* Animated grid with parallax */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-4 -rotate-12 scale-125 sm:scale-150 opacity-40 dark:opacity-60 transition-transform duration-100"
          style={{ 
            perspective: "1000px",
            transform: `translate(-50%, calc(-50% + ${parallaxOffsetSlow}px))`
          }}
        >
          {[...Array(16)].map((_, i) => {
            const IconComponent = gridIcons[i % gridIcons.length].icon;
            const isActive = i === activeIndex;
            const isNearActive = Math.abs(i - activeIndex) <= 1 || Math.abs(i - activeIndex) >= 15;
            
            return (
              <div
                key={i}
                className={`
                  relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl 
                  flex items-center justify-center
                  transition-all duration-700 ease-out
                  ${isActive 
                    ? "bg-gradient-to-br from-accent to-accent/80 shadow-2xl shadow-accent/40 scale-110 z-10" 
                    : isNearActive
                    ? "bg-card/80 dark:bg-card/60 border border-border/50 shadow-lg"
                    : "bg-card/40 dark:bg-card/30 border border-border/30"
                  }
                `}
                style={{
                  transform: `
                    perspective(1000px) 
                    rotateX(${isActive ? 0 : 15}deg) 
                    rotateY(${isActive ? 0 : -10}deg)
                    translateZ(${isActive ? 30 : 0}px)
                    scale(${isActive ? 1.1 : 1})
                  `,
                  animationDelay: `${gridIcons[i % gridIcons.length].delay}s`,
                }}
              >
                <IconComponent 
                  className={`
                    w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-all duration-500
                    ${isActive 
                      ? "text-accent-foreground scale-110" 
                      : "text-muted-foreground/50 dark:text-muted-foreground/40"
                    }
                  `}
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl animate-pulse bg-accent/20" />
                )}
              </div>
            );
          })}
        </div>

        {/* Glow effects with parallax */}
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse-slow transition-transform duration-100"
          style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/10 dark:bg-accent/15 rounded-full blur-[100px] animate-pulse-slow transition-transform duration-100" 
          style={{ 
            animationDelay: "2s",
            transform: `translateY(${parallaxOffset * 0.8}px)`
          }} 
        />
      </div>

      {/* Content with parallax */}
      <div 
        className="container mx-auto px-4 py-20 relative z-10 transition-transform duration-100"
        style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 backdrop-blur-sm mb-8 animate-fade-in"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">مدعوم بالذكاء الاصطناعي</span>
          </div>

          {/* Main Heading */}
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-foreground">اكتشف مستوى طلابك</span>
            <br />
            <span className="text-gradient bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent">
              بدقة متناهية
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            منصة تعليمية ذكية تحلل المنهج وتنشئ امتحانات تشخيصية مخصصة، 
            لتحديد نقطة البداية المثالية لكل طالب.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link to="/upload">
              <Button variant="hero" size="xl" className="gap-3 group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                ابدأ الآن مجاناً
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="xl" 
                className="gap-3 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300"
              >
                <BarChart3 className="h-5 w-5" />
                استعرض النتائج
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div 
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { value: "١٠٠٠+", label: "طالب مستفيد" },
              { value: "٥٠+", label: "منهج محلل" },
              { value: "٩٨٪", label: "دقة التقييم" },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-4 sm:p-6 rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
