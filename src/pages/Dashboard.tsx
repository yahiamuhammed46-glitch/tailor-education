import { useState } from "react";
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
  MoreVertical
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

// Mock data
const mockStats = [
  { label: "إجمالي الطلاب", value: "156", icon: Users, color: "primary" },
  { label: "الامتحانات المكتملة", value: "89", icon: BookOpen, color: "success" },
  { label: "متوسط النتائج", value: "72%", icon: TrendingUp, color: "info" },
];

const mockStudents = [
  { id: "1", name: "أحمد محمد", email: "ahmed@email.com", score: 85, status: "متقن", startPoint: "الوحدة الثالثة", date: "2024-01-15" },
  { id: "2", name: "سارة علي", email: "sara@email.com", score: 72, status: "جيد", startPoint: "الوحدة الثانية", date: "2024-01-14" },
  { id: "3", name: "محمود حسن", email: "mahmoud@email.com", score: 58, status: "متوسط", startPoint: "الوحدة الأولى", date: "2024-01-14" },
  { id: "4", name: "فاطمة أحمد", email: "fatma@email.com", score: 92, status: "متقن", startPoint: "الوحدة الرابعة", date: "2024-01-13" },
  { id: "5", name: "عمر خالد", email: "omar@email.com", score: 45, status: "ضعيف", startPoint: "مراجعة شاملة", date: "2024-01-13" },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.includes(searchQuery) || student.email.includes(searchQuery)
  );

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
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
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
                      <TableCell className="text-muted-foreground">
                        {student.startPoint}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(student.date).toLocaleDateString("ar-EG")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="h-4 w-4" />
                              تحميل التقرير
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد نتائج مطابقة للبحث</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
