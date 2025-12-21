import { Upload, Brain, Clock, BarChart3, Target, Users } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "رفع المنهج بسهولة",
    description: "ارفع ملفاتك بصيغة PDF أو Word أو PowerPoint، وسيقوم النظام بتحليلها وتقسيمها تلقائياً.",
    color: "primary",
  },
  {
    icon: Brain,
    title: "توليد أسئلة ذكي",
    description: "أسئلة متنوعة يتم إنشاؤها تلقائياً باستخدام الذكاء الاصطناعي من Gemini.",
    color: "info",
  },
  {
    icon: Clock,
    title: "امتحانات بتوقيت",
    description: "عدّاد وقت مرئي مع حفظ تلقائي للإجابات ومنع الغش.",
    color: "warning",
  },
  {
    icon: BarChart3,
    title: "تحليل مفصّل",
    description: "تقارير شاملة عن أداء كل طالب في كل وحدة من وحدات المنهج.",
    color: "success",
  },
  {
    icon: Target,
    title: "تحديد نقطة البداية",
    description: "اكتشف آخر نقطة مفهومة والوحدة المقترح بدء الشرح منها.",
    color: "destructive",
  },
  {
    icon: Users,
    title: "لوحة تحكم للمدرس",
    description: "إدارة شاملة للطلاب والنتائج مع اقتراحات خطط الشرح المخصصة.",
    color: "accent",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
            const colorClasses = {
              primary: "bg-primary/10 text-primary",
              info: "bg-info/10 text-info",
              warning: "bg-warning/10 text-warning",
              success: "bg-success/10 text-success",
              destructive: "bg-destructive/10 text-destructive",
              accent: "bg-accent/10 text-accent",
            };

            return (
              <div
                key={feature.title}
                className="group bg-card rounded-2xl border border-border/50 p-6 hover:shadow-soft transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]} transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
