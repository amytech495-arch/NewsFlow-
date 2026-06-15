import { useAction, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  FileText,
  Hash,
  HelpCircle,
  Loader2,
  RefreshCw,
  Send,
  Settings,
  Users,
  Volume2,
  XCircle,
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
import { Separator } from "@/components/ui/separator";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "@/contexts/TranslationContext";

// Toggle state persisted to localStorage
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

export function TelegramPage() {
  const { t } = useTranslation();
  const [tgAutoSend, setTgAutoSend] = usePersistedToggle("nf-tg-autosend", false);
  const [tgDisableNotif, setTgDisableNotif] = usePersistedToggle("nf-tg-disablenotif", false);
  const [tgIncludeHashtags, setTgIncludeHashtags] = usePersistedToggle("nf-tg-hashtags", true);
  const stats = useQuery(api.articles.stats);
  const sendTest = useAction(api.pipeline.sendTelegramTest);
  const unsent = useQuery(api.articles.unsent_telegram);
  const sendToTelegram = useAction(api.pipeline.sendToTelegram);
  const checkConnection = useAction(api.pipeline.checkTelegramConnection);

  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBatch, setSendingBatch] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    checking: boolean;
    botName?: string;
    memberCount?: number;
    error?: string;
  }>({ connected: true, checking: false });

  // Check connection on mount
  useEffect(() => {
    handleCheckConnection();
  }, []);

  const handleCheckConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, checking: true }));
    try {
      const result = await checkConnection({});
      setConnectionStatus({
        connected: result.connected,
        checking: false,
        botName: result.botName,
        memberCount: result.memberCount,
        error: result.error,
      });
    } catch (e: any) {
      setConnectionStatus({
        connected: false,
        checking: false,
        error: e.message,
      });
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const result = await sendTest({});
      setTestResult(
        result.success
          ? "✅ Test message sent!"
          : `❌ Failed: ${result.error}`
      );
    } catch (e: any) {
      setTestResult(`❌ Error: ${e.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  const handlePostBatch = async () => {
    if (!unsent || unsent.length === 0) return;
    setSendingBatch(true);
    try {
      const batch = unsent.slice(0, 5);
      const hashtags =
        localStorage.getItem("nf-hashtags") ||
        "#news #newsflow #breaking #update #headline";
      for (const article of batch) {
        await sendToTelegram({
          articleId: article._id,
          title: article.rewrittenTitle || article.title,
          content: article.rewrittenContent || article.description,
          url: article.url,
          imageUrl: article.imageUrl,
          hashtags,
        });
        await new Promise((r) => setTimeout(r, 1500));
      }
    } finally {
      setSendingBatch(false);
    }
  };

  const channelStats = [
    {
      label: "Members",
      value: String(connectionStatus.memberCount ?? "—"),
      icon: Users,
    },
    {
      label: "Total Posts",
      value: String(stats?.sentTelegram ?? 0),
      icon: FileText,
    },
    {
      label: "Successful",
      value: String(stats?.sentTelegram ?? 0),
      icon: Send,
    },
    { label: "Failed", value: "0", icon: Eye },
  ];

  const unsentCount = unsent?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("telegram.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("telegram.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Channel Info */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Send className="size-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Facebook news</span>
                  {connectionStatus.checking ? (
                    <Badge variant="outline" className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-[10px]">
                      <Loader2 className="size-3 mr-1 animate-spin" />
                      Checking...
                    </Badge>
                  ) : connectionStatus.connected ? (
                    <Badge variant="outline" className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
                      <CheckCircle className="size-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
                      <XCircle className="size-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  @facebooknewie • channel
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCheckConnection}
              disabled={connectionStatus.checking}
            >
              <RefreshCw className={`size-4 text-muted-foreground ${connectionStatus.checking ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {connectionStatus.error && !connectionStatus.connected && (
            <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {connectionStatus.error}
            </div>
          )}

          {/* Channel stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {channelStats.map((stat) => (
              <div key={stat.label} className="text-center py-2">
                <stat.icon className="size-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleSendTest}
              disabled={sendingTest}
            >
              <Send className="size-3.5 mr-1.5" />
              {sendingTest ? t("telegram.sending") : "Send Test Message"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handlePostBatch}
              disabled={sendingBatch || unsentCount === 0}
            >
              <Send className="size-3.5 mr-1.5" />
              {sendingBatch
                ? t("telegram.posting")
                : `Post Batch (${Math.min(unsentCount, 5)})`}
            </Button>
          </div>

          {testResult && (
            <p className="text-sm mt-3 text-center">{testResult}</p>
          )}
        </CardContent>
      </Card>

      {/* Channel Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("telegram.channelSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
              {/* Auto Send */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Send className="size-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{t("telegram.autoSend")}</span>
                    <p className="text-xs text-muted-foreground">{t("telegram.autoSendDesc")}</p>
                  </div>
                </div>
                <Switch checked={tgAutoSend} onCheckedChange={setTgAutoSend} />
              </div>
              <Separator />
              {/* Message Format */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Settings className="size-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{t("telegram.messageFormat")}</span>
                    <p className="text-xs text-muted-foreground">{t("telegram.messageFormatDesc")}</p>
                  </div>
                </div>
                <span className="text-sm text-primary font-medium">HTML &gt;</span>
              </div>
              <Separator />
              {/* Disable Notifications */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Volume2 className="size-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{t("telegram.disableNotif")}</span>
                    <p className="text-xs text-muted-foreground">{t("telegram.disableNotifDesc")}</p>
                  </div>
                </div>
                <Switch checked={tgDisableNotif} onCheckedChange={setTgDisableNotif} />
              </div>
              <Separator />
              {/* Include Hashtags */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Hash className="size-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{t("telegram.includeHashtags")}</span>
                    <p className="text-xs text-muted-foreground">{t("telegram.includeHashtagsDesc")}</p>
                  </div>
                </div>
                <Switch checked={tgIncludeHashtags} onCheckedChange={setTgIncludeHashtags} />
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
