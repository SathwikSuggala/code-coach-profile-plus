import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any>(null);
  const [questionStats, setQuestionStats] = useState<any>({
    totalQuestions: 0,
    solvedQuestions: 0,
    percentComplete: 0
  });
  const [topicsKnown, setTopicsKnown] = useState<any>(null);
  const [topicsLearned, setTopicsLearned] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    highestScore: 0,
    quizHistory: [] as any[]
  });
  const [topicStats, setTopicStats] = useState<any[]>([]);
  const [questionTypeStats, setQuestionTypeStats] = useState<any[]>([]);
  const [questionTypePieData, setQuestionTypePieData] = useState<any[]>([]);
  const [allQuestionTypes, setAllQuestionTypes] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data
        const userData = await apiService.getUserInfo();
        setUser(userData);

        // Fetch profile data
        const profileResult = await apiService.getProfileData();
        setProfileData(profileResult);

        // Fetch topics learned with percentages
        const topicsLearnedData = await apiService.getTopicsLearnedWithPercentages();
        setTopicsLearned(topicsLearnedData);

        // Fetch monthly submissions
        const submissionsData = await apiService.getMonthlySubmissions();
        const formattedSubmissions = Object.entries(submissionsData).map(([month, count]) => ({
          month,
          count: Number(count)
        }));
        setSubmissions(formattedSubmissions);
        
        // Fetch questions data
        const allQuestions = await apiService.getAllQuestionNames();
        const solvedQuestionsIds = await apiService.getSolvedQuestionIds();
        
        setQuestionStats({
          totalQuestions: allQuestions.length,
          solvedQuestions: solvedQuestionsIds.length,
          percentComplete: allQuestions.length > 0 
            ? Math.round((solvedQuestionsIds.length / allQuestions.length) * 100) 
            : 0
        });
        
        // Fetch topics known
        const topicsKnownData = await apiService.getTopicsKnown();
        setTopicsKnown(topicsKnownData);
        
        // Fetch quiz statistics
        const quizHistory = await apiService.getAllQuizHistory();
        if (quizHistory && quizHistory.length > 0) {
          const totalQuizzes = quizHistory.length;
          
          // Calculate scores as percentages
          const scores = quizHistory.map((quiz: any) => ({
            score: (quiz.totalMarksObtained / quiz.totalMarks) * 100,
            topic: quiz.topic
          }));
          
          const totalScore = scores.reduce((sum: number, score: any) => sum + score.score, 0);
          const highestScore = Math.max(...scores.map((score: any) => score.score));
          const averageScore = totalScore / totalQuizzes;

          // Process quiz history for chart
          const quizChartData = quizHistory
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((quiz: any) => ({
              date: new Date(quiz.createdAt).toLocaleDateString(),
              score: (quiz.totalMarksObtained / quiz.totalMarks) * 100,
              topic: quiz.topic
            }));

          // Process topic-wise statistics
          const questionTypeSet = new Set<string>();
          const topicData = quizHistory.reduce((acc: any, quiz: any) => {
            if (!acc[quiz.topic]) {
              acc[quiz.topic] = {
                topic: quiz.topic,
                totalQuizzes: 0,
                totalScore: 0,
                questionTypes: {
                  'MCQ': 0,
                  'True-False': 0,
                  'Short Answer': 0
                }
              };
            }
            acc[quiz.topic].totalQuizzes++;
            acc[quiz.topic].totalScore += (quiz.totalMarksObtained / quiz.totalMarks) * 100;
            
            // Count question types with proper categorization
            quiz.quiz.forEach((q: any) => {
              let questionType = 'MCQ';
              if (q.type === 'true-false') {
                questionType = 'True-False';
              } else if (q.type === 'short-answer') {
                questionType = 'Short Answer';
              }
              acc[quiz.topic].questionTypes[questionType]++;
              questionTypeSet.add(questionType);
            });
            
            return acc;
          }, {});

          // Convert topic data to array format for charts
          const topicStatsArray = Object.values(topicData).map((topic: any) => ({
            topic: topic.topic,
            averageScore: (topic.totalScore / topic.totalQuizzes).toFixed(1),
            totalQuizzes: topic.totalQuizzes,
            ...topic.questionTypes // Spread question type counts as top-level keys
          }));

          setAllQuestionTypes(Array.from(questionTypeSet));

          // Process question type statistics for pie chart
          const questionTypeCounts = quizHistory.reduce((acc: any, quiz: any) => {
            quiz.quiz.forEach((q: any) => {
              let questionType = 'MCQ';
              if (q.type === 'true-false') {
                questionType = 'True-False';
              } else if (q.type === 'short-answer') {
                questionType = 'Short Answer';
              }
              
              if (!acc[questionType]) {
                acc[questionType] = 0;
              }
              acc[questionType]++;
            });
            return acc;
          }, {});

          const questionTypePieData = Object.entries(questionTypeCounts)
            .filter(([_, count]: [string, number]) => count > 0) // Only include question types that exist
            .map(([type, count]: [string, number]) => ({
              name: type,
              value: count
            }));

          setTopicStats(topicStatsArray);
          setQuestionTypeStats(topicStatsArray);
          setQuestionTypePieData(questionTypePieData);
          setQuizStats({
            totalQuizzes,
            averageScore,
            highestScore,
            quizHistory: quizChartData
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dev-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/profile")}>
              View Profile
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Questions Solved</CardTitle>
              <CardDescription>Your coding progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-dev-blue">
                    {questionStats.solvedQuestions} / {questionStats.totalQuestions}
                  </p>
                  <p className="text-sm text-gray-500">
                    {questionStats.percentComplete}% Complete
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <div 
                    className="h-12 w-12 rounded-full bg-dev-blue flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      background: `conic-gradient(#3498db ${questionStats.percentComplete}%, #f1f5f9 0)`
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                      <span className="text-dev-blue">{questionStats.percentComplete}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Connected Platforms</CardTitle>
              <CardDescription>Your linked coding accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData?.platforms?.map((platform: any, index: number) => (
                  <div 
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                  >
                    {platform.logo && (
                      <img 
                        src={platform.logo} 
                        alt={platform.name} 
                        className="h-4 w-4 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} 
                      />
                    )}
                    <span>{platform.name}</span>
                  </div>
                ))}
                {(!profileData?.platforms || profileData.platforms.length === 0) && (
                  <p className="text-gray-500 text-sm">No platforms connected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Known Topics</CardTitle>
              <CardDescription>Your areas of expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topicsKnown?.codingTopicsList?.map((topic: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
                {topicsKnown?.otherTopicsList?.map((topic: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
                {(!topicsKnown?.codingTopicsList?.length && !topicsKnown?.otherTopicsList?.length) && (
                  <p className="text-gray-500 text-sm">No topics found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Topics Learned Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Topics Learned</CardTitle>
              <CardDescription>Your learning progress by topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {topicsLearned?.topicNames?.map((topic: string) => (
                  <div key={topic} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{topic}</span>
                      <span>{topicsLearned.topicsPercentage[topic]}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-dev-blue h-1.5 rounded-full"
                        style={{ width: `${topicsLearned.topicsPercentage[topic]}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {topicsLearned.topics[topic]?.map((subtopic: string, index: number) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs"
                        >
                          {subtopic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {(!topicsLearned?.topicNames || topicsLearned.topicNames.length === 0) && (
                  <p className="text-gray-500 text-sm">No topics learned yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Performance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizStats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Total Quizzes Attempted
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Score</span>
                  <span className="font-medium">{quizStats.averageScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Highest Score</span>
                  <span className="font-medium">{quizStats.highestScore.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Topic-wise Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Topic-wise Performance</CardTitle>
              <CardDescription>Average score and number of quizzes per topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="topic" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="averageScore" name="Average Score (%)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="totalQuizzes" name="Number of Quizzes" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Question Types by Topic */}
          <Card>
            <CardHeader>
              <CardTitle>Question Types by Topic</CardTitle>
              <CardDescription>Distribution of question types across topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionTypeStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="topic" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {allQuestionTypes.map((type, index) => (
                      <Bar 
                        key={type}
                        dataKey={type}
                        name={type}
                        fill={COLORS[index % COLORS.length]}
                        stackId="a"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Question Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Question Types Distribution</CardTitle>
              <CardDescription>Overall distribution of question types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={questionTypePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {questionTypePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Existing Quiz Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quizStats.quizHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
