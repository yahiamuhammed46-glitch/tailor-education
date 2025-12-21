import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, BookOpen, GraduationCap, UserCog } from "lucide-react";
import { z } from "zod";

type AppRole = "admin" | "teacher" | "student";

const authSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signIn, signUp, isLoading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("student");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (user && role) {
      // Redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else if (role === "student") {
        navigate("/student", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, role, navigate, from]);

  const validateForm = () => {
    try {
      if (isLogin) {
        authSchema.pick({ email: true, password: true }).parse({ email, password });
      } else {
        authSchema.parse({ email, password, fullName });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("تم تسجيل الدخول بنجاح!");
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("هذا البريد الإلكتروني مسجل بالفعل");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("تم إنشاء الحساب بنجاح!");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: "student", label: "طالب", icon: GraduationCap, description: "خوض الامتحانات ومتابعة النتائج" },
    { value: "teacher", label: "مدرس", icon: BookOpen, description: "رفع المناهج وإنشاء الامتحانات" },
    { value: "admin", label: "مدير", icon: UserCog, description: "إدارة كاملة للنظام" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">تقييم</span> الذكي
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "مرحباً بعودتك!" : "أنشئ حسابك الآن"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-lg animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                dir="ltr"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                dir="ltr"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedRole === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedRole(option.value as AppRole)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 mx-auto mb-2 ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {roleOptions.find((r) => r.value === selectedRole)?.description}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جارٍ التحميل...
                </>
              ) : isLogin ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-primary font-medium mr-2 hover:underline"
              >
                {isLogin ? "سجل الآن" : "سجل دخولك"}
              </button>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground"
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
