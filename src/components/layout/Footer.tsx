import { GraduationCap, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-gradient">تقييم ذكي</span>
          </Link>

          {/* Copyright */}
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            صُنع بـ <Heart className="h-4 w-4 text-destructive fill-destructive" /> للتعليم الأفضل
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <Link to="/upload" className="hover:text-primary transition-colors">رفع المنهج</Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
