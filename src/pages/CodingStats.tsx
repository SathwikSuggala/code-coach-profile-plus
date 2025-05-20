import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface LeetCodeStats {
  matchedUser: {
    username: string;
    submitStats: {
      acSubmissionNum: {
        difficulty: string;
        count: number;
        submissions: number;
      }[];
    };
  };
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

interface ContestRating {
  LeetCode: LeetCodeContest[];
  CodeForces: CodeForcesContest[];
  overallRating: number;
  overallRanking: number;
  numberOfLeetCodeContests: number;
  numberOfCodeForcesContests: number;
}

interface CalendarData {
  totalSubmissions: number;
  totalActiveDays: number;
  maxStreak: number;
  months: {
    name: string;
    days: {
      date: string;
      submissions: number;
    }[];
  }[];
}

interface CombinedMonthlySubmissions {
  labels: string[];
  LeetCode: number[];
  Codeforces: number[];
}

const CodingStats = () => {
  const [leetCodeStats, setLeetCodeStats] = useState<LeetCodeStats | null>(null);
  const [contestRatings, setContestRatings] = useState<ContestRating | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [attendedContests, setAttendedContests] = useState<LeetCodeContest[]>([]);
  const [codeForcesContests, setCodeForcesContests] = useState<CodeForcesContest[]>([]);
  const [availableContests, setAvailableContests] = useState<CodeForcesUser[]>([]);
  const [combinedSubmissions, setCombinedSubmissions] = useState<CombinedMonthlySubmissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          leetCodeData, 
          contestData, 
          calendarData, 
          attendedContestsData, 
          codeForcesData, 
          availableContestsData,
          combinedSubmissionsData
        ] = await Promise.all([
          apiService.getLeetCodeStats(),
          apiService.getContestRatings(),
          apiService.getLeetCodeCalendar(),
          apiService.getLeetCodeAttendedContests(),
          apiService.getCodeForcesContests(),
          apiService.getCodeForcesAvailableContests(),
          apiService.getCombinedMonthlySubmissions()
        ]);

        console.log('Calendar Data:', calendarData);

        setCalendarData(calendarData);
        setLeetCodeStats(leetCodeData.data);
        setContestRatings(contestData);
        setAttendedContests(attendedContestsData);
        setCodeForcesContests(codeForcesData);
        setAvailableContests(availableContestsData.result);
        setCombinedSubmissions(combinedSubmissionsData);
      } catch (error) {
        console.error("Error fetching coding stats:", error);
        toast.error("Failed to load coding statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderMonthLabels = (weeks) => {
    if (!calendarData?.months) return null;

    // Get the start date of the heatmap
    const today = new Date();
    const heatmapStartDate = new Date(today);
    heatmapStartDate.setFullYear(today.getFullYear() - 1);

    // Find the week index for each month start
    const displayedWeeks = weeks.length;
    const monthLabels = [];

    calendarData.months.forEach((month) => {
      // Get the year for this month
      const currentYear = today.getFullYear();
      const monthIndex = new Date(`${month.name} 1, ${currentYear}`).getMonth();
      const year = monthIndex > today.getMonth() ? currentYear - 1 : currentYear;
      const monthStartDate = new Date(`${month.name} 1, ${year}`);

      // Calculate the week index from the heatmap start
      const diffDays = Math.floor((monthStartDate.getTime() - heatmapStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIdx = Math.floor(diffDays / 7);

      if (weekIdx >= 0 && weekIdx < displayedWeeks) {
        // Calculate left offset as a percentage
        const leftPercent = (weekIdx / displayedWeeks) * 100;
        monthLabels.push(
          <span
            key={month.name + year}
            className="text-xs text-gray-500"
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              whiteSpace: 'nowrap',
              transform: 'none',
              minWidth: '1px',
            }}
          >
            {month.name.slice(0, 3)}
          </span>
        );
      }
    });

    return (
      <div style={{ position: 'relative', height: '16px', width: '100%', marginTop: '8px' }}>
        {monthLabels}
      </div>
    );
  };

  const renderHeatMap = () => {
    if (!calendarData?.months) return null;

    // Create a map of all days with their submissions
    const submissionsMap = new Map();
    calendarData.months.forEach(month => {
      month.days?.forEach((day, dayIndex) => {
        // Get the correct year based on the month
        const currentYear = new Date().getFullYear();
        const monthIndex = new Date(`${month.name} 1, ${currentYear}`).getMonth();
        const year = monthIndex > new Date().getMonth() ? currentYear - 1 : currentYear;
        
        const date = new Date(`${month.name} ${dayIndex + 1}, ${year}`);
        submissionsMap.set(date.toISOString().split('T')[0], day.submissions || 0);
      });
    });

    // Get the date range (last 365 days)
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);

    // Create array of all days in the last year
    const allDays = [];
    const currentDate = new Date(lastYear);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      allDays.push({
        date: new Date(currentDate),
        submissions: submissionsMap.get(dateStr) || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group days by week
    const weeks = [];
    let currentWeek = [];
    allDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === allDays.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    const maxSubmissions = Math.max(...allDays.map(d => d.submissions));
    const minSubmissions = Math.min(...allDays.map(d => d.submissions));

    const getColorIntensity = (submissions: number) => {
      if (submissions === 0) return 'bg-gray-100';
      const intensity = Math.floor(((submissions - minSubmissions) / (maxSubmissions - minSubmissions)) * 4);
      const colors = ['bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700'];
      return colors[intensity] || colors[colors.length - 1];
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 w-3">
              {day[0]}
            </div>
          ))}
        </div>
        <div
          className="w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
            gap: '2px',
          }}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-4 h-4 ${getColorIntensity(day.submissions)} rounded-sm`}
                  title={`${format(day.date, 'MMM d, yyyy')}: ${day.submissions} submissions`}
                />
              ))}
            </div>
          ))}
        </div>
        {renderMonthLabels(weeks)}
      </div>
    );
  };

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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Coding Statistics</h1>

        {/* Activity Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Calendar</CardTitle>
            <CardDescription>Daily coding activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Total Submissions</div>
                  <div className="text-2xl font-bold">{calendarData?.totalSubmissions || 0}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Active Days</div>
                  <div className="text-2xl font-bold">{calendarData?.totalActiveDays || 0}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Max Streak</div>
                  <div className="text-2xl font-bold">{calendarData?.maxStreak || 0}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {renderHeatMap()}
              </div>

              <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                  {['bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700'].map((color, index) => (
                    <div key={index} className={`w-3 h-3 ${color} rounded-sm`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combined Monthly Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Submissions</CardTitle>
            <CardDescription>Combined submissions from LeetCode and CodeForces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={combinedSubmissions?.labels.map((label, index) => ({
                    month: label,
                    LeetCode: combinedSubmissions.LeetCode[index],
                    Codeforces: combinedSubmissions.Codeforces[index]
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="LeetCode" fill="#8884d8" />
                  <Bar dataKey="Codeforces" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contests Section - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LeetCode Contests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent LeetCode Contests</CardTitle>
              <CardDescription>Your recent contest performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {attendedContests.map((contest, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{contest.contest.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(contest.contest.startTime * 1000).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contest.problemsSolved}/{contest.totalProblems} problems solved
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rating: {contest.rating.toFixed(0)}</div>
                        <div className="text-sm text-gray-500">Rank #{contest.ranking}</div>
                        <div className={`text-sm ${contest.trendDirection === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                          {contest.trendDirection === 'UP' ? '↑' : '↓'} {Math.abs(contest.rating - (index > 0 ? attendedContests[index - 1].rating : 0)).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CodeForces Contests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent CodeForces Contests</CardTitle>
              <CardDescription>Your recent contest performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {codeForcesContests.map((contest, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{contest.contestName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rating: {contest.newRating}</div>
                        <div className="text-sm text-gray-500">Rank #{contest.rank}</div>
                        <div className={`text-sm ${contest.newRating > contest.oldRating ? 'text-green-500' : 'text-red-500'}`}>
                          {contest.newRating > contest.oldRating ? '↑' : '↓'} {Math.abs(contest.newRating - contest.oldRating)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available CodeForces Contests */}
        <Card>
          <CardHeader>
            <CardTitle>Available CodeForces Contests</CardTitle>
            <CardDescription>Upcoming and ongoing contests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {availableContests.map((contest, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img 
                        src={contest.avatar} 
                        alt={contest.handle} 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{contest.handle}</div>
                        <div className="text-sm text-gray-500">
                          {contest.firstName} {contest.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contest.city}, {contest.country}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Rating: {contest.rating}</div>
                      <div className="text-sm text-gray-500">Rank: {contest.rank}</div>
                      <div className="text-sm text-gray-500">
                        Max Rating: {contest.maxRating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LeetCode Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>LeetCode Statistics</CardTitle>
              <CardDescription>Problem solving progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Solved Problems</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {leetCodeStats?.matchedUser.submitStats.acSubmissionNum.map((stat) => (
                      <div key={stat.difficulty} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-dev-blue">{stat.count}</div>
                        <div className="text-sm text-gray-500">{stat.difficulty}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Submission Distribution</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leetCodeStats?.matchedUser.submitStats.acSubmissionNum.filter(s => s.difficulty !== "All")}
                          dataKey="count"
                          nameKey="difficulty"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {leetCodeStats?.matchedUser.submitStats.acSubmissionNum
                            .filter(s => s.difficulty !== "All")
                            .map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contest Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Contest Ratings</CardTitle>
              <CardDescription>Performance in coding contests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Overall Rating</div>
                    <div className="text-2xl font-bold">{contestRatings?.overallRating}</div>
                    <div className="text-sm text-gray-500">Rank #{contestRatings?.overallRanking}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Total Contests</div>
                    <div className="text-2xl font-bold">
                      {contestRatings ? contestRatings.numberOfLeetCodeContests + contestRatings.numberOfCodeForcesContests : 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contestRatings?.numberOfLeetCodeContests} LeetCode + {contestRatings?.numberOfCodeForcesContests} CodeForces
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Rating Progress</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={contestRatings?.LeetCode}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="contest.title" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="rating" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CodingStats; 