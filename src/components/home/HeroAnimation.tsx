import { useEffect, useRef } from "react";
import { BookOpen, Brain, Target, Sparkles, GraduationCap, BarChart3 } from "lucide-react";

const HeroAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      
      container.style.setProperty("--mouse-x", `${x * 20}px`);
      container.style.setProperty("--mouse-y", `${y * 20}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto aspect-square"
      style={{ "--mouse-x": "0px", "--mouse-y": "0px" } as React.CSSProperties}
    >
      {/* Main circular glow background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-info/10 to-accent/20 blur-3xl animate-pulse" />
      
      {/* Rotating outer ring */}
      <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow" />
      
      {/* Counter-rotating middle ring */}
      <div 
        className="absolute inset-12 rounded-full border border-info/30"
        style={{ animation: "spin 20s linear infinite reverse" }}
      />

      {/* Central brain/AI icon */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ 
          transform: `translate(calc(-50% + var(--mouse-x)), calc(-50% + var(--mouse-y)))`,
          transition: "transform 0.3s ease-out"
        }}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-2xl scale-150 animate-pulse" />
          
          {/* Main container */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-info flex items-center justify-center shadow-2xl shadow-primary/40">
            <Brain className="w-14 h-14 sm:w-16 sm:h-16 text-primary-foreground animate-pulse" />
          </div>
          
          {/* Orbiting sparkles */}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center animate-bounce shadow-lg shadow-accent/50">
            <Sparkles className="w-3 h-3 text-accent-foreground" />
          </div>
        </div>
      </div>

      {/* Floating educational icons */}
      {[
        { Icon: BookOpen, position: "top-8 left-8", delay: "0s", color: "bg-info" },
        { Icon: GraduationCap, position: "top-12 right-4", delay: "0.5s", color: "bg-primary" },
        { Icon: Target, position: "bottom-16 left-4", delay: "1s", color: "bg-accent" },
        { Icon: BarChart3, position: "bottom-8 right-12", delay: "1.5s", color: "bg-info" },
      ].map(({ Icon, position, delay, color }, index) => (
        <div
          key={index}
          className={`absolute ${position} animate-float`}
          style={{ 
            animationDelay: delay,
            transform: `translate(calc(var(--mouse-x) * ${0.5 + index * 0.2}), calc(var(--mouse-y) * ${0.5 + index * 0.2}))`,
            transition: "transform 0.4s ease-out"
          }}
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg backdrop-blur-sm`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
          </div>
        </div>
      ))}

      {/* Animated connecting lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Animated paths */}
        <path
          d="M 80 80 Q 200 120, 200 200"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="animate-dash"
        />
        <path
          d="M 320 100 Q 280 150, 200 200"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="animate-dash"
          style={{ animationDelay: "0.5s" }}
        />
        <path
          d="M 60 280 Q 130 240, 200 200"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="animate-dash"
          style={{ animationDelay: "1s" }}
        />
        <path
          d="M 320 300 Q 260 250, 200 200"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="animate-dash"
          style={{ animationDelay: "1.5s" }}
        />
      </svg>

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/40 animate-float-particle"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Data flow dots */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-accent animate-ping" />
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-info animate-ping" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: "2s" }} />
    </div>
  );
};

export default HeroAnimation;
