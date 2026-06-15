import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Facebook,
  Filter,
  HelpCircle,
  Newspaper,
  RefreshCw,
  Send,
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
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/contexts/TranslationContext";


const engineStats = [
  { label: "Articles Fetched", value: "0" },
  { label: "Posts Sent", value: "5" },
  { label: "Errors", value: "0" },
];

const pipelineSteps = [
  {
    step: 1,
    label: "Fetch News",
    description: "Pull from NewsAPI, GNews, NewsData, Currents & RSS",
    icon: Newspaper,
    color: "bg-blue-500/20 text-blue-400",
    iconBg: "bg-blue-500",
    active: true,
  },
  {
    step: 2,
    label: "AI Rewrite",
    description: "Rewrite with Gemini AI (professional style)",
    icon: Brain,
    color: "bg-amber-500/20 text-amber-400",
    iconBg: "bg-amber-500",
    active: true,
  },
  {
    step: 3,
    label: "Post to Telegram",
    description: "Send formatted news to Telegram channel",
    icon: Send,
    color: "bg-cyan-500/20 text-cyan-400",
    iconBg: "bg-cyan-500",
    active: true,
  },
  {
    step: 4,
    label: "Post to Facebook",
    description: "Post to Facebook Page",
    icon: Facebook,
    color: "bg-purple-500/20 text-purple-400",
    iconBg: "bg-purple-500",
    active: true,
  },
];

function usePersistedToggle(key: string, defaultValue: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
  });
  const setAndPersist = (v: boolean) => {
    setValue(v);
    localStorage.setItem(key, String(v));
  };
  return [value, setAndPersist];
}

export function AutomationPage() {
  const { t } = useTranslation();
  const [engineActive, setEngineActive] = usePersistedToggle("nf-engine-active", false);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("automation.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("automation.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Automation Engine */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Zap className="size-5 text-white" />
              </div>
              <div>
                <span className="font-semibold">{t("automation.engine")}</span>
                <p className="text-xs text-muted-foreground">
                  Pipeline is paused
                </p>
              </div>
            </div>
            <Switch checked={engineActive} onCheckedChange={setEngineActive} />
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Last run: 6/14/2026, 9:02:46 AM
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {engineStats.map(stat => (
              <div key={stat.label} className="text-center py-3 rounded-lg bg-accent/50">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("automation.manualActions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
          >
            <Newspaper className="size-4 mr-2 text-blue-400" />
            Fetch News Only
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
          >
            <RefreshCw className="size-4 mr-2 text-green-400" />
            Run Full Cycle (Fetch → Rewrite → Post)
          </Button>
        </CardContent>
      </Card>

      {/* Pipeline Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("automation.pipelineSteps")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pipelineSteps.map((step) => (
            <div
              key={step.step}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-lg ${step.iconBg} flex items-center justify-center`}
                >
                  <step.icon className="size-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {step.step}.
                    </span>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  step.active
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/rules">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-sm">{t("sidebar.rules")}</span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/logs">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="text-sm">{t("logs.title")}</span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
