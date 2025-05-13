import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const QuizHistory = () => {
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await apiService.getAllQuizHistory();
      setQuizHistory(history);
    } catch (error) {
      toast.error("Failed to fetch quiz history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quiz History</h1>
        <Button variant="outline" onClick={() => navigate("/quizzes")}>
          Back to Quizzes
        </Button>
      </div>

      {loadingHistory ? (
        <div className="py-8 text-center">Loading...</div>
      ) : quizHistory.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No quiz attempts found.</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          {quizHistory.map((quiz, idx) => (
            <Card key={quiz.id || idx}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">
                      {quiz.topic}{quiz.subTopic ? ` / ${quiz.subTopic}` : ""}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(quiz.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Score:</span>
                      <span className={`text-lg font-bold ${getScoreColor(quiz.totalMarksObtained, quiz.totalMarks)}`}>
                        {quiz.totalMarksObtained} / {quiz.totalMarks}
                      </span>
                    </div>
                    <Progress 
                      value={(quiz.totalMarksObtained / quiz.totalMarks) * 100} 
                      className="w-32 h-2"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Correct: {quiz.correctAttempt}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    Incorrect: {quiz.incorrectAttempt}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Partial: {quiz.partialAttempt}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    Unattempted: {quiz.unAttempt}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Time: {Math.round((quiz.totalTimeTaken || 0) / 1000)}s
                  </Badge>
                  <Badge variant="outline" className={quiz.negativeEnabled ? "bg-purple-50 text-purple-700" : "bg-gray-50 text-gray-700"}>
                    Negative Marking: {quiz.negativeEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quiz.quiz.map((q: any, qIdx: number) => (
                    <Accordion key={qIdx} type="single" collapsible>
                      <AccordionItem value={`question-${qIdx}`}>
                        <AccordionTrigger>
                          <div className={`flex items-center gap-2 p-2 rounded-lg w-full ${
                            q.correct ? "bg-green-50" : q.marksObtained && q.marksObtained > 0 ? "bg-yellow-50" : "bg-red-50"
                          }`}>
                            <span className="font-medium">Q{qIdx + 1}: {q.question}</span>
                            <Badge className={`ml-2 ${
                              q.correct ? "bg-green-500" : q.marksObtained && q.marksObtained > 0 ? "bg-yellow-500" : "bg-red-500"
                            }`}>
                              {q.marksObtained} marks
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                              {q.options.map((opt: string, oIdx: number) => (
                                <div 
                                  key={oIdx} 
                                  className={`p-2 rounded-lg ${
                                    q.correctAnswers.includes(oIdx)
                                      ? "bg-green-100 border-green-300 border"
                                      : q.selectedAnswers?.includes(oIdx)
                                        ? "bg-red-100 border-red-300 border"
                                        : "bg-white border border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {q.correctAnswers.includes(oIdx) ? "✓" : q.selectedAnswers?.includes(oIdx) ? "✗" : "○"}
                                    <span>{opt}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-2">Explanation:</h4>
                              <p className="text-gray-700">{q.explanation}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </Layout>
  );
};

export default QuizHistory; 