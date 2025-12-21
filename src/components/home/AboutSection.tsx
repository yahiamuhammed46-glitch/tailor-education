import { Users, Lightbulb, Shield, Award } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "الابتكار",
    description: "نستخدم أحدث تقنيات الذكاء الاصطناعي لتطوير أدوات تعليمية متقدمة"
  },
  {
    icon: Users,
    title: "التركيز على المستخدم",
    description: "نصمم حلولنا بناءً على احتياجات المعلمين والطلاب الفعلية"
  },
  {
    icon: Shield,
    title: "الموثوقية",
    description: "نضمن دقة التقييمات وسرية البيانات بأعلى معايير الجودة"
  },
  {
    icon: Award,
    title: "التميز",
    description: "نسعى دائماً لتقديم أفضل تجربة تعليمية ممكنة"
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-semibold text-primary">من نحن</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              نحن فريق متخصص في 
              <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> التعليم الذكي</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              منصة المستوى هي منصة تعليمية مبتكرة تهدف إلى تحسين جودة التعليم من خلال 
              استخدام الذكاء الاصطناعي لتحليل المناهج الدراسية وإنشاء امتحانات تشخيصية 
              مخصصة لكل طالب.
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              نؤمن بأن كل طالب فريد من نوعه، ولذلك نقدم أدوات ذكية تساعد المعلمين 
              على فهم مستوى طلابهم بدقة وتحديد نقاط البداية المثالية لكل منهم.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">+٥٠٠٠</div>
                <div className="text-sm text-muted-foreground">طالب مستفيد</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">+١٠٠</div>
                <div className="text-sm text-muted-foreground">معلم نشط</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">+٢٠٠</div>
                <div className="text-sm text-muted-foreground">منهج محلل</div>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-card/80 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
