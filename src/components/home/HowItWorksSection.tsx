import { FileUp, Settings, PlayCircle, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "رفع المنهج",
    description: "ارفع ملف المنهج الدراسي وحدد المادة والمستوى التعليمي",
    color: "primary",
  },
  {
    icon: Settings,
    title: "إعداد الامتحان",
    description: "حدد عدد الأسئلة ومستوى الصعوبة ووقت الامتحان",
    color: "info",
  },
  {
    icon: PlayCircle,
    title: "أداء الامتحان",
    description: "الطالب يؤدي الامتحان مع عدّاد وقت وحفظ تلقائي",
    color: "warning",
  },
  {
    icon: BarChart3,
    title: "تحليل النتائج",
    description: "تقرير مفصّل عن مستوى الطالب ونقطة البداية المقترحة",
    color: "success",
  },
];

const colorClasses = {
  primary: {
    bg: "bg-primary",
    light: "bg-primary/10 dark:bg-primary/20",
    text: "text-primary",
    border: "border-primary/30",
    glow: "shadow-primary/20",
  },
  info: {
    bg: "bg-info",
    light: "bg-info/10 dark:bg-info/20",
    text: "text-info",
    border: "border-info/30",
    glow: "shadow-info/20",
  },
  warning: {
    bg: "bg-warning",
    light: "bg-warning/10 dark:bg-warning/20",
    text: "text-warning",
    border: "border-warning/30",
    glow: "shadow-warning/20",
  },
  success: {
    bg: "bg-success",
    light: "bg-success/10 dark:bg-success/20",
    text: "text-success",
    border: "border-success/30",
    glow: "shadow-success/20",
  },
};

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 dark:bg-info/20 border border-info/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-info animate-pulse" />
            <span className="text-sm font-medium text-info">خطوات بسيطة</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            كيف <span className="text-gradient">يعمل النظام؟</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            أربع خطوات بسيطة للوصول إلى تقييم دقيق لمستوى طلابك
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 md:gap-4 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/30 via-info/30 via-warning/30 to-success/30" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              const colors = colorClasses[step.color as keyof typeof colorClasses];

              return (
                <div
                  key={step.title}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step Card */}
                  <div className="group relative">
                    {/* Number badge */}
                    <div className={`absolute -top-3 right-4 z-20 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold text-sm shadow-lg ${colors.glow}`}>
                      {index + 1}
                    </div>

                    {/* Main card */}
                    <div className={`relative bg-card dark:bg-card/80 rounded-2xl border ${colors.border} p-6 pt-8 h-full hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm`}>
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl ${colors.light} flex items-center justify-center mb-4 mx-auto transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`h-8 w-8 ${colors.text}`} />
                      </div>

                      {/* Content */}
                      <div className="text-center">
                        <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4 md:hidden">
                      <div className={`w-0.5 h-8 ${colors.bg} opacity-30`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
