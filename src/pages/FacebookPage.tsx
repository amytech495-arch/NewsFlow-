import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Facebook,
  FileText,
  HelpCircle,
  Image,
  Loader2,
  RefreshCw,
  Send,
  Settings,
  ThumbsUp,
  Users,
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

export function FacebookPage() {
  const { t } = useTranslation();
  const [fbAutoPost, setFbAutoPost] = usePersistedToggle("nf-fb-autopost", false);
  const [fbIncludeImages, setFbIncludeImages] = usePersistedToggle("nf-fb-images", true);
  const [fbPreviewBefore, setFbPreviewBefore] = usePersistedToggle("nf-fb-preview", false);
  const fbStats = useQuery(api.articles.facebookStats);
  const unsentFb = useQuery(api.articles.unsent_facebook);
  const postFacebookTest = useAction(api.pipeline.postFacebookTest);
  const postToFacebook = useAction(api.pipeline.postToFacebook);
  const checkConnection = useAction(api.pipeline.checkFacebookConnection);

  const [testLoading, setTestLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    checking: boolean;
    pageName?: string;
    followers?: number;
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
        pageName: result.pageName,
        followers: result.followers,
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

  const handlePostTest = async () => {
    setTestLoading(true);
    try {
      const result = await postFacebookTest();
      if (result.success) {
        alert("✅ Test post published to Facebook!");
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setTestLoading(false);
  };

  const handlePostBatch = async () => {
    if (!unsentFb || unsentFb.length === 0) {
      alert("No unsent articles to post to Facebook.");
      return;
    }
    setBatchLoading(true);
    const batch = unsentFb.slice(0, 5);
    let sent = 0;
    for (const article of batch) {
      try {
        const result = await postToFacebook({
          articleId: article._id,
          title: article.rewrittenTitle || article.title,
          content: article.rewrittenContent || article.description,
          url: article.url,
        });
        if (result.success) sent++;
      } catch {
        // continue
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    alert(`✅ Posted ${sent}/${batch.length} articles to Facebook.`);
    setBatchLoading(false);
  };

  const pageStats = [
    {
      label: t("facebook.followers"),
      value: String(connectionStatus.followers ?? "—"),
      icon: Users,
    },
    {
      label: t("facebook.totalPosts"),
      value: String(fbStats?.totalPosts ?? 0),
      icon: FileText,
    },
    {
      label: t("facebook.successful"),
      value: String(fbStats?.successful ?? 0),
      icon: Send,
    },
    { label: t("facebook.engagement"), value: "—", icon: ThumbsUp },
  ];

  // pageSettings rendered inline below with persisted toggles

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("facebook.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("facebook.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Page Info */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <Facebook className="size-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {connectionStatus.pageName || "Facebook News Page"}
                  </span>
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
                  facebook.com/newspage
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {pageStats.map((stat) => (
              <div key={stat.label} className="text-center py-2">
                <stat.icon className="size-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handlePostTest}
              disabled={testLoading}
            >
              <Send className="size-3.5 mr-1.5" />
              {testLoading ? t("telegram.posting") : t("facebook.postTest")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handlePostBatch}
              disabled={batchLoading}
            >
              <Send className="size-3.5 mr-1.5" />
              {batchLoading
                ? "Posting..."
                : `Post Batch (${Math.min(unsentFb?.length ?? 0, 5)})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Page Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("facebook.pageSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Auto Post */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Send className="size-4" />
                </div>
                <div>
                  <span className="text-sm font-medium">{t("facebook.autoPost")}</span>
                  <p className="text-xs text-muted-foreground">{t("facebook.autoPostDesc")}</p>
                </div>
              </div>
              <Switch checked={fbAutoPost} onCheckedChange={setFbAutoPost} />
            </div>
            <Separator />
            {/* Post Format */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Settings className="size-4" />
                </div>
                <div>
                  <span className="text-sm font-medium">{t("facebook.postFormat")}</span>
                  <p className="text-xs text-muted-foreground">{t("facebook.postFormatDesc")}</p>
                </div>
              </div>
              <span className="text-sm text-primary font-medium">Rich &gt;</span>
            </div>
            <Separator />
            {/* Include Images */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                  <Image className="size-4" />
                </div>
                <div>
                  <span className="text-sm font-medium">{t("facebook.includeImages")}</span>
                  <p className="text-xs text-muted-foreground">{t("facebook.includeImagesDesc")}</p>
                </div>
              </div>
              <Switch checked={fbIncludeImages} onCheckedChange={setFbIncludeImages} />
            </div>
            <Separator />
            {/* Preview Before Post */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Eye className="size-4" />
                </div>
                <div>
                  <span className="text-sm font-medium">{t("facebook.previewBefore")}</span>
                  <p className="text-xs text-muted-foreground">{t("facebook.previewBeforeDesc")}</p>
                </div>
              </div>
              <Switch checked={fbPreviewBefore} onCheckedChange={setFbPreviewBefore} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
