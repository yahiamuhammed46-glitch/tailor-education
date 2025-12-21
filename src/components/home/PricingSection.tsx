import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "مجاني",
    price: "٠",
    period: "للأبد",
    description: "للتجربة والاستكشاف",
    features: [
      "منهج واحد",
      "٣ امتحانات شهرياً",
      "تحليل أساسي للنتائج",
      "١٠ طلاب كحد أقصى",
      "دعم عبر البريد الإلكتروني"
    ],
    cta: "ابدأ مجاناً",
    popular: false
  },
  {
    name: "المعلم",
    price: "٤٩",
    period: "شهرياً",
    description: "للمعلمين المحترفين",
    features: [
      "مناهج غير محدودة",
      "امتحانات غير محدودة",
      "تحليل متقدم للنتائج",
      "١٠٠ طالب كحد أقصى",
      "شرح المفاهيم بالذكاء الاصطناعي",
      "تقارير تفصيلية",
      "دعم أولوي"
    ],
    cta: "اشترك الآن",
    popular: true
  },
  {
    name: "المؤسسات",
    price: "١٩٩",
    period: "شهرياً",
    description: "للمدارس والمؤسسات التعليمية",
    features: [
      "كل مميزات باقة المعلم",
      "معلمين غير محدودين",
      "طلاب غير محدودين",
      "لوحة تحكم إدارية",
      "تكامل مع أنظمة المدرسة",
      "تدريب وإعداد مخصص",
      "مدير حساب مخصص"
    ],
    cta: "تواصل معنا",
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-primary">الأسعار</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            خطط تناسب احتياجاتك
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اختر الخطة المناسبة لك وابدأ رحلتك مع التعليم الذكي
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`
                relative p-6 rounded-2xl transition-all duration-300
                ${plan.popular 
                  ? "bg-primary text-primary-foreground scale-105 shadow-2xl shadow-primary/25" 
                  : "bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg"
                }
              `}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    الأكثر شيوعاً
                  </div>
                </div>
              )}

              {/* Plan name */}
              <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "" : "text-foreground"}`}>
                {plan.name}
              </h3>
              
              {/* Description */}
              <p className={`text-sm mb-4 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? "" : "text-foreground"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm mr-1 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  ر.س / {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "" : "text-primary"}`} />
                    <span className={plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link to="/auth">
                <Button 
                  className={`w-full ${plan.popular ? "bg-background text-foreground hover:bg-background/90" : ""}`}
                  variant={plan.popular ? "secondary" : "default"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          جميع الأسعار بالريال السعودي. يمكنك إلغاء اشتراكك في أي وقت.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
