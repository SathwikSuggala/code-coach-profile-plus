import React, { useEffect, useState } from "react";
import { apiService, API_BASE_URL } from "../services/apiService";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, LogOut, User, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface UserData {
  id: string;
  username: string;
  fullName: string | null;
  accountsConnected: string[] | null;
  address: {
    city: string;
    state: string;
    country: string;
  } | null;
  collegeName: string | null;
  accountsLastVisitDate: {
    codeForces: string;
    leetCode: string;
    hackerRank: string;
  } | null;
  gitHubId: string | null;
  linkedinId: string | null;
  emailId: string | null;
  mobileNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  degree: string | null;
  course: string | null;
  codingLanguages: string[] | null;
  leetCodeUserName: string | null;
  codeForcesUserName: string | null;
  solvedQuestionIds: string[];
  solvedTopics: Record<string, number>;
  image: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/getAllUsers`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleDeleteUser = async (username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/deleteUser/${username}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        toast.success(`User "${username}" deleted successfully`);
        // Refresh the user list
        await fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-black p-2 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hello Admin</h1>
                <p className="text-sm text-gray-500">Welcome to your dashboard</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
                onClick={() => navigate('/admin-home')}
              >
                <Edit className="w-5 h-5 mr-2" />
                Manage Questions
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
                onClick={() => navigate('/admin/users')}
              >
                <User className="w-5 h-5 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Manage Users</h2>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Connected Accounts</TableHead>
                  <TableHead>Coding Languages</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName || '-'}</TableCell>
                    <TableCell>{user.emailId || '-'}</TableCell>
                    <TableCell>{user.mobileNumber || '-'}</TableCell>
                    <TableCell>{user.collegeName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.accountsConnected?.map((account) => (
                          <Badge key={account} variant="outline">
                            {account}
                          </Badge>
                        )) || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.codingLanguages?.map((lang) => (
                          <Badge key={lang} variant="secondary">
                            {lang}
                          </Badge>
                        )) || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.username)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">© 2024 Code Coach. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminUsers; 