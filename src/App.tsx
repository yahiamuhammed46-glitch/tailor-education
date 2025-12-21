import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Upload from "./pages/Upload";
import ExamBuilder from "./pages/ExamBuilder";
import Exam from "./pages/Exam";
import Exams from "./pages/Exams";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Teacher & Admin Routes */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-builder"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <ExamBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Student Routes */}
            <Route
              path="/exams"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Exams />
                </ProtectedRoute>
              }
            />
            
            {/* Exam & Results - Accessible by all authenticated users */}
            <Route
              path="/exam"
              element={
                <ProtectedRoute>
                  <Exam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
