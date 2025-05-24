import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingChat from "./components/FloatingChat";
// import LottieLoader from './components/LottieLoader';

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { Questions, QuestionDetail } from "./pages/Questions";
import Chat from "./pages/Chat";
import Quizzes from "./pages/Quizzes";
import QuizHistory from "./pages/QuizHistory";
import NotFound from "./pages/NotFound";
import AdminQuestionForm from "./pages/AdminQuestionForm";
import Resources from "./pages/Resources";
import CodingStats from "./pages/CodingStats";
import ResourceGeneration from './pages/ResourceGeneration';
import AdminHome from "./pages/AdminHome";
import AdminUsers from "./pages/AdminUsers";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false once the app is ready
    setIsLoading(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <LoadingProvider>
              {/* <LottieLoader /> */}
              <Routes>
                {/* Redirect root to dashboard or login */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/questions" element={
                  <ProtectedRoute>
                    <Questions />
                  </ProtectedRoute>
                } />
                <Route path="/questions/:questionId" element={
                  <ProtectedRoute>
                    <QuestionDetail />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/quizzes" element={
                  <ProtectedRoute>
                    <Quizzes />
                  </ProtectedRoute>
                } />
                <Route path="/quiz-history" element={
                  <ProtectedRoute>
                    <QuizHistory />
                  </ProtectedRoute>
                } />
                <Route path="/admin/add-question" element={
                  <ProtectedRoute>
                    <AdminQuestionForm />
                  </ProtectedRoute>
                } />
                <Route path="/resources" element={
                  <ProtectedRoute>
                    <Resources />
                  </ProtectedRoute>
                } />
                <Route path="/coding-stats" element={
                  <ProtectedRoute>
                    <CodingStats />
                  </ProtectedRoute>
                } />
                <Route path="/resource-generation" element={<ResourceGeneration />} />
                <Route path="/admin-home" element={
                  <ProtectedRoute>
                    <AdminHome />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Floating Chat - appears on all pages when authenticated */}
              <FloatingChat />
            </LoadingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
