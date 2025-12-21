import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Search, 
  Filter,
  ChevronDown,
  Eye,
  Download,
  MoreVertical,
  Loader2,
  FileText,
  ClipboardList
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface StudentResult {
  id: string;
  student_name: string;
  student_email: string | null;
  score: number;
  total_questions: number;
  correct_answers: number;
  status: string;
  started_at: string;
  analysis_report?: {
    start_point_description: string | null;
  };
}

interface Curriculum {
  id: string;
  name: string;
  subject: string;
  education_level: string;
  created_at: string;
  topics_count?: number;
}

interface ExamData {
  id: string;
  title: string;
  difficulty: string;
  duration_minutes: number;
  created_at: string;
  curriculum_name: string;
  attempts_count: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [exams, setExams] = useState<ExamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const [stats, setStats] = useState({
    totalStudents: 0,
    completedExams: 0,
    averageScore: 0,
    totalCurriculums: 0,
    totalExams: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get all exam attempts
      const { data: attempts, error } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          analysis_reports(start_point_description)
        `)
        .eq("status", "completed")
        .order("started_at", { ascending: false });

      if (error) throw error;

      const formattedStudents = (attempts || []).map(attempt => {
        const analysisReports = attempt.analysis_reports;
        const analysisReport = Array.isArray(analysisReports) 
          ? analysisReports[0] 
          : analysisReports;
        
        return {
          id: attempt.id,
          student_name: attempt.student_name,
          student_email: attempt.student_email,
          score: Number(attempt.score) || 0,
          total_questions: attempt.total_questions,
          correct_answers: attempt.correct_answers,
          status: getStatusFromScore(Number(attempt.score) || 0),
          started_at: attempt.started_at,
          analysis_report: analysisReport,
        };
      });

      setStudents(formattedStudents);

      // Calculate stats
      const completed = formattedStudents.length;
      const avgScore = completed > 0 
        ? Math.round(formattedStudents.reduce((sum, s) => sum + s.score, 0) / completed)
        : 0;

      setStats({
        totalStudents: completed,
        completedExams: completed,
        averageScore: avgScore,
        totalCurriculums: 0,
        totalExams: 0,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusFromScore = (score: number): string => {
    if (score >= 85) return "متقن";
    if (score >= 70) return "جيد";
    if (score >= 50) return "متوسط";
    return "ضعيف";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "متقن": return "bg-success/10 text-success border-success/20";
      case "جيد": return "bg-success/10 text-success border-success/20";
      case "متوسط": return "bg-warning/10 text-warning border-warning/20";
      case "ضعيف": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const filteredStudents = students.filter(
    (student) =>
      student.student_name.includes(searchQuery) || 
      (student.student_email && student.student_email.includes(searchQuery))
  );

  const mockStats = [
    { label: "إجمالي الطلاب", value: stats.totalStudents.toString(), icon: Users, color: "primary" },
    { label: "الامتحانات المكتملة", value: stats.completedExams.toString(), icon: BookOpen, color: "success" },
    { label: "متوسط النتائج", value: `${stats.averageScore}%`, icon: TrendingUp, color: "info" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جارٍ تحميل البيانات...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">
              لوحة تحكم <span className="text-gradient">المدرس</span>
            </h1>
            <p className="text-muted-foreground">
              تابع أداء طلابك وحلل نتائج الامتحانات التشخيصية
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {mockStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center`}>
                      <Icon className={`h-7 w-7 text-${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Students Table */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {/* Table Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold">نتائج الطلاب</h2>
                
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن طالب..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        تصفية
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>الكل</DropdownMenuItem>
                      <DropdownMenuItem>متقن</DropdownMenuItem>
                      <DropdownMenuItem>جيد</DropdownMenuItem>
                      <DropdownMenuItem>متوسط</DropdownMenuItem>
                      <DropdownMenuItem>ضعيف</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">النتيجة</TableHead>
                    <TableHead className="text-right">المستوى</TableHead>
                    <TableHead className="text-right">نقطة البداية</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <p className="text-muted-foreground">
                          {searchQuery ? "لا توجد نتائج مطابقة للبحث" : "لا توجد نتائج بعد"}
                        </p>
                        {!searchQuery && (
                          <Link to="/upload" className="block mt-4">
                            <Button variant="outline">ارفع منهج وأنشئ امتحان</Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[hsl(174,72%,40%)] to-[hsl(200,80%,45%)] flex items-center justify-center text-primary-foreground font-bold">
                              {student.student_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{student.student_name}</p>
                              <p className="text-sm text-muted-foreground">{student.student_email || "بدون بريد"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress value={student.score} className="h-2" />
                            </div>
                            <span className={`font-bold ${getScoreColor(student.score)}`}>
                              {student.score}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {student.analysis_report?.start_point_description || "غير محدد"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(student.started_at).toLocaleDateString("ar-EG")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/results?attemptId=${student.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  عرض التفاصيل
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="h-4 w-4" />
                                تحميل التقرير
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
