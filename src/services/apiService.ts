import { toast } from "sonner";

export const API_BASE_URL = "https://capstone-1-y2mc.onrender.com/api";

interface AuthResponse {
  jwt: string;
  role: string;
}

interface RegisterData {
  userName: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  userName: string;
  role: string;
  status: boolean;
}

interface LoginData {
  userName: string;
  password: string;
}

interface NewQuestionData {
  questionName: string;
  "question### Description "?: string;
  questionDescription?: string;
  constraints: string[];
  sampleTestCases: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  actualTestCases: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  topics: string[];
  questionDifficulty: string;
  questionSource: string;
  questionSolutions: {
    name: string;
    explanation: string;
    example: string;
    code: string;
  }[];
}

interface LeetCodeContest {
  attended: boolean;
  trendDirection: 'UP' | 'DOWN';
  problemsSolved: number;
  totalProblems: number;
  finishTimeInSeconds: number;
  rating: number;
  ranking: number;
  contest: {
    title: string;
    startTime: number;
  };
}

interface CodeForcesContest {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface CodeForcesUser {
  lastName: string;
  country: string;
  lastOnlineTimeSeconds: number;
  city: string;
  rating: number;
  friendOfCount: number;
  titlePhoto: string;
  handle: string;
  avatar: string;
  firstName: string;
  contribution: number;
  rank: string;
  maxRating: number;
  registrationTimeSeconds: number;
  maxRank: string;
}

interface CodeForcesContestsResponse {
  status: string;
  result: CodeForcesUser[];
}

export const apiService = {
  // Authentication APIs
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (response.status === 409) {
        const errorData = await response.json();
        toast.error("Registration failed: Username already exists");
        return errorData;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      toast.success("Registration successful!");
      return result;
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Registration failed: " + (error as Error).message);
      throw error;
    }
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (response.status === 403) {
        toast.error("Login failed: Invalid credentials");
        throw new Error("Invalid credentials");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      localStorage.setItem("jwt", result.jwt);
      localStorage.setItem("role", result.role);
      localStorage.setItem("username", data.userName);
      toast.success("Login successful!");
      return result;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    }
  },

  // User Profile APIs
  getUserInfo: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/userInfo`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get user info error:", error);
      toast.error("Failed to get user info: " + (error as Error).message);
      throw error;
    }
  },
  
  getProfileData: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/profileData`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get profile data error:", error);
      toast.error("Failed to get profile data: " + (error as Error).message);
      throw error;
    }
  },

  // Chat APIs
  createChatSession: async (): Promise<number> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/chat/createNewSession`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.sessionId;
    } catch (error) {
      console.error("Create chat session error:", error);
      toast.error("Failed to create chat session: " + (error as Error).message);
      throw error;
    }
  },
  
  sendChatMessage: async (sessionId: number, message: string): Promise<string> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/chat/sessionChat/${sessionId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.response;
    } catch (error) {
      console.error("Send chat message error:", error);
      toast.error("Failed to send message: " + (error as Error).message);
      throw error;
    }
  },
  
  getChatHistory: async (sessionId: number): Promise<any[]> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/chat/sessionHistory/${sessionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get chat history error:", error);
      toast.error("Failed to get chat history: " + (error as Error).message);
      throw error;
    }
  },

  // Coding Questions APIs
  addNewQuestion: async (questionData: NewQuestionData): Promise<void> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/addNewQuestion`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });
      
      if (response.status === 403) {
        throw new Error("You don't have permission to add questions");
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Add question error:", error);
      toast.error("Failed to add question: " + (error as Error).message);
      throw error;
    }
  },
  
  getAllQuestionNames: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/allQuestionNames`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get questions error:", error);
      toast.error("Failed to get questions: " + (error as Error).message);
      throw error;
    }
  },
  
  getQuestionById: async (id: number): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/getQuestionById/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get question error:", error);
      toast.error("Failed to get question: " + (error as Error).message);
      throw error;
    }
  },
  
  markQuestionSolved: async (questionId: number): Promise<void> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/solved/${questionId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast.success("Question marked as solved!");
    } catch (error) {
      console.error("Mark question solved error:", error);
      toast.error("Failed to mark question as solved: " + (error as Error).message);
      throw error;
    }
  },
  
  getSolvedQuestionIds: async (): Promise<number[]> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/user/solvedQuestions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get solved questions error:", error);
      toast.error("Failed to get solved questions: " + (error as Error).message);
      throw error;
    }
  },
  
  getTopicsKnown: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/user/topicsKnown/getTopicsKnown`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get topics known error:", error);
      toast.error("Failed to get topics known: " + (error as Error).message);
      throw error;
    }
  },
  
  getMonthlySubmissions: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/monthly-submissions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get monthly submissions error:", error);
      toast.error("Failed to get monthly submissions: " + (error as Error).message);
      throw error;
    }
  },
  
  // Quiz APIs
  generateQuiz: async (
    topic: string, 
    subTopic: string | null, 
    numQuestions: number,
    questionType: string
  ): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/readingMaterial/generateQuiz`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          subTopic,
          numQuestions,
          questionType
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Generate quiz error:", error);
      toast.error("Failed to generate quiz: " + (error as Error).message);
      throw error;
    }
  },
  
  evaluateQuiz: async (quizData: any): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/readingMaterial/evaluateQuiz`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Evaluate quiz error:", error);
      toast.error("Failed to evaluate quiz: " + (error as Error).message);
      throw error;
    }
  },
  
  getAllQuizHistory: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${API_BASE_URL}/readingMaterial/getAllQuiz`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Get all quiz history error:", error);
      toast.error("Failed to fetch quiz history: " + (error as Error).message);
      throw error;
    }
  },

  // Utility method to check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("jwt");
  },
  
  // Logout method
  logout: (): void => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    toast.success("Logged out successfully!");
  },

  getTopicsLearnedWithPercentages: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/readingMaterial/topicsLearnedWithPercentages`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get topics learned error:", error);
      toast.error("Failed to get topics learned data: " + (error as Error).message);
      throw error;
    }
  },

  getLeetCodeStats: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/leetcode`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get LeetCode stats error:", error);
      throw error;
    }
  },

  getContestRatings: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/user/contestRating`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get contest ratings error:", error);
      throw error;
    }
  },

  getLeetCodeCalendar: async (): Promise<any> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/monthly-submissions`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get LeetCode calendar error:", error);
      throw error;
    }
  },

  getLeetCodeAttendedContests: async (): Promise<LeetCodeContest[]> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/leetcode/attendedContest`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        // You might want to redirect to login page here
        throw new Error("Unauthorized");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get LeetCode attended contests error:", error);
      toast.error("Failed to fetch LeetCode attended contests");
      throw error;
    }
  },

  getCodeForcesContests: async (): Promise<CodeForcesContest[]> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/codeforces/rating`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get CodeForces contests error:", error);
      toast.error("Failed to fetch CodeForces contests");
      throw error;
    }
  },

  getCodeForcesAvailableContests: async (): Promise<CodeForcesContestsResponse> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/codeforces/contests`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get CodeForces available contests error:", error);
      toast.error("Failed to fetch CodeForces available contests");
      throw error;
    }
  },

  getCombinedMonthlySubmissions: async (): Promise<{
    labels: string[];
    LeetCode: number[];
    Codeforces: number[];
  }> => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");
      
      const response = await fetch(`${API_BASE_URL}/monthWiseTotalSubmissions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      
      if (response.status === 403) {
        toast.error("Access forbidden. Please check your permissions.");
        throw new Error("Forbidden");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get combined monthly submissions error:", error);
      toast.error("Failed to fetch combined monthly submissions");
      throw error;
    }
  },
};
