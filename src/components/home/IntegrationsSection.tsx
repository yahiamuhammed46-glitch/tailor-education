import { useEffect, useState, useRef } from "react";
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

const IntegrationsSection = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [animatedLines, setAnimatedLines] = useState<number[]>([0, 1]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iconPositions, setIconPositions] = useState<number[]>([]);

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

  // Calculate icon positions for accurate line drawing
  useEffect(() => {
    const calculatePositions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const icons = container.querySelectorAll('.icon-box');
        const positions: number[] = [];
        
        icons.forEach((icon) => {
          const iconRect = icon.getBoundingClientRect();
          // Get center X position relative to container, as percentage
          const centerX = ((iconRect.left + iconRect.width / 2) - containerRect.left) / containerRect.width * 100;
          positions.push(centerX);
        });
        
        setIconPositions(positions);
      }
    };

    calculatePositions();
    window.addEventListener('resize', calculatePositions);
    return () => window.removeEventListener('resize', calculatePositions);
  }, []);

  return (
    <section className="relative py-20 bg-background overflow-hidden">
      {/* Grid pattern overlay */}
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

      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            أدوات تعليمية متكاملة
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            جميع الأدوات التي تحتاجها لتحليل المنهج وإنشاء امتحانات ذكية
          </p>
        </div>

        {/* Icons and Lines Container */}
        <div className="relative max-w-5xl mx-auto" ref={containerRef}>
          {/* Icons row */}
          <div className="flex justify-between items-center px-2 sm:px-4">
            {educationalIcons.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2"
                >
                  {/* Icon container */}
                  <div
                    className={`
                      icon-box relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                      rounded-xl flex items-center justify-center
                      transition-all duration-500 ease-out
                      ${isActive 
                        ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/30" 
                        : "bg-card/80 dark:bg-card/60 border border-border/50 hover:border-primary/30"
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7
                        transition-all duration-500
                        ${isActive 
                          ? "text-primary" 
                          : "text-muted-foreground/70"
                        }
                      `}
                    />
                    
                    {/* Glow effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md animate-pulse" />
                    )}
                  </div>
                  
                  {/* Label - hidden on small screens */}
                  <span className="hidden md:block text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* SVG Lines connecting to center */}
          <svg 
            className="w-full h-40 sm:h-48 md:h-56 mt-2"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {iconPositions.map((startX, index) => {
              const isAnimated = animatedLines.includes(index);
              const endX = 50;
              const endY = 95;
              
              // Create smooth curved path from icon to center point
              const controlY = 45;
              const path = `M ${startX} 0 Q ${startX} ${controlY}, ${endX} ${endY}`;
              
              return (
                <g key={index}>
                  {/* Background line */}
                  <path
                    d={path}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.4"
                    strokeOpacity="0.5"
                  />
                  
                  {/* Animated glowing line */}
                  {isAnimated && (
                    <path
                      d={path}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.6"
                      strokeOpacity="0.9"
                      style={{
                        filter: "drop-shadow(0 0 6px hsl(var(--primary)))",
                      }}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="150;0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dasharray"
                        values="0 150;75 75;0 150"
                        dur="1.5s"
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
              cy="95"
              r="2.5"
              fill="hsl(var(--primary))"
              className="animate-pulse"
              style={{
                filter: "drop-shadow(0 0 10px hsl(var(--primary)))",
              }}
            />
          </svg>
          
          {/* Central label */}
          <div className="flex justify-center -mt-2">
            <div className="px-6 py-3 bg-card/80 dark:bg-card/60 border border-border/50 rounded-xl backdrop-blur-sm shadow-lg">
              <span className="text-sm font-semibold text-foreground">منصة المستوى</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient glow effects */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-info/5 dark:bg-info/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />
    </section>
  );
};

export default IntegrationsSection;
