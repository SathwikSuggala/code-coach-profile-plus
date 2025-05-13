import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
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
import { CheckCircle, Code, FileText, Play, CheckSquare } from "lucide-react";

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
    try {
      setIsLoading(true);
      const questionDetail = await apiService.getQuestionById(questionId);
      setSelectedQuestion(questionDetail);
      setIsQuestionDialogOpen(true);
      setActiveTab("description");
      setCodeInput("");
      setSubmitResult(null);
    } catch (error) {
      console.error("Error fetching question details:", error);
      toast.error("Failed to load question details");
    } finally {
      setIsLoading(false);
    }
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

      {/* Question Detail Dialog */}
      <Dialog
        open={isQuestionDialogOpen} 
        onOpenChange={setIsQuestionDialogOpen}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] h-[90vh] p-0 overflow-hidden">
          {selectedQuestion && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedQuestion.questionName}
                    </DialogTitle>
                    <DialogDescription>
                      Question #{selectedQuestion.questionId} from {selectedQuestion.questionSource}
                    </DialogDescription>
                  </div>
                  <Badge className={getDifficultyColor(selectedQuestion.questionDifficulty)}>
                    {selectedQuestion.questionDifficulty}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="flex-grow overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="description" className="flex items-center gap-2">
                      <FileText size={16} />
                      <span>Description</span>
                    </TabsTrigger>
                    <TabsTrigger value="solution" className="flex items-center gap-2">
                      <Code size={16} />
                      <span>Solution</span>
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className="flex items-center gap-2">
                      <CheckSquare size={16} />
                      <span>Submissions</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="h-full overflow-y-auto p-4 m-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Description</h3>
                        <p className="mt-1 text-gray-700">
                          {selectedQuestion.questionDescription}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Constraints</h3>
                        <ul className="list-disc list-inside mt-1 text-gray-700">
                          {selectedQuestion.constraints?.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold">Sample Test Cases</h3>
                        <div className="space-y-3 mt-2">
                          {selectedQuestion.sampleTestCases?.map((testCase, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <div>
                                <span className="font-medium">Input:</span> {testCase.input}
                              </div>
                              <div>
                                <span className="font-medium">Output:</span> {testCase.output}
                              </div>
                              {testCase.explanation && (
                                <div>
                                  <span className="font-medium">Explanation:</span> {testCase.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold">Topics</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedQuestion.topics?.map((topic, index) => (
                            <Badge key={index} variant="outline">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="solution" className="h-full overflow-hidden m-0 flex flex-col">
                    <div className="flex flex-col h-full">
                      <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Select defaultValue="java">
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="java">Java</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="cpp">C++</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={handleRunCode} 
                            disabled={isLoading}
                            className="flex items-center gap-2"
                          >
                            <Play size={16} />
                            Run
                          </Button>
                          <Button 
                            onClick={handleSubmitCode} 
                            disabled={isLoading || solvedQuestionsIds.includes(selectedQuestion.questionId)}
                            className="flex items-center gap-2"
                          >
                            {solvedQuestionsIds.includes(selectedQuestion.questionId) ? 
                              "Already Submitted" : "Submit"}
                          </Button>
                        </div>
                      </div>
                      <div className="flex-grow overflow-hidden flex">
                        <div className="w-full h-full flex flex-col">
                          <Textarea
                            value={codeInput || getDefaultCode()}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="Write your code here..."
                            className="flex-grow p-4 font-mono text-sm resize-none overflow-auto rounded-none border-0 h-full"
                          />
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
                  </TabsContent>

                  <TabsContent value="submissions" className="h-full overflow-y-auto p-4 m-0">
                    {solvedQuestionsIds.includes(selectedQuestion.questionId) ? (
                      <div className="space-y-4">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">You've solved this problem!</span>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium mb-2">Your most recent submission:</h4>
                          <div className="text-sm text-gray-600">
                            <p>Date: {new Date().toLocaleDateString()}</p>
                            <p>Status: Accepted</p>
                            <p>Runtime: 5ms (faster than 95% of submissions)</p>
                            <p>Memory: 42.1MB (less than 87% of submissions)</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>You haven't submitted a solution for this problem yet.</p>
                        <p className="mt-2">Go to the solution tab to submit your code.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Questions;
