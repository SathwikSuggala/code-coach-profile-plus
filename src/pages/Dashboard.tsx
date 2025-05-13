
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
  const [isLoading, setIsLoading] = useState(true);

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
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ""}! Here's an overview of your progress.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Submission Chart */}
      {submissions && submissions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Submissions</CardTitle>
            <CardDescription>Your LeetCode submissions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={submissions}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default Dashboard;
