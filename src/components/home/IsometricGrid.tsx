import { useEffect, useState } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  Brain, 
  Target, 
  BarChart3, 
  FileText, 
  Users, 
  Lightbulb,
  Award,
  Clock,
  CheckCircle,
  PenTool,
  Calculator,
  Globe,
  Microscope,
  Atom
} from "lucide-react";

const educationalIcons = [
  BookOpen,
  GraduationCap,
  Brain,
  Target,
  BarChart3,
  FileText,
  Users,
  Lightbulb,
  Award,
  Clock,
  CheckCircle,
  PenTool,
  Calculator,
  Globe,
  Microscope,
  Atom,
];

interface TileProps {
  icon: typeof BookOpen;
  index: number;
  activeIndex: number;
  row: number;
  col: number;
}

const Tile = ({ icon: Icon, index, activeIndex, row, col }: TileProps) => {
  const isActive = index === activeIndex;
  const isNearActive = Math.abs(index - activeIndex) <= 1;
  
  return (
    <div
      className="relative transition-all duration-700 ease-out"
      style={{
        transform: `
          rotateX(60deg) 
          rotateZ(-45deg) 
          translateZ(${isActive ? 30 : 0}px)
          scale(${isActive ? 1.1 : 1})
        `,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Tile base */}
      <div
        className={`
          relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl
          flex items-center justify-center
          transition-all duration-700 ease-out
          ${isActive 
            ? "bg-gradient-to-br from-primary to-primary/80 shadow-[0_0_40px_rgba(20,184,166,0.6)]" 
            : isNearActive
            ? "bg-card/60 dark:bg-card/40 border border-border/30"
            : "bg-card/30 dark:bg-card/20 border border-border/20"
          }
        `}
        style={{
          boxShadow: isActive 
            ? "0 20px 40px -10px rgba(20, 184, 166, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)" 
            : "0 10px 30px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <Icon 
          className={`
            w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 
            transition-all duration-500
            ${isActive 
              ? "text-primary-foreground drop-shadow-lg" 
              : "text-muted-foreground/40 dark:text-muted-foreground/30"
            }
          `}
        />
        
        {/* Glow effect for active tile */}
        {isActive && (
          <>
            <div className="absolute inset-0 rounded-xl bg-primary/30 animate-pulse" />
            <div className="absolute -inset-2 rounded-xl bg-primary/20 blur-xl animate-pulse" />
          </>
        )}
      </div>
      
      {/* 3D depth effect - left side */}
      <div
        className={`
          absolute top-full left-0 w-full h-3 sm:h-4
          transition-all duration-700
          ${isActive 
            ? "bg-primary/60" 
            : "bg-muted/30 dark:bg-muted/20"
          }
        `}
        style={{
          transform: "rotateX(-90deg) translateZ(0)",
          transformOrigin: "top",
        }}
      />
      
      {/* 3D depth effect - right side */}
      <div
        className={`
          absolute top-0 left-full w-3 sm:w-4 h-full
          transition-all duration-700
          ${isActive 
            ? "bg-primary/40" 
            : "bg-muted/20 dark:bg-muted/10"
          }
        `}
        style={{
          transform: "rotateY(90deg) translateZ(0)",
          transformOrigin: "left",
        }}
      />
    </div>
  );
};

const IsometricGrid = () => {
  const [activeIndex, setActiveIndex] = useState(5);
  const rows = 4;
  const cols = 6;
  const totalTiles = rows * cols;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalTiles);
    }, 2500);
    return () => clearInterval(interval);
  }, [totalTiles]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50 z-10" />
      
      {/* Isometric grid container */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3"
        style={{ 
          perspective: "1500px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div 
          className="grid gap-2 sm:gap-3 md:gap-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            transform: "rotateX(60deg) rotateZ(-45deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {Array.from({ length: totalTiles }).map((_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const IconComponent = educationalIcons[index % educationalIcons.length];
            
            return (
              <div
                key={index}
                style={{
                  animationDelay: `${(row + col) * 0.1}s`,
                }}
              >
                <Tile
                  icon={IconComponent}
                  index={index}
                  activeIndex={activeIndex}
                  row={row}
                  col={col}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/15 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-info/10 dark:bg-info/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
    </div>
  );
};

export default IsometricGrid;
