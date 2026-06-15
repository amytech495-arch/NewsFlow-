import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Facebook,
  HelpCircle,
  Newspaper,
  Send,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "@/contexts/TranslationContext";

export function AnalyticsPage() {
  const { t } = useTranslation();
  const overview = useQuery(api.articles.analyticsOverview);
  const weeklyData = useQuery(api.articles.weeklyActivity);

  const overviewStats = [
    {
      label: t("analytics.fetched"),
      value: String(overview?.totalFetched ?? 0),
      change: overview?.fetchedChange
        ? `${overview.fetchedChange > 0 ? "+" : ""}${overview.fetchedChange}%`
        : "—",
      icon: Newspaper,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      label: t("analytics.sent"),
      value: String(overview?.totalSent ?? 0),
      change: overview?.sentChange
        ? `${overview.sentChange > 0 ? "+" : ""}${overview.sentChange}%`
        : "—",
      icon: Send,
      color: "bg-cyan-500/20 text-cyan-400",
    },
    {
      label: t("analytics.posted"),
      value: String(overview?.totalPosted ?? 0),
      change: overview?.postedChange
        ? `${overview.postedChange > 0 ? "+" : ""}${overview.postedChange}%`
        : "—",
      icon: Facebook,
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      label: t("analytics.successRate"),
      value: `${overview?.successRate ?? 0}%`,
      change: "—",
      icon: TrendingUp,
      color: "bg-green-500/20 text-green-400",
    },
  ];

  const maxFetched = weeklyData
    ? Math.max(...weeklyData.map((d) => d.fetched), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("analytics.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("analytics.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        {overviewStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`size-8 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="size-4" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-xs text-green-400 font-medium">
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("analytics.weeklyActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(weeklyData ?? []).map((day) => (
              <div key={day.day} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium w-8">{day.day}</span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>📰 {day.fetched}</span>
                    <span>📤 {day.sent}</span>
                    <span>📘 {day.posted}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <div
                    className="bg-blue-500 rounded-full"
                    style={{
                      width: `${(day.fetched / maxFetched) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-cyan-500 rounded-full"
                    style={{
                      width: `${(day.sent / maxFetched) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-purple-500 rounded-full"
                    style={{
                      width: `${(day.posted / maxFetched) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] text-muted-foreground">
                Fetched
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-cyan-500" />
              <span className="text-[10px] text-muted-foreground">Sent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-purple-500" />
              <span className="text-[10px] text-muted-foreground">Posted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
