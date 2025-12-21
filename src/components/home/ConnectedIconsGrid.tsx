import { useEffect, useState, useMemo } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  Brain, 
  Target, 
  BarChart3, 
  FileText, 
  Lightbulb,
  Award,
  PenTool,
  Calculator
} from "lucide-react";

const educationalIcons = [
  { icon: BookOpen, label: "المنهج" },
  { icon: GraduationCap, label: "التخرج" },
  { icon: Brain, label: "الذكاء" },
  { icon: Target, label: "الأهداف" },
  { icon: BarChart3, label: "التحليل" },
  { icon: FileText, label: "الامتحان" },
  { icon: Lightbulb, label: "الأفكار" },
  { icon: Award, label: "الإنجاز" },
  { icon: PenTool, label: "الكتابة" },
  { icon: Calculator, label: "الحساب" },
];

const ConnectedIconsGrid = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [animatedLines, setAnimatedLines] = useState<number[]>([0, 1]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % educationalIcons.length);
      setAnimatedLines((prev) => {
        const next = prev.map(i => (i + 1) % educationalIcons.length);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate line paths
  const linePaths = useMemo(() => {
    return educationalIcons.map((_, index) => {
      const totalIcons = educationalIcons.length;
      const iconSpacing = 100 / (totalIcons + 1);
      const startX = iconSpacing * (index + 1);
      const startY = 0;
      const endX = 50;
      const endY = 100;
      
      // Create curved path
      const controlY = 50;
      return `M ${startX} ${startY} Q ${startX} ${controlY}, ${endX} ${endY}`;
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main content container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        {/* Icons row */}
        <div className="relative w-full max-w-5xl px-4">
          <div className="flex justify-between items-center">
            {educationalIcons.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;
              const isAnimatedLine = animatedLines.includes(index);
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2"
                >
                  {/* Icon container */}
                  <div
                    className={`
                      relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                      rounded-xl flex items-center justify-center
                      transition-all duration-500 ease-out
                      ${isActive 
                        ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/30" 
                        : "bg-card/60 dark:bg-card/40 border border-border/50"
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7
                        transition-all duration-500
                        ${isActive 
                          ? "text-primary" 
                          : "text-muted-foreground/60"
                        }
                      `}
                    />
                    
                    {/* Glow effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* SVG Lines connecting to center */}
          <svg 
            className="absolute top-full left-0 w-full h-48 sm:h-56 md:h-64"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {linePaths.map((path, index) => {
              const isAnimated = animatedLines.includes(index);
              
              return (
                <g key={index}>
                  {/* Background line */}
                  <path
                    d={path}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.3"
                    strokeOpacity="0.3"
                  />
                  
                  {/* Animated glowing line */}
                  {isAnimated && (
                    <path
                      d={path}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.5"
                      strokeOpacity="0.8"
                      className="animate-pulse"
                      style={{
                        filter: "drop-shadow(0 0 4px hsl(var(--primary)))",
                      }}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="100;0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dasharray"
                        values="0 100;50 50;0 100"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}
                </g>
              );
            })}
            
            {/* Central convergence point glow */}
            <circle
              cx="50"
              cy="100"
              r="2"
              fill="hsl(var(--primary))"
              className="animate-pulse"
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary)))",
              }}
            />
          </svg>
        </div>
      </div>

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-info/5 dark:bg-info/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
    </div>
  );
};

export default ConnectedIconsGrid;
