import { FileSearch, Brain, ClipboardCheck, BarChart3, Users, Sparkles } from "lucide-react";

const services = [
  {
    icon: FileSearch,
    title: "تحليل المناهج",
    description: "رفع المنهج الدراسي وتحليله بالذكاء الاصطناعي لاستخراج الموضوعات والمفاهيم الأساسية",
    features: ["تحليل تلقائي للمحتوى", "استخراج الموضوعات", "تصنيف المفاهيم"]
  },
  {
    icon: Brain,
    title: "إنشاء أسئلة ذكية",
    description: "توليد أسئلة متنوعة ومخصصة لكل موضوع بمستويات صعوبة مختلفة",
    features: ["أسئلة اختيار من متعدد", "أسئلة صح وخطأ", "أسئلة مقالية"]
  },
  {
    icon: ClipboardCheck,
    title: "امتحانات تشخيصية",
    description: "إنشاء امتحانات تشخيصية لتحديد مستوى الطالب ونقاط القوة والضعف",
    features: ["تقييم شامل", "تحديد الفجوات", "نقطة بداية مثالية"]
  },
  {
    icon: BarChart3,
    title: "تحليل النتائج",
    description: "تقارير تفصيلية عن أداء الطلاب مع توصيات مخصصة للتحسين",
    features: ["تقارير مفصلة", "رسوم بيانية", "توصيات ذكية"]
  },
  {
    icon: Users,
    title: "إدارة الطلاب",
    description: "متابعة تقدم الطلاب وإدارة الفصول الدراسية بسهولة",
    features: ["ملفات الطلاب", "تتبع التقدم", "إحصائيات الأداء"]
  },
  {
    icon: Sparkles,
    title: "شرح المفاهيم",
    description: "شرح تفصيلي بالذكاء الاصطناعي للمفاهيم التي يحتاج الطالب لمراجعتها",
    features: ["شرح تفاعلي", "أمثلة توضيحية", "تمارين إضافية"]
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-primary">خدماتنا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            كل ما تحتاجه في منصة واحدة
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نقدم مجموعة متكاملة من الأدوات التعليمية الذكية لمساعدة المعلمين والطلاب
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  
                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
