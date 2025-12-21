import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero min-h-[90vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-info/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">مدعوم بالذكاء الاصطناعي</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-foreground">اكتشف مستوى طلابك</span>
              <br />
              <span className="text-gradient">بدقة متناهية</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              منصة تعليمية ذكية تحلل المنهج وتنشئ امتحانات تشخيصية مخصصة، 
              لتحديد نقطة البداية المثالية لكل طالب.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/upload">
                <Button variant="hero" size="xl" className="gap-3">
                  ابدأ الآن مجاناً
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="xl">
                  استعرض النتائج
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {[
                { value: "١٠٠٠+", label: "طالب" },
                { value: "٥٠+", label: "منهج" },
                { value: "٩٨٪", label: "دقة التقييم" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Brain className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">تحليل ذكي للمنهج</h3>
                    <p className="text-sm text-muted-foreground">يعتمد على Gemini AI</p>
                  </div>
                </div>

                {/* Progress Items */}
                <div className="space-y-4">
                  {[
                    { topic: "الوحدة الأولى: المعادلات", progress: 95, status: "متقن" },
                    { topic: "الوحدة الثانية: الهندسة", progress: 70, status: "متوسط" },
                    { topic: "الوحدة الثالثة: الإحصاء", progress: 40, status: "يحتاج مراجعة" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.topic}</span>
                        <span className={`font-semibold ${
                          item.progress >= 80 ? "text-success" : 
                          item.progress >= 60 ? "text-warning" : "text-destructive"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.progress >= 80 ? "bg-success" : 
                            item.progress >= 60 ? "bg-warning" : "bg-destructive"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-soft border border-border/50 p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">نقطة البداية</div>
                    <div className="font-bold text-sm">الوحدة الثالثة</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-soft border border-border/50 p-4 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">أسئلة مولدة</div>
                    <div className="font-bold text-sm">٢٥ سؤال</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
