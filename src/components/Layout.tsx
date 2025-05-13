
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
  X
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Coding Questions", path: "/questions", icon: <Code size={20} /> },
    { name: "Chat Bot", path: "/chat", icon: <MessageSquare size={20} /> },
    { name: "Quizzes", path: "/quizzes", icon: <FileText size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-0 md:w-20"
        } transition-all duration-300 bg-white border-r border-gray-200 hidden md:block`}
      >
        <div className="h-full flex flex-col justify-between p-4">
          <div>
            <div className={`flex items-center ${isSidebarOpen ? "justify-between" : "justify-center"} mb-8`}>
              {isSidebarOpen && (
                <Link to="/dashboard" className="text-xl font-bold text-dev-blue">
                  DevPortal
                </Link>
              )}
              <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
            <nav>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center ${
                        isSidebarOpen ? "px-4" : "px-0 justify-center"
                      } py-3 rounded-md ${
                        isActive(item.path)
                          ? "bg-dev-blue text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>{item.icon}</span>
                      {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {isAuthenticated && (
            <button
              onClick={logout}
              className={`flex items-center ${
                isSidebarOpen ? "px-4" : "px-0 justify-center"
              } py-3 text-red-600 hover:bg-red-50 rounded-md`}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile sidebar */}
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
