"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  Bug,
  Lightbulb,
  Layout,
  Zap,
  MoreHorizontal,
  Reply,
  CheckCheck,
  Loader2,
  MessageSquareHeart,
} from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getFeedbackStatistics,
  getAllFeedback,
  markFeedbackAsRead,
  toggleFeedbackResolved,
  respondToFeedback,
} from "@/actions/feedback/feedback-actions";
import { FeedbackCategory, FeedbackPriority } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";

// Category icons and colors
const categoryConfig: Record<
  FeedbackCategory,
  { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
  FEATURE_REQUEST: {
    icon: Lightbulb,
    label: "Feature Request",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  BUG_REPORT: {
    icon: Bug,
    label: "Bug Report",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  IMPROVEMENT: {
    icon: Zap,
    label: "Improvement",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  USER_EXPERIENCE: {
    icon: Layout,
    label: "User Experience",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  OTHER: {
    icon: MoreHorizontal,
    label: "Other",
    color: "text-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
};

// Priority colors
const priorityConfig: Record<FeedbackPriority, { label: string; color: string; bgColor: string }> = {
  LOW: { label: "Low", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  MEDIUM: { label: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  HIGH: { label: "High", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
};

// Chart configurations
const feedbackTrendChartConfig = {
  count: {
    label: "Feedback",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const satisfactionChartConfig = {
  count: {
    label: "Count",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

// Category colors for pie chart
const CATEGORY_COLORS: Record<string, string> = {
  FEATURE_REQUEST: "#f59e0b",
  BUG_REPORT: "#ef4444",
  IMPROVEMENT: "#8b5cf6",
  USER_EXPERIENCE: "#3b82f6",
  OTHER: "#64748b",
};

// Rating colors for satisfaction chart
const RATING_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
};

// Priority colors
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "PENDING" | "RESOLVED">("ALL");
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [markResolvedOnResponse, setMarkResolvedOnResponse] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch statistics - optimized with proper staleTime
  const { data: statsData } = useQuery({
    queryKey: ["feedback-statistics"],
    queryFn: async () => {
      const result = await getFeedbackStatistics();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch feedback with server-side pagination - OPTIMIZED
  const { data: feedbackResponse, isLoading: feedbackLoading } = useQuery({
    queryKey: ["all-feedback", categoryFilter, statusFilter, currentPage],
    queryFn: async () => {
      const filters: {
        category?: FeedbackCategory;
        isRead?: boolean;
        isResolved?: boolean;
        page?: number;
        limit?: number;
      } = {
        page: currentPage,
        limit: pageSize,
      };
      if (categoryFilter !== "ALL") filters.category = categoryFilter;
      // Apply status filter at server level
      if (statusFilter === "UNREAD") filters.isRead = false;
      if (statusFilter === "RESOLVED") filters.isResolved = true;
      if (statusFilter === "PENDING") filters.isResolved = false;

      const result = await getAllFeedback(filters);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract data and pagination from response
  const feedbackData = feedbackResponse?.data || [];
  const pagination = feedbackResponse?.pagination;

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: markFeedbackAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-statistics"] });
    },
  });

  // Toggle resolved mutation
  const toggleResolvedMutation = useMutation({
    mutationFn: toggleFeedbackResolved,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
        queryClient.invalidateQueries({ queryKey: ["feedback-statistics"] });
      }
    },
  });

  // Respond to feedback mutation
  const respondMutation = useMutation({
    mutationFn: ({ feedbackId, response, markResolved }: { feedbackId: string; response: string; markResolved: boolean }) =>
      respondToFeedback(feedbackId, response, markResolved),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Response sent successfully");
        setResponseDialogOpen(false);
        setResponseText("");
        setSelectedFeedback(null);
        queryClient.invalidateQueries({ queryKey: ["all-feedback"] });
        queryClient.invalidateQueries({ queryKey: ["feedback-statistics"] });
      }
    },
  });

  // Filter feedback - only search filter on client (status filter is server-side now)
  const filteredFeedback = feedbackData?.filter((feedback) => {
    // Search filter only (lightweight client-side filtering)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        feedback.title.toLowerCase().includes(query) ||
        feedback.message.toLowerCase().includes(query) ||
        feedback.user?.name?.toLowerCase().includes(query) ||
        feedback.user?.email?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Reset to page 1 when filters change
  const handleCategoryChange = (value: FeedbackCategory | "ALL") => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: "ALL" | "UNREAD" | "PENDING" | "RESOLVED") => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Format category data for charts
  const categoryChartData = statsData?.categoryBreakdown.map((item) => ({
    name: categoryConfig[item.category].label,
    value: item.count,
    fill: CATEGORY_COLORS[item.category] || "#64748b",
  }));

  // Create dynamic chart config for category pie chart
  const categoryChartConfig = categoryChartData?.reduce(
    (acc, item) => {
      acc[item.name] = {
        label: item.name,
        color: item.fill,
      };
      return acc;
    },
    {} as ChartConfig
  ) || {};

  // Format satisfaction data
  const satisfactionChartData = statsData?.satisfactionDistribution.map((item) => ({
    name: `${item.rating} Star${item.rating > 1 ? "s" : ""}`,
    value: item.count,
    fill: RATING_COLORS[item.rating] || "#64748b",
  }));

  // Format trend data
  const trendChartData = statsData?.feedbackTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: item.count,
  }));

  const handleOpenResponse = (feedbackId: string) => {
    setSelectedFeedback(feedbackId);
    setResponseDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!selectedFeedback || !responseText.trim()) return;
    respondMutation.mutate({
      feedbackId: selectedFeedback,
      response: responseText,
      markResolved: markResolvedOnResponse,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Feedback</h1>
        <p className="text-muted-foreground">Monitor user feedback and gain insights to improve the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquareHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{statsData?.unread ?? 0}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {statsData?.avgSatisfaction ?? 0}
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsData?.resolutionRate ?? 0}%</div>
            <p className="text-xs text-muted-foreground">
              {statsData?.resolved ?? 0} of {statsData?.total ?? 0} resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Feedback Trend */}
        <Card className="pt-0 lg:col-span-2">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Feedback Trend (Last 30 Days)</CardTitle>
              <CardDescription>Daily feedback submissions over time</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={feedbackTrendChartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="fillFeedback" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill="url(#fillFeedback)"
                  stroke="var(--color-count)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Feedback by Category</CardTitle>
              <CardDescription>Distribution of feedback types</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {categoryChartData && categoryChartData.length > 0 ? (
              <ChartContainer
                config={categoryChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    strokeWidth={2}
                  >
                    {categoryChartData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="name"
                      className="fill-foreground"
                      stroke="none"
                      fontSize={11}
                      formatter={(value: string) => value}
                    />
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satisfaction Distribution */}
        <Card className="pt-0 lg:col-span-2">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Satisfaction Ratings</CardTitle>
              <CardDescription>How users rate their experience</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {satisfactionChartData && satisfactionChartData.length > 0 ? (
              <ChartContainer
                config={satisfactionChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={satisfactionChartData}
                  layout="vertical"
                  margin={{ right: 16 }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={70}
                  />
                  <XAxis dataKey="value" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar dataKey="value" layout="vertical" radius={4}>
                    {satisfactionChartData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      offset={8}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No satisfaction data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Urgency breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <div className="space-y-4">
              {statsData?.priorityBreakdown.map((item) => {
                const config = priorityConfig[item.priority];
                const percentage = statsData.total > 0 ? Math.round((item.count / statsData.total) * 100) : 0;
                return (
                  <div key={item.priority} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("font-medium", config.color)}>{config.label}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: PRIORITY_COLORS[item.priority] || "#64748b",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription>Review and respond to user submissions</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="UNREAD">Unread</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {feedbackLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFeedback && filteredFeedback.length > 0 ? (
            <div className="space-y-4">
              {/* Results count */}
              {pagination && (
                <div className="flex items-center justify-between text-sm text-muted-foreground pb-2">
                  <span>
                    Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} feedback
                  </span>
                </div>
              )}
              {filteredFeedback.map((feedback) => {
                const catConfig = categoryConfig[feedback.category];
                const prioConfig = feedback.priority ? priorityConfig[feedback.priority] : null;
                const CategoryIcon = catConfig.icon;

                return (
                  <div
                    key={feedback.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      !feedback.isRead && "bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800",
                      feedback.isResolved && "opacity-75"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={feedback.user?.image || ""} />
                        <AvatarFallback>{feedback.user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold">{feedback.user?.name || "Unknown User"}</span>
                          <span className="text-sm text-muted-foreground">{feedback.user?.email}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary" className={cn("gap-1", catConfig.bgColor, catConfig.color)}>
                            <CategoryIcon className="h-3 w-3" />
                            {catConfig.label}
                          </Badge>
                          {prioConfig && (
                            <Badge variant="secondary" className={cn(prioConfig.bgColor, prioConfig.color)}>
                              {prioConfig.label}
                            </Badge>
                          )}
                          {feedback.satisfactionRating && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {feedback.satisfactionRating}/5
                            </Badge>
                          )}
                          {!feedback.isRead && (
                            <Badge className="bg-cyan-500 hover:bg-cyan-600">New</Badge>
                          )}
                          {feedback.isResolved && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>

                        {/* Title & Message */}
                        <h4 className="font-medium mb-1">{feedback.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{feedback.message}</p>

                        {/* Admin Response */}
                        {feedback.adminResponse && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 border-l-4 border-cyan-500">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Reply className="h-3 w-3" />
                              Admin Response
                            </p>
                            <p className="text-sm">{feedback.adminResponse}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!feedback.isRead && (
                            <DropdownMenuItem onClick={() => markReadMutation.mutate(feedback.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleOpenResponse(feedback.id)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Respond
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleResolvedMutation.mutate(feedback.id)}>
                            {feedback.isResolved ? (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Pending
                              </>
                            ) : (
                              <>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark as Resolved
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">No feedback found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Try adjusting your filters"
                  : "User feedback will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>Send a response to the user about their feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Write your response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="markResolved"
                checked={markResolvedOnResponse}
                onCheckedChange={(checked) => setMarkResolvedOnResponse(checked as boolean)}
              />
              <Label htmlFor="markResolved" className="text-sm font-normal">
                Mark as resolved after sending
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={!responseText.trim() || respondMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {respondMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Reply className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
