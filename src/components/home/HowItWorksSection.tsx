import { ArrowDown, FileUp, Settings, PlayCircle, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "رفع المنهج",
    description: "ارفع ملف المنهج الدراسي وحدد المادة والمستوى التعليمي",
  },
  {
    icon: Settings,
    title: "إعداد الامتحان",
    description: "حدد عدد الأسئلة ومستوى الصعوبة ووقت الامتحان",
  },
  {
    icon: PlayCircle,
    title: "أداء الامتحان",
    description: "الطالب يؤدي الامتحان مع عدّاد وقت وحفظ تلقائي",
  },
  {
    icon: BarChart3,
    title: "تحليل النتائج",
    description: "تقرير مفصّل عن مستوى الطالب ونقطة البداية المقترحة",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            كيف <span className="text-gradient">يعمل النظام؟</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            أربع خطوات بسيطة للوصول إلى تقييم دقيق لمستوى طلابك
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex gap-4">
                    {/* Step Number */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                        <Icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm shadow-md">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4 md:hidden">
                      <ArrowDown className="h-6 w-6 text-primary/30" />
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
