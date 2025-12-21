import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/use-parallax";
import HeroAnimation from "./HeroAnimation";

const HeroSection = () => {
  const parallaxOffset = useParallax({ speed: 0.2 });

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-background">
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content with parallax */}
      <div 
        className="container mx-auto px-4 py-12 relative z-20 transition-transform duration-100"
        style={{ transform: `translateY(${parallaxOffset * 0.15}px)` }}
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 backdrop-blur-sm mb-6 animate-fade-in"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">مدعوم بالذكاء الاصطناعي</span>
            </div>

            {/* Main Heading */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 animate-fade-in"
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
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              منصة تعليمية ذكية تحلل المنهج وتنشئ امتحانات تشخيصية مخصصة، 
              لتحديد نقطة البداية المثالية لكل طالب.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10 animate-fade-in"
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
              className="grid grid-cols-3 gap-3 sm:gap-6 max-w-md mx-auto lg:mx-0 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { value: "١٠٠٠+", label: "طالب مستفيد" },
                { value: "٥٠+", label: "منهج محلل" },
                { value: "٩٨٪", label: "دقة التقييم" },
              ].map((stat) => (
                <div 
                  key={stat.label} 
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-3 sm:p-4 rounded-xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors duration-300">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-0.5">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Animation */}
          <div 
            className="order-1 lg:order-2 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <HeroAnimation />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
