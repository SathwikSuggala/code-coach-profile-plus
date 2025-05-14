import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiService, API_BASE_URL } from "../services/apiService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Code, FileText, Play, CheckSquare, Lightbulb } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import ResourceLoadingAnimation from '../components/ResourceLoadingAnimation';

interface Question {
  questionId: number;
  questionName: string;
  questionDifficulty: string;
  topics: string[];
  isSolved?: boolean;
}

interface QuestionDetail {
  id: string;
  questionId: number;
  questionName: string;
  questionDescription: string;
  constraints: string[];
  sampleTestCases: {
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

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetail | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [solvedQuestionsIds, setSolvedQuestionsIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [solvedFilter, setSolvedFilter] = useState("all");
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [submitResult, setSubmitResult] = useState<{success: boolean; output?: string; error?: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        // Fetch all question names
        const questionsData = await apiService.getAllQuestionNames();
        
        // Fetch solved question IDs
        const solvedIds = await apiService.getSolvedQuestionIds();
        setSolvedQuestionsIds(solvedIds);

        // Mark solved questions
        const questionWithSolvedStatus = questionsData.map((q: Question) => ({
          ...q,
          isSolved: solvedIds.includes(q.questionId),
        }));

        setQuestions(questionWithSolvedStatus);
        setFilteredQuestions(questionWithSolvedStatus);

        // Extract all unique topics
        const topics = Array.from(
          new Set(
            questionWithSolvedStatus.flatMap((q: Question) => q.topics)
          )
        ).sort();
        setAvailableTopics(topics);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...questions];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(q => 
        q.questionName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(q => q.questionDifficulty === difficultyFilter);
    }
    
    // Apply topic filter
    if (topicFilter !== 'all') {
      result = result.filter(q => q.topics.includes(topicFilter));
    }
    
    // Apply solved filter
    if (solvedFilter !== 'all') {
      const isSolved = solvedFilter === 'solved';
      result = result.filter(q => q.isSolved === isSolved);
    }
    
    setFilteredQuestions(result);
  }, [questions, searchTerm, difficultyFilter, topicFilter, solvedFilter]);

  const handleQuestionClick = async (questionId: number) => {
    navigate(`/questions/${questionId}`);
  };

  const handleMarkAsSolved = async (questionId: number) => {
    try {
      await apiService.markQuestionSolved(questionId);
      
      // Update local state
      setSolvedQuestionsIds(prev => [...prev, questionId]);
      setQuestions(questions.map(q => 
        q.questionId === questionId ? {...q, isSolved: true} : q
      ));
      
      // Update selected question if open
      if (selectedQuestion && selectedQuestion.questionId === questionId) {
        setSelectedQuestion({ ...selectedQuestion });
      }
      
      toast.success("Question marked as solved!");
    } catch (error) {
      console.error("Error marking question as solved:", error);
      toast.error("Failed to mark question as solved");
    }
  };

  const handleRunCode = () => {
    if (!codeInput.trim()) {
      toast.error("Please enter some code to run");
      return;
    }
    
    // Simulate code execution (in a real app, this would send the code to a backend)
    setIsLoading(true);
    setTimeout(() => {
      const hasError = Math.random() > 0.7;
      
      if (hasError) {
        setSubmitResult({
          success: false,
          error: "Runtime error: null pointer exception at line 5"
        });
        toast.error("Code execution failed");
      } else {
        setSubmitResult({
          success: true,
          output: "All test cases passed!"
        });
        toast.success("Code executed successfully!");
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmitCode = () => {
    if (!codeInput.trim()) {
      toast.error("Please enter some code to submit");
      return;
    }
    
    if (!selectedQuestion) return;
    
    // Simulate code submission (in a real app, this would send the code to a backend)
    setIsLoading(true);
    setTimeout(() => {
      const hasError = Math.random() > 0.8;
      
      if (hasError) {
        setSubmitResult({
          success: false,
          error: "Failed test case #2: Expected output: 3, Your output: 2"
        });
        toast.error("Code submission failed");
      } else {
        setSubmitResult({
          success: true,
          output: "All test cases passed! Great job!"
        });
        toast.success("Code submitted successfully!");
        
        // Mark question as solved
        handleMarkAsSolved(selectedQuestion.questionId);
      }
      
      setIsLoading(false);
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case "EASY":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDefaultCode = (lang = "java") => {
    if (lang === "java") {
      return `class Solution {
    public int solve(String s) {
        // Write your solution here
        return 0;
    }
}`;
    }
    if (lang === "python") {
      return `def solve(s):
    # Write your solution here
    return 0`;
    }
    if (lang === "javascript") {
      return `/**
 * @param {string} s
 * @return {number}
 */
var solve = function(s) {
    // Write your solution here
    return 0;
};`;
    }
    return "// Write your solution here";
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Coding Questions</h1>
        <p className="text-gray-600">
          Browse and solve coding questions from various platforms
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={solvedFilter} onValueChange={setSolvedFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Questions</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="unsolved">Unsolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && !selectedQuestion ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dev-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => (
            <Card 
              key={question.questionId} 
              className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${question.isSolved ? 'border-green-300 bg-green-50' : ''}`}
              onClick={() => handleQuestionClick(question.questionId)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{question.questionName}</CardTitle>
                    <CardDescription>#{question.questionId}</CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(question.questionDifficulty)}>
                    {question.questionDifficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {question.topics.map((topic, index) => (
                    <Badge key={index} variant="outline">{topic}</Badge>
                  ))}
                </div>
                {question.isSolved ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Solved</span>
                  </div>
                ) : (
                  <Badge variant="outline">Not Solved</Badge>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500">No questions match your filters.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

// Create a new component for the question detail page
const QuestionDetail = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [submitResult, setSubmitResult] = useState<{success: boolean; output?: string; error?: string} | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Add typing inactivity timer
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    
    if (isTyping) {
      setShowPulse(false);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        setShowPulse(true);
      }, 5000); // 5 seconds
    }

    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [isTyping, codeInput]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        const questionDetail = await apiService.getQuestionById(Number(questionId));
        setQuestion(questionDetail);
        setCodeInput(getDefaultCode(selectedLanguage));
      } catch (error) {
        console.error("Error fetching question details:", error);
        toast.error("Failed to load question details");
        navigate('/questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, selectedLanguage]);

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'cpp':
        return `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`;
      case 'java':
        return `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}`;
      case 'python':
        return `# Write your solution here
def solve():
    pass`;
      default:
        return '// Write your solution here';
    }
  };

  const handleRunCode = () => {
    if (!codeInput.trim()) {
      toast.error("Please enter some code to run");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setSubmitResult({
        success: true,
        output: "All test cases passed!"
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmitCode = () => {
    if (!codeInput.trim()) {
      toast.error("Please enter some code to submit");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setSubmitResult({
        success: true,
        output: "All test cases passed! Great job!"
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleGetSuggestion = async () => {
    if (!codeInput.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsLoadingSuggestion(true);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chat/nextStepSuggester`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: codeInput,
          question: question?.questionDescription || ""
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestion");
      }

      const data = await response.text();
      setSuggestion(data);
      setShowSuggestion(true);
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast.error("Failed to get suggestion");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <ResourceLoadingAnimation progress={50} />
          <p className="mt-4 text-gray-600">Loading question details...</p>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{question.questionName}</h1>
              <p className="text-gray-600">Question #{question.questionId}</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => navigate('/questions')}>
                Back to Questions
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Description */}
          <div className="w-1/2 border-r overflow-auto p-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="mt-2 text-gray-700">{question.questionDescription}</p>
              </div>

              <div>
                <h3 className="font-semibold">Constraints</h3>
                <ul className="list-disc list-inside mt-2">
                  {question.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Sample Test Cases</h3>
                <div className="space-y-4 mt-2">
                  {question.sampleTestCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <div><strong>Input:</strong> {testCase.input}</div>
                      <div><strong>Output:</strong> {testCase.output}</div>
                      {testCase.explanation && (
                        <div><strong>Explanation:</strong> {testCase.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Code Editor */}
          <div className="w-1/2 flex flex-col">
            <div className="flex justify-between gap-2 p-4 border-b">
              <Button 
                variant="outline" 
                onClick={handleGetSuggestion}
                disabled={isLoadingSuggestion}
                className={`flex items-center gap-2 relative ${showPulse ? 'animate-heartbeat' : ''}`}
              >
                <Lightbulb className={`w-4 h-4 ${showPulse ? 'animate-glow text-yellow-400' : ''}`} />
                {isLoadingSuggestion ? "Getting Suggestion..." : "Get Suggestion"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRunCode}>
                  Run
                </Button>
                <Button onClick={handleSubmitCode}>
                  Submit
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <Textarea
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setIsTyping(true);
                }}
                className="h-full font-mono text-sm resize-none"
              />
            </div>
            {submitResult && (
              <div className={`p-4 border-t ${submitResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <h4 className={`font-medium ${submitResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {submitResult.success ? 'Success!' : 'Error!'}
                </h4>
                <pre className="mt-1 text-sm whitespace-pre-wrap">
                  {submitResult.success ? submitResult.output : submitResult.error}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showSuggestion} onOpenChange={setShowSuggestion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Next Steps Suggestion</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Suggested Next Steps:</h4>
              <div className="text-blue-900 whitespace-pre-wrap">{suggestion}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Add the heartbeat animation keyframes at the end of the file
const styles = `
@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes glow {
  0% {
    filter: drop-shadow(0 0 0px rgba(255, 255, 0, 0));
  }
  25% {
    filter: drop-shadow(0 0 5px rgba(255, 255, 0, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 0px rgba(255, 255, 0, 0));
  }
  75% {
    filter: drop-shadow(0 0 5px rgba(255, 255, 0, 0.7));
  }
  100% {
    filter: drop-shadow(0 0 0px rgba(255, 255, 0, 0));
  }
}

.animate-heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}

.animate-glow {
  animation: glow 1.5s ease-in-out infinite;
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export { Questions, QuestionDetail };
