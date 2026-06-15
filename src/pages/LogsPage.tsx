import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  Facebook,
  HelpCircle,
  Newspaper,
  Send,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

const logTypeIcons: Record<
  string,
  { icon: typeof Zap; color: string }
> = {
  fetch: { icon: Newspaper, color: "text-blue-400" },
  telegram: { icon: Send, color: "text-cyan-400" },
  facebook: { icon: Facebook, color: "text-purple-400" },
  automation: { icon: Zap, color: "text-blue-400" },
  error: { icon: AlertTriangle, color: "text-red-400" },
  ai: { icon: Zap, color: "text-amber-400" },
};

export function LogsPage() {
  const { t } = useTranslation();
  const logs = useQuery(api.logs.list, { limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("logs.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("logs.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          {logs && logs.length > 0 ? (
            <div className="space-y-0">
              {logs.map((log, i) => {
                const typeInfo =
                  logTypeIcons[log.type] || logTypeIcons.automation;
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={log._id}
                    className={`flex items-center justify-between py-3 ${
                      i < logs.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`size-4 shrink-0 ${typeInfo.color}`}
                      />
                      <div className="min-w-0">
                        <span className="text-sm truncate block">
                          {log.message}
                        </span>
                        {log.details && (
                          <span className="text-xs text-muted-foreground truncate block">
                            {log.details.substring(0, 100)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <StatusBadge status={log.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("logs.noLogs")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
