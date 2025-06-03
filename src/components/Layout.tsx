import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { 
  Home, 
  User, 
  Code, 
  MessageSquare, 
  FileText,
  LogOut,
  Menu,
  X,
  Book,
  BarChart,
  GitCompare
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const { startLoading } = useLoading();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Coding Questions", path: "/questions", icon: <Code size={20} /> },
    { name: "Chat Bot", path: "/chat", icon: <MessageSquare size={20} /> },
    { name: "Quizzes", path: "/quizzes", icon: <FileText size={20} /> },
    { name: "Resources", path: "/resources", icon: <Book size={20} /> },
    { name: "Coding Stats", path: "/coding-stats", icon: <BarChart size={20} /> },
    { name: "Comparator", path: "/comparator", icon: <GitCompare size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = () => {
    startLoading();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center h-16 relative">
          <span className="text-3xl font-extrabold text-dev-blue pl-4">Code Assist</span>
          <div className="flex-1"></div>
          <div className="max-w-7xl mx-auto px-4 flex items-center w-full">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 ml-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleNavigation}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
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
                  onClick={() => { startLoading(); logout(); }}
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 font-medium"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-auto">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50">
          <nav className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleNavigation}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive(item.path) ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => { startLoading(); logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut size={20} />
                <span className="ml-3">Logout</span>
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 pb-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Code Assist. All rights reserved.
      </footer>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={handleNavigation}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive(item.path)
                  ? "text-dev-blue" : "text-gray-500 hover:text-gray-700"}
              }`}
            >
              <div>{item.icon}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;
