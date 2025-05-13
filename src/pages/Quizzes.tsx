import React, { useState } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface QuizQuestion {
  type: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation: string;
  selectedAnswers?: number[];
  marksObtained?: number;
  correct?: boolean;
}

interface Quiz {
  quiz: QuizQuestion[];
}

interface QuizResult {
  quiz: QuizQuestion[];
  totalMarks: number;
  totalMarksObtained: number;
  totalTimeTaken: number;
  correctAttempt: number;
  incorrectAttempt: number;
  partialAttempt: number;
  unAttempt: number;
}

const Quizzes = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [topic, setTopic] = useState("");
  const [subTopic, setSubTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("generate"); // generate, quiz, result
  const [negativeMarking, setNegativeMarking] = useState(true);
  const navigate = useNavigate();

  const handleGenerateQuiz = async () => {
    if (!topic) {
      toast.error("Please enter a topic");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.generateQuiz(
        topic,
        subTopic || null,
        numQuestions
      );
      setQuiz(response.quiz);
      setCurrentStep("quiz");
      setQuizStartTime(Date.now());
      toast.success("Quiz generated successfully!");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number, isMultiChoice: boolean) => {
    const updatedQuiz = [...quiz];
    const question = updatedQuiz[questionIndex];
    
    if (!question.selectedAnswers) {
      question.selectedAnswers = [];
    }
    
    if (isMultiChoice) {
      // For multiple choice questions
      const selectedIndex = question.selectedAnswers.indexOf(optionIndex);
      if (selectedIndex > -1) {
        question.selectedAnswers.splice(selectedIndex, 1);
      } else {
        question.selectedAnswers.push(optionIndex);
      }
    } else {
      // For single choice questions
      question.selectedAnswers = [optionIndex];
    }
    
    updatedQuiz[questionIndex] = question;
    setQuiz(updatedQuiz);
  };

  const handleSubmitQuiz = async () => {
    if (!quizStartTime) return;
    
    const totalTimeTaken = Date.now() - quizStartTime;
    
    try {
      setIsLoading(true);
      const quizData = {
        negativeEnabled: negativeMarking,
        totalTimeTaken,
        topic,
        subTopic: subTopic || null,
        quiz
      };
      
      const result = await apiService.evaluateQuiz(quizData);
      setQuizResult(result);
      setCurrentStep("result");
      toast.success("Quiz evaluated successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewQuiz = () => {
    setQuiz([]);
    setQuizResult(null);
    setCurrentStep("generate");
    setTopic("");
    setSubTopic("");
    setNumQuestions(5);
    setQuizStartTime(null);
    setNegativeMarking(true);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const isMultiChoice = (question: QuizQuestion) => {
    return question.correctAnswers.length > 1;
  };

  const renderGenerateForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-xl w-full mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Generate Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., JavaScript, Data Structures, Algorithms"
                required
                className="text-lg py-5 rounded-xl shadow-lg focus:shadow-xl transition-all duration-200 border-2 border-transparent focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subTopic">Sub-Topic (Optional)</Label>
              <Input
                id="subTopic"
                value={subTopic}
                onChange={(e) => setSubTopic(e.target.value)}
                placeholder="e.g., Arrays, Functions, Loops"
                className="text-lg py-5 rounded-xl shadow-lg focus:shadow-xl transition-all duration-200 border-2 border-transparent focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Input
                id="numQuestions"
                type="number"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="text-lg py-5 rounded-xl shadow-lg focus:shadow-xl transition-all duration-200 border-2 border-transparent focus:border-blue-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="negativeMarking"
                checked={negativeMarking}
                onCheckedChange={setNegativeMarking}
              />
              <Label htmlFor="negativeMarking">Enable Negative Marking</Label>
            </div>
          </CardContent>
          <CardFooter>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="w-full"
            >
              <Button
                onClick={handleGenerateQuiz}
                disabled={isLoading}
                className="h-12 text-lg w-full rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 transition-all duration-200"
              >
                {isLoading ? "Generating..." : "Generate Quiz"}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  const renderQuizQuestions = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Quiz on {topic} {subTopic ? `(${subTopic})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.map((question, qIndex) => (
            <div key={qIndex} className="border p-4 rounded-lg">
              <div className="font-medium mb-4">
                {qIndex + 1}. {question.question}
                {isMultiChoice(question) && (
                  <span className="ml-2 text-sm text-gray-500">(Select all that apply)</span>
                )}
              </div>
              
              {isMultiChoice(question) ? (
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <Checkbox
                        id={`q${qIndex}-o${oIndex}`}
                        checked={question.selectedAnswers?.includes(oIndex) || false}
                        onCheckedChange={() => handleSelectAnswer(qIndex, oIndex, true)}
                      />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={question.selectedAnswers?.[0]?.toString() || ""}
                  onValueChange={(value) => handleSelectAnswer(qIndex, parseInt(value), false)}
                >
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={oIndex.toString()}
                        id={`q${qIndex}-o${oIndex}`}
                      />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleStartNewQuiz}>
            Cancel
          </Button>
          <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
        </CardFooter>
      </Card>
    );
  };

  const renderQuizResults = () => {
    if (!quizResult) return null;

    const percentScore = Math.round((quizResult.totalMarksObtained / quizResult.totalMarks) * 100);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(quizResult.totalMarksObtained, quizResult.totalMarks)}`}>
                {quizResult.totalMarksObtained} / {quizResult.totalMarks} ({percentScore}%)
              </p>
              <Progress value={percentScore} className="mt-2 h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Correct</p>
                <p className="text-xl font-bold text-green-600">{quizResult.correctAttempt}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Partial</p>
                <p className="text-xl font-bold text-yellow-600">{quizResult.partialAttempt}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Incorrect</p>
                <p className="text-xl font-bold text-red-600">{quizResult.incorrectAttempt}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Unattempted</p>
                <p className="text-xl font-bold text-gray-600">{quizResult.unAttempt}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Time Taken</p>
              <p className="text-lg">
                {Math.floor(quizResult.totalTimeTaken / 60000)} min {Math.floor((quizResult.totalTimeTaken % 60000) / 1000)} sec
              </p>
            </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="questions">
              <AccordionTrigger>Review Questions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {quizResult.quiz.map((question, qIndex) => (
                    <div key={qIndex} className="border p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-medium">
                          {qIndex + 1}. {question.question}
                        </div>
                        {question.correct ? (
                          <Badge className="bg-green-500">Correct</Badge>
                        ) : question.marksObtained && question.marksObtained > 0 ? (
                          <Badge className="bg-yellow-500">Partial</Badge>
                        ) : (
                          <Badge className="bg-red-500">Incorrect</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex} 
                            className={`p-2 rounded ${
                              question.correctAnswers.includes(oIndex)
                                ? "bg-green-100 border-green-300 border"
                                : question.selectedAnswers?.includes(oIndex)
                                  ? "bg-red-100 border-red-300 border"
                                  : "bg-gray-50"
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium">Explanation:</p>
                        <p className="mt-1 text-gray-700">{question.explanation}</p>
                      </div>
                      
                      {question.marksObtained !== undefined && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Marks:</span>{" "}
                          <span className={question.marksObtained > 0 ? "text-green-600" : "text-red-600"}>
                            {question.marksObtained}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartNewQuiz} className="w-full">
            Start New Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Button variant="outline" onClick={() => navigate("/quiz-history")}>
          Quiz History
        </Button>
      </div>

      {/* Main quiz UI */}
      {currentStep === "generate" && renderGenerateForm()}
      {currentStep === "quiz" && renderQuizQuestions()}
      {currentStep === "result" && renderQuizResults()}
    </Layout>
  );
};

export default Quizzes;
