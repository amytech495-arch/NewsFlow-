import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock,
  Facebook,
  Globe,
  Newspaper,
  Pause,
  Play,
  RefreshCw,
  Rss,
  Send,
  Settings,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "@/contexts/TranslationContext";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
        colors[status] || colors.info
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const logTypeIcons: Record<string, { icon: typeof Zap; color: string }> = {
  fetch: { icon: Newspaper, color: "text-blue-400" },
  telegram: { icon: Send, color: "text-cyan-400" },
  facebook: { icon: Facebook, color: "text-purple-400" },
  automation: { icon: Zap, color: "text-blue-400" },
  error: { icon: AlertTriangle, color: "text-red-400" },
  ai: { icon: Zap, color: "text-amber-400" },
};

const connections = [
  {
    label: "Telegram",
    status: "Connected",
    icon: Send,
    color: "bg-cyan-500",
    href: "/telegram",
  },
  {
    label: "Facebook Page",
    status: "Connected",
    icon: Facebook,
    color: "bg-purple-500",
    href: "/facebook",
  },
  {
    label: "News Sources",
    status: "6 APIs",
    icon: Globe,
    color: "bg-green-500",
    href: "/sources",
  },
];

const quickActions = [
  {
    label: "Sources",
    sublabel: "Manage news sources",
    icon: Rss,
    color: "bg-orange-500/20 text-orange-400",
    href: "/sources",
  },
  {
    label: "Telegram",
    sublabel: "Manage bot & channel",
    icon: Send,
    color: "bg-cyan-500/20 text-cyan-400",
    href: "/telegram",
  },
  {
    label: "Facebook",
    sublabel: "Manage page & posting",
    icon: Facebook,
    color: "bg-purple-500/20 text-purple-400",
    href: "/facebook",
  },
  {
    label: "Automation",
    sublabel: "Rules & settings",
    icon: Settings,
    color: "bg-slate-500/20 text-slate-400",
    href: "/automation",
  },
  {
    label: "Logs",
    sublabel: "Activity & history",
    icon: BarChart3,
    color: "bg-blue-500/20 text-blue-400",
    href: "/logs",
  },
];

export function DashboardPage() {
  const { t } = useTranslation();
  const articleStats = useQuery(api.articles.stats);
  const recentLogs = useQuery(api.logs.list, { limit: 5 });
  const fetchNews = useAction(api.pipeline.fetchNews);
  const runFullCycle = useAction(api.pipeline.runFullCycle);

  const [isRunning, setIsRunning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [automationActive, setAutomationActive] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleFetchNow = async () => {
    setIsFetching(true);
    try {
      await fetchNews({});
      setLastSync(new Date().toLocaleString());
    } finally {
      setIsFetching(false);
    }
  };

  const handleRunFullCycle = async () => {
    setIsRunning(true);
    setAutomationActive(true);
    try {
      await runFullCycle({
        maxPosts: 5,
        hashtags: localStorage.getItem("nf-hashtags") || "#news #newsflow #breaking #update #headline",
        useAiRewrite: localStorage.getItem("nf-gemini-hashtags") !== "false",
      });
      setLastSync(new Date().toLocaleString());
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartAutomation = () => {
    setAutomationActive(true);
    handleRunFullCycle();
  };

  const handleStopAutomation = () => {
    setAutomationActive(false);
  };

  const totalFetched = articleStats?.totalFetched ?? 0;
  const sentTelegram = articleStats?.sentTelegram ?? 0;
  const sentFacebook = articleStats?.sentFacebook ?? 0;
  const todayPosts = articleStats?.todayPosts ?? 0;
  const todayTotal = articleStats?.todayTotal ?? 0;
  const successRate =
    todayTotal > 0 ? Math.round((todayPosts / todayTotal) * 100) : 0;

  const statCards = [
    {
      label: t("dashboard.newsFetched"),
      value: String(totalFetched),
      sublabel: t("dashboard.total"),
      icon: Newspaper,
      color: "bg-blue-500/20 text-blue-400",
      iconBg: "bg-blue-500",
      isSuccess: true,
    },
    {
      label: t("dashboard.sentToTelegram"),
      value: String(sentTelegram),
      sublabel: t("dashboard.total"),
      icon: Send,
      color: "bg-cyan-500/20 text-cyan-400",
      iconBg: "bg-cyan-500",
      isSuccess: true,
    },
    {
      label: t("dashboard.postedToFacebook"),
      value: String(sentFacebook),
      sublabel: "Total",
      icon: Facebook,
      color: "bg-purple-500/20 text-purple-400",
      iconBg: "bg-purple-500",
      isSuccess: true,
    },
    {
      label: t("dashboard.todaysPosts"),
      value: String(todayPosts),
      sublabel: `${successRate}% Success`,
      icon: AlertTriangle,
      color: "bg-orange-500/20 text-orange-400",
      iconBg: "bg-orange-500",
      isSuccess: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* {t("dashboard.automationStatus")} Card */}
      <Card className="nf-gradient-card border-0 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">
                Automation Status
              </h2>
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  automationActive
                    ? "bg-green-500/20 text-green-400 border-green-500/40"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                }`}
              >
                {automationActive ? t("dashboard.active") : t("dashboard.paused")}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {automationActive && (
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                  All systems active
                </span>
              )}
              <span
                className={`text-sm font-semibold ${
                  automationActive ? "text-green-400" : "text-amber-400"
                }`}
              >
                {automationActive ? "Running" : "Paused"}
              </span>
            </div>
          </div>

          <p className="text-white/70 text-sm mb-4">
            {automationActive
              ? "Automation is running. Fetching and posting news."
              : "Automation is paused. Start it to begin fetching & posting."}
          </p>

          {/* Pipeline flow icons — animated */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative nf-icon-float">
              <div className="absolute inset-0 rounded-lg bg-blue-500/20 nf-icon-pulse-ring" />
              <div className="relative size-10 rounded-lg bg-blue-500/30 flex items-center justify-center nf-icon-rotate-in">
                <Newspaper className="size-5 text-blue-300" />
              </div>
            </div>
            <ArrowRight className="size-4 text-white/40 nf-arrow-slide" />
            <div
              className="relative nf-icon-float"
              style={{ animationDelay: "0.4s" }}
            >
              <div
                className="absolute inset-0 rounded-lg bg-cyan-500/20 nf-icon-pulse-ring"
                style={{ animationDelay: "0.4s" }}
              />
              <div
                className="relative size-10 rounded-lg bg-cyan-500/30 flex items-center justify-center nf-icon-rotate-in"
                style={{ animationDelay: "0.2s" }}
              >
                <Send className="size-5 text-cyan-300" />
              </div>
            </div>
            <ArrowRight className="size-4 text-white/40 nf-arrow-slide-delay" />
            <div
              className="relative nf-icon-float"
              style={{ animationDelay: "0.8s" }}
            >
              <div
                className="absolute inset-0 rounded-lg bg-purple-500/20 nf-icon-pulse-ring"
                style={{ animationDelay: "0.8s" }}
              />
              <div
                className="relative size-10 rounded-lg bg-purple-500/30 flex items-center justify-center nf-icon-rotate-in"
                style={{ animationDelay: "0.4s" }}
              >
                <Facebook className="size-5 text-purple-300" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {!automationActive ? (
              <Button
                size="sm"
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                onClick={handleStartAutomation}
                disabled={isRunning}
              >
                <Play className="size-3.5 mr-1.5" />
                {isRunning ? "Starting..." : "Start Automation"}
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                onClick={handleStopAutomation}
              >
                <Pause className="size-3.5 mr-1.5" />
                Stop Automation
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/10"
              onClick={handleFetchNow}
              disabled={isFetching}
            >
              <RefreshCw
                className={`size-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching ? "Fetching..." : "Fetch Now"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/10"
              onClick={handleRunFullCycle}
              disabled={isRunning}
            >
              <Play className="size-3.5 mr-1.5" />
              {isRunning ? "Running..." : "Run Full Cycle"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div
                  className={`mx-auto size-10 rounded-full ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="size-5" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    stat.isSuccess ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              Last Sync: {lastSync || "Never"}
            </div>
            <Link
              to="/logs"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Log <ArrowRight className="size-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("dashboard.connections")}</CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="grid grid-cols-3 gap-3">
            {connections.map((conn) => (
              <Link
                key={conn.label}
                to={conn.href}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div
                  className={`size-12 rounded-full ${conn.color} flex items-center justify-center`}
                >
                  <conn.icon className="size-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center">
                  {conn.label}
                </span>
                <Badge
                  variant="outline"
                  className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]"
                >
                  {conn.status}
                </Badge>
                <span className="text-xs text-primary">View / Edit &gt;</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("dashboard.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="grid grid-cols-5 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors text-center"
              >
                <div
                  className={`size-10 rounded-full ${action.color} flex items-center justify-center`}
                >
                  <action.icon className="size-5" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {action.sublabel}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity — Live from Convex */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("dashboard.recentActivity")}</CardTitle>
            <Link
              to="/logs"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          {recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-0">
              {recentLogs.map((log, i) => {
                const typeInfo = logTypeIcons[log.type] || logTypeIcons.automation;
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={log._id}
                    className={`flex items-center justify-between py-3 ${
                      i < recentLogs.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`size-4 ${typeInfo.color}`} />
                      <span className="text-sm truncate max-w-[200px]">
                        {log.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <StatusBadge status={log.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No activity yet. Click "Fetch Now" or "Run Full Cycle" to get
              started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
