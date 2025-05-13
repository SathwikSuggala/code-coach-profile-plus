
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
    } catch (error) {
      console.error("Error marking question as solved:", error);
      toast.error("Failed to mark question as solved");
    }
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dev-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => (
            <Card 
              key={question.questionId} 
              className={`cursor-pointer api-card ${question.isSolved ? 'border-green-300 bg-green-50' : ''}`}
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
                  <Badge className="bg-green-500">Solved</Badge>
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
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedQuestion && (
            <>
              <DialogHeader>
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

              <div className="space-y-4 mt-4">
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

                {selectedQuestion.questionSolutions && selectedQuestion.questionSolutions.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Solution Approach</h3>
                    <div className="mt-1">
                      <h4 className="font-medium">{selectedQuestion.questionSolutions[0].name}</h4>
                      <p className="text-gray-700 mt-1">{selectedQuestion.questionSolutions[0].explanation}</p>
                      <div className="mt-2">
                        <p className="font-medium">Example:</p>
                        <p className="text-gray-700">{selectedQuestion.questionSolutions[0].example}</p>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium">Code:</p>
                        <pre className="code-block mt-1">
                          {selectedQuestion.questionSolutions[0].code}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  {solvedQuestionsIds.includes(selectedQuestion.questionId) ? (
                    <Button disabled className="bg-green-600 hover:bg-green-700">
                      Already Solved
                    </Button>
                  ) : (
                    <Button onClick={() => handleMarkAsSolved(selectedQuestion.questionId)}>
                      Mark as Solved
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Questions;
