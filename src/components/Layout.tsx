import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Home, 
  User, 
  Code, 
  MessageSquare, 
  FileText,
  LogOut,
  Menu,
  X,
  Book
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Coding Questions", path: "/questions", icon: <Code size={20} /> },
    { name: "Chat Bot", path: "/chat", icon: <MessageSquare size={20} /> },
    { name: "Quizzes", path: "/quizzes", icon: <FileText size={20} /> },
    { name: "Resources", path: "/resources", icon: <Book size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/dashboard" className="text-xl font-bold text-dev-blue">Code Assist</Link>
          <nav className="hidden md:flex gap-2 lg:gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium transition-colors duration-150 ${
                  isActive(item.path)
                    ? "bg-dev-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="ml-1">{item.name}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Code Assist. All rights reserved.
      </footer>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center ${
                isActive(item.path)
                  ? "text-dev-blue"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div>{item.icon}</div>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;
