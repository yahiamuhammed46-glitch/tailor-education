import { Upload, Brain, Clock, BarChart3, Target, Users } from "lucide-react";
import { useRef } from "react";
import { useElementParallax } from "@/hooks/use-parallax";

const features = [
  {
    icon: Upload,
    title: "رفع المنهج بسهولة",
    description: "ارفع ملفاتك بصيغة PDF أو Word أو PowerPoint، وسيقوم النظام بتحليلها وتقسيمها تلقائياً.",
    gradient: "from-primary/20 to-info/20",
    iconBg: "bg-primary/15 dark:bg-primary/25",
    iconColor: "text-primary",
  },
  {
    icon: Brain,
    title: "توليد أسئلة ذكي",
    description: "أسئلة متنوعة يتم إنشاؤها تلقائياً باستخدام الذكاء الاصطناعي من Gemini.",
    gradient: "from-info/20 to-primary/20",
    iconBg: "bg-info/15 dark:bg-info/25",
    iconColor: "text-info",
  },
  {
    icon: Clock,
    title: "امتحانات بتوقيت",
    description: "عدّاد وقت مرئي مع حفظ تلقائي للإجابات ومنع الغش.",
    gradient: "from-warning/20 to-accent/20",
    iconBg: "bg-warning/15 dark:bg-warning/25",
    iconColor: "text-warning",
  },
  {
    icon: BarChart3,
    title: "تحليل مفصّل",
    description: "تقارير شاملة عن أداء كل طالب في كل وحدة من وحدات المنهج.",
    gradient: "from-success/20 to-primary/20",
    iconBg: "bg-success/15 dark:bg-success/25",
    iconColor: "text-success",
  },
  {
    icon: Target,
    title: "تحديد نقطة البداية",
    description: "اكتشف آخر نقطة مفهومة والوحدة المقترح بدء الشرح منها.",
    gradient: "from-destructive/20 to-warning/20",
    iconBg: "bg-destructive/15 dark:bg-destructive/25",
    iconColor: "text-destructive",
  },
  {
    icon: Users,
    title: "لوحة تحكم للمدرس",
    description: "إدارة شاملة للطلاب والنتائج مع اقتراحات خطط الشرح المخصصة.",
    gradient: "from-accent/20 to-warning/20",
    iconBg: "bg-accent/15 dark:bg-accent/25",
    iconColor: "text-accent",
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const parallax = useElementParallax(sectionRef, { speed: 0.2 });

  return (
    <section ref={sectionRef} className="py-24 bg-secondary/30 dark:bg-secondary/10 relative overflow-hidden">
      {/* Background decorations with parallax */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] transition-transform duration-100"
          style={{ transform: `translateY(${parallax.y * 0.5}px)` }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-[120px] transition-transform duration-100"
          style={{ transform: `translateY(${parallax.y * -0.3}px)` }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          className="text-center max-w-2xl mx-auto mb-16 animate-fade-in transition-all duration-100"
          style={{ 
            transform: `translateY(${parallax.y * 0.1}px)`,
            opacity: parallax.opacity 
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">مميزات المنصة</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            كل ما تحتاجه <span className="text-gradient">في منصة واحدة</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            أدوات متكاملة لتقييم مستوى الطلاب وتحديد نقطة البداية المثالية للشرح
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Card */}
                <div className="relative bg-card dark:bg-card/80 rounded-2xl border border-border/50 dark:border-border/30 p-6 h-full hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${feature.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                  {/* Decorative corner */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-border/20 dark:border-border/10 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-border/20 dark:border-border/10 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
