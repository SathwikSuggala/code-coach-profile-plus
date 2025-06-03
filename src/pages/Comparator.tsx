import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "../services/apiService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 5;
const TOPICS_PER_PAGE = 3;

interface TopicMasteryData {
  average: number;
  difference: number;
  user: number;
}

interface TopicMasteryResponse {
  [key: string]: TopicMasteryData;
}

const Comparator = () => {
  const [friendUsername, setFriendUsername] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTopicPage, setCurrentTopicPage] = useState(1);

  // Fetch quiz change percentage
  const { data: quizChangePercentage, isLoading: isLoadingQuizChange } = useQuery({
    queryKey: ["quizChangePercentage"],
    queryFn: apiService.getQuizChangePercentage,
  });

  // Fetch topic mastery comparison
  const { data: topicMastery, isLoading: isLoadingTopicMastery } = useQuery<TopicMasteryResponse>({
    queryKey: ["topicMastery"],
    queryFn: apiService.compareTopicMastery,
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: apiService.getLeaderboard,
  });

  // Fetch topic heatmap
  const { data: topicHeatmap, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ["topicHeatmap"],
    queryFn: apiService.getTopicHeatmap,
  });

  // Fetch suggested topics
  const { data: suggestedTopics, isLoading: isLoadingSuggestedTopics } = useQuery({
    queryKey: ["suggestedTopics"],
    queryFn: apiService.getSuggestedTopics,
  });

  // Fetch friend comparison
  const { data: friendComparison, isLoading: isLoadingFriendComparison, refetch: refetchFriendComparison } = useQuery({
    queryKey: ["friendComparison", friendUsername],
    queryFn: () => apiService.compareWithFriend(friendUsername),
    enabled: showComparison && friendUsername !== "",
  });

  const handleCompareWithFriend = () => {
    if (friendUsername) {
      setShowComparison(true);
      refetchFriendComparison();
    }
  };

  const getHeatmapColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calculate pagination for leaderboard
  const totalPages = leaderboard ? Math.ceil(leaderboard.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeaderboardEntries = leaderboard?.slice(startIndex, endIndex);

  // Calculate pagination for topic mastery
  const topicMasteryEntries = topicMastery ? Object.entries(topicMastery) : [];
  const totalTopicPages = Math.ceil(topicMasteryEntries.length / TOPICS_PER_PAGE);
  const topicStartIndex = (currentTopicPage - 1) * TOPICS_PER_PAGE;
  const topicEndIndex = topicStartIndex + TOPICS_PER_PAGE;
  const currentTopicEntries = topicMasteryEntries.slice(topicStartIndex, topicEndIndex);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Code Comparator</h1>
        </div>

        {/* Grid layout for all four cards in a single row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-0">
          {/* Quiz Activity Change */}
          <div className="lg:col-span-2">
            <Card className="h-full border-r">
              <CardHeader className="pb-1">
                <CardTitle className="text-base">Quiz Activity Change</CardTitle>
                <CardDescription className="text-xs">
                  Compared to yesterday
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex items-center justify-center h-[calc(100%-60px)]">
                {isLoadingQuizChange ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-xl font-bold">
                    {quizChangePercentage > 0 ? "+" : ""}{quizChangePercentage}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Topic Mastery Comparison */}
          <div className="lg:col-span-4">
            <Card className="h-full border-r">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Topic Mastery Comparison</CardTitle>
                <CardDescription className="text-xs">
                  Your mastery level compared to average users
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] overflow-y-auto">
                {isLoadingTopicMastery ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <div className="space-y-2">
                      {currentTopicEntries.map(([topic, data]) => (
                        <div key={topic} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{topic}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Avg: {data.average}%</span>
                              <span className={data.difference > 0 ? "text-green-500" : "text-red-500"}>
                                {data.difference > 0 ? "+" : ""}{data.difference}%
                              </span>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress value={data.user} className="h-1" />
                            <Progress 
                              value={data.average} 
                              className="h-1 absolute top-0 left-0 opacity-50" 
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>You: {data.user}%</span>
                            <span>Avg: {data.average}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Topic Mastery Pagination */}
                    {totalTopicPages > 1 && (
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          Page {currentTopicPage} of {totalTopicPages}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => setCurrentTopicPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentTopicPage === 1}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => setCurrentTopicPage(prev => Math.min(prev + 1, totalTopicPages))}
                            disabled={currentTopicPage === totalTopicPages}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Topic Heatmap */}
          <div className="lg:col-span-3">
            <Card className="h-full border-r">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Topic Heatmap</CardTitle>
                <CardDescription className="text-xs">
                  Your mastery level compared to top performers
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] overflow-y-auto">
                {isLoadingHeatmap ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(topicHeatmap || {}).map(([topic, level]) => (
                      <Badge
                        key={topic}
                        className={`${getHeatmapColor(level)} text-white text-xs`}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggested Topics */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Suggested Topics</CardTitle>
                <CardDescription className="text-xs">
                  Topics where you need improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] overflow-y-auto">
                {isLoadingSuggestedTopics ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {suggestedTopics?.map((topic, index) => (
                      <li key={index} className="text-gray-700 text-xs">{topic}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              Top performers based on total topic coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLeaderboard ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Total Coverage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLeaderboardEntries?.map((entry, index) => (
                      <TableRow key={entry.username}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{entry.username}</TableCell>
                        <TableCell>{entry.totalCoverage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, leaderboard?.length || 0)} of {leaderboard?.length || 0} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Compare with Friend */}
        <Card>
          <CardHeader>
            <CardTitle>Compare with Friend</CardTitle>
            <CardDescription>
              Compare your topic mastery with another user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Enter friend's username"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
              />
              <Button onClick={handleCompareWithFriend}>Compare</Button>
            </div>
            {isLoadingFriendComparison ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : showComparison && friendComparison ? (
              <div className="space-y-4">
                {Object.entries(friendComparison).map(([topic, data]) => (
                  <div key={topic} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{topic}</span>
                      <span className="text-sm text-gray-500">{data.verdict}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">You</div>
                        <Progress value={data.user1Score} className="h-2" />
                        <div className="text-sm">{data.user1Score}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Friend</div>
                        <Progress value={data.user2Score} className="h-2" />
                        <div className="text-sm">{data.user2Score}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Comparator; 