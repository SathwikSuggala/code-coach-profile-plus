import React, { useEffect, useState, useRef } from "react";
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
import { CheckCircle, Code, FileText, Play, CheckSquare, Lightbulb, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react";
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
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
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

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'cpp':
        return `#include <iostream>
#include <string>
using namespace std;

int main() {
    return 0;
}`;
      case 'java':
        return `public class Solution {
    public static void main(String[] args) {
    }
}`;
      case 'python':
        return `def solve():
    pass`;
      default:
        return '';
    }
  };

  // Add tab support handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert 4 spaces at cursor position
      const newValue = codeInput.substring(0, start) + '    ' + codeInput.substring(end);
      setCodeInput(newValue);
      
      // Set cursor position after the inserted spaces
      const newCursorPos = start + 4;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { passed: boolean; actualOutput: string }>>({});
  const [isTestCasesOpen, setIsTestCasesOpen] = useState(true);
  const [testCasesHeight, setTestCasesHeight] = useState(300);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [descriptionWidth, setDescriptionWidth] = useState(500);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const isDescriptionResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Handle cursor position after code input changes
  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [codeInput, cursorPosition]);

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
#include <string>
using namespace std;

int main() {
    return 0;
}`;
      case 'java':
        return `public class Solution {
    public static void main(String[] args) {
    }
}`;
      case 'python':
        return `def solve():
    pass`;
      default:
        return '';
    }
  };

  const handleRunCode = async () => {
    if (!codeInput.trim()) {
      toast.error("Please enter some code to run");
      return;
    }
    if (!question) return;

    setIsLoading(true);
    const results: { input: string; expected: string; actual: string; passed: boolean }[] = [];
    const newTestResults: Record<number, { passed: boolean; actualOutput: string }> = {};

    try {
      // Run against all actual test cases
      for (let i = 0; i < question.actualTestCases.length; i++) {
        const testCase = question.actualTestCases[i];
        const formData = new URLSearchParams();
        formData.append('code', codeInput);
        formData.append('input', testCase.input);
        formData.append('language', selectedLanguage.toLowerCase());

        console.log('Sending request with:', {
          code: codeInput,
          input: testCase.input,
          language: selectedLanguage.toLowerCase()
        });

        const response = await fetch('https://capstonecompiler.onrender.com/run_single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });

        const data = await response.json();
        console.log('API Response:', data);
        
        if (!response.ok || data.error) {
          throw new Error(data.error || data.message || `Server error: ${response.status}`);
        }
        
        if (data.message === "Code executed successfully") {
          const actualOutput = data.output.trim();
          const expectedOutput = testCase.output.trim();
          const passed = actualOutput === expectedOutput;
          
          console.log('Test case result:', {
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            passed
          });
          
          results.push({
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            passed
          });

          // Store individual test case result with actual output using the current index
          newTestResults[i] = {
            passed,
            actualOutput
          };
        } else {
          throw new Error(data.message || 'Failed to execute code');
        }
      }

      // Check if all test cases passed
      const allPassed = results.every(result => result.passed);
      
      setSubmitResult({
        success: allPassed,
        output: allPassed 
          ? "All test cases passed!" 
          : `Failed ${results.filter(r => !r.passed).length} test case(s):\n\n${
              results.map((result, index) => 
                `Test Case ${index + 1}:\nInput: ${result.input}\nExpected: ${result.expected}\nActual: ${result.actual}\n`
              ).join('\n')
            }`
      });

      // Update test results
      setTestResults(newTestResults);

      if (allPassed) {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed");
      }
    } catch (error) {
      console.error("Error running code:", error);
      setSubmitResult({
        success: false,
        error: error instanceof Error ? error.message : "Failed to execute code"
      });
      setIsTestCasesOpen(false);
      toast.error("Failed to execute code");
    } finally {
      setIsLoading(false);
    }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert 4 spaces at cursor position
      const newValue = codeInput.substring(0, start) + '    ' + codeInput.substring(end);
      setCodeInput(newValue);
      setCursorPosition(start + 4);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = testCasesHeight;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const deltaY = startY.current - e.clientY;
    const newHeight = Math.max(100, Math.min(600, startHeight.current + deltaY)); // Min 100px, max 600px
    setTestCasesHeight(newHeight);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleSubmitCode = async () => {
    if (!codeInput.trim()) {
      toast.error("Please enter some code to submit");
      return;
    }
    if (!question) return;

    // Check if code has been run at least once
    if (Object.keys(testResults).length === 0) {
      toast.error("Please run your code at least once before submitting");
      return;
    }

    // Check if all test cases have passed
    const allTestsPassed = Object.values(testResults).every(result => result.passed);
    if (!allTestsPassed) {
      toast.error("Please pass all test cases before submitting");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.markQuestionSolved(question.questionId);
      toast.success("Question submitted successfully!");
      navigate('/questions');
    } catch (error) {
      console.error("Error submitting code:", error);
      toast.error("Failed to submit code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionMouseDown = (e: React.MouseEvent) => {
    isDescriptionResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = descriptionWidth;
    document.addEventListener('mousemove', handleDescriptionMouseMove);
    document.addEventListener('mouseup', handleDescriptionMouseUp);
  };

  const handleDescriptionMouseMove = (e: MouseEvent) => {
    if (!isDescriptionResizing.current) return;
    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(300, Math.min(800, startWidth.current + deltaX));
    setDescriptionWidth(newWidth);
  };

  const handleDescriptionMouseUp = () => {
    isDescriptionResizing.current = false;
    document.removeEventListener('mousemove', handleDescriptionMouseMove);
    document.removeEventListener('mouseup', handleDescriptionMouseUp);
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
            <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpp">Cpp</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => navigate('/questions')} className="px-3 py-1 md:px-4 md:py-2 text-sm">
                Back to Questions
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="flex flex-1">
          {/* Left Side - Description */}
          {isDescriptionOpen && (
            <div 
              className="border-r overflow-auto relative"
              style={{ width: `${descriptionWidth}px` }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Description</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
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
              {/* Resize handle */}
              <div
                className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize hover:bg-blue-500"
                onMouseDown={handleDescriptionMouseDown}
              />
            </div>
          )}
          {!isDescriptionOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDescriptionOpen(true)}
              className="h-8 w-8 p-0 m-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Right Side - Code Editor */}
          <div className="flex-1 flex flex-col overflow-auto min-h-[400px]">
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
                ref={textareaRef}
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setIsTyping(true);
                }}
                onKeyDown={handleKeyDown}
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

            {/* Test Cases Section */}
            <div className="border-t">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Test Cases</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTestCasesOpen(!isTestCasesOpen)}
                  className="h-8 w-8 p-0"
                >
                  {isTestCasesOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isTestCasesOpen && (
                <div 
                  className="relative"
                  style={{ height: `${testCasesHeight}px` }}
                >
                  <div className="absolute inset-0 overflow-auto">
                    <div className="p-4">
                      <Tabs defaultValue="0" className="w-full">
                        <TabsList className="w-full justify-start">
                          {question.actualTestCases.map((_, index) => (
                            <TabsTrigger key={index} value={index.toString()}>
                              Test Case {index + 1}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {question.actualTestCases.map((testCase, index) => (
                          <TabsContent key={index} value={index.toString()}>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Test Case {index + 1}</h4>
                                {submitResult && (
                                  <Badge variant={testResults[index]?.passed ? "default" : "destructive"}>
                                    {testResults[index]?.passed ? "Passed" : "Failed"}
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Input:</span>
                                  <pre className="mt-1 bg-gray-100 p-2 rounded">{testCase.input}</pre>
                                </div>
                                <div>
                                  <span className="font-medium">Expected Output:</span>
                                  <pre className="mt-1 bg-gray-100 p-2 rounded">{testCase.output}</pre>
                                </div>
                                {submitResult && testResults[index] && (
                                  <div>
                                    <span className="font-medium">Your Output:</span>
                                    <pre className={`mt-1 bg-gray-100 p-2 rounded ${testResults[index].passed ? 'text-green-600' : 'text-red-600'}`}>
                                      {testResults[index].actualOutput}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </div>
                  {/* Resize handle */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 cursor-ew-resize hover:bg-blue-500"
                    onMouseDown={handleMouseDown}
                  />
                </div>
              )}
            </div>
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
