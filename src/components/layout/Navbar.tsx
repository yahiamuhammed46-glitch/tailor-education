import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getNavLinks = () => {
    const baseLinks = [{ path: "/", label: "الرئيسية" }];

    if (!user) {
      return baseLinks;
    }

    if (role === "teacher" || role === "admin") {
      return [
        ...baseLinks,
        { path: "/upload", label: "رفع المنهج" },
        { path: "/exam-builder", label: "بناء الامتحان" },
        { path: "/dashboard", label: "لوحة التحكم" },
      ];
    }

    if (role === "student") {
      return [
        ...baseLinks,
        { path: "/student", label: "لوحة التحكم" },
        { path: "/student/curriculums", label: "المناهج" },
        { path: "/student/explain", label: "الشرح الذكي" },
        { path: "/exams", label: "الامتحانات" },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getRoleLabel = () => {
    switch (role) {
      case "admin":
        return "مدير";
      case "teacher":
        return "مدرس";
      case "student":
        return "طالب";
      default:
        return "";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-110">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">تقييم ذكي</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? "default" : "ghost"}
                  size="sm"
                  className={isActive(link.path) ? "" : "text-muted-foreground hover:text-foreground"}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <span className="max-w-[100px] truncate">
                      {profile?.full_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2">
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    إنشاء حساب
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive(link.path) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-border/50 mt-2">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" className="w-full mt-2">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
