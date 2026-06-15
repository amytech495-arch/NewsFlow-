import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import {
  ArrowLeft,
  Globe,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  Rss,
  Trash2,
  X,
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
import { api } from "../../convex/_generated/api";
import { useTranslation } from "@/contexts/TranslationContext";

const connectedAPIs = [
  { name: "NewsAPI", status: "Connected", color: "bg-blue-500" },
  { name: "GNews", status: "Connected", color: "bg-green-500" },
  { name: "NewsData", status: "Connected", color: "bg-blue-600" },
  { name: "Currents", status: "Connected", color: "bg-green-600" },
  { name: "TheNewsAPI", status: "Connected", color: "bg-emerald-500" },
  { name: "RSS Feed", status: "Free", color: "bg-orange-500" },
];

export function SourcesPage() {
  const { t } = useTranslation();
  const customSources = useQuery(api.customSources.list);
  const addSource = useMutation(api.customSources.add);
  const removeSource = useMutation(api.customSources.remove);
  const toggleSource = useMutation(api.customSources.toggle);
  const fetchRSS = useAction(api.pipeline.fetchFromRSS);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  const handleAddSource = async () => {
    if (!newName.trim() || !newUrl.trim()) return;
    setAdding(true);
    try {
      await addSource({ name: newName.trim(), url: newUrl.trim(), type: "rss" });
      setNewName("");
      setNewUrl("");
      setShowAddModal(false);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setAdding(false);
  };

  const handleDelete = async (id: any) => {
    if (confirm("Delete this source?")) {
      await removeSource({ id });
    }
  };

  const handleFetchRSS = async (source: any) => {
    setFetchingId(source._id);
    try {
      const result = await fetchRSS({
        feedUrl: source.url,
        sourceName: source.name,
        maxArticles: 10,
      });
      if (result.success) {
        alert(`✅ Fetched ${result.fetched} new articles from ${source.name}`);
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setFetchingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("sources.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("sources.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Connected APIs */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("sources.connectedAPIs")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {connectedAPIs.map(api => (
              <div
                key={api.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div
                  className={`size-9 rounded-lg ${api.color} flex items-center justify-center`}
                >
                  <Globe className="size-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium">{api.name}</span>
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-0.5 ${
                        api.status === "Connected"
                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {api.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Sources */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Custom Sources ({customSources?.length ?? 0})
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="size-3.5 mr-1" />
              Add Source
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customSources && customSources.length > 0 ? (
            <div className="space-y-3">
              {customSources.map(source => (
                <div
                  key={source._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                      <Rss className="size-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{source.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {source.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                          📎 {source.url}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleFetchRSS(source)}
                      disabled={fetchingId === source._id}
                    >
                      {fetchingId === source._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={(checked) =>
                        toggleSource({ id: source._id, enabled: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 size-8"
                      onClick={() => handleDelete(source._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("sources.noSources")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("sources.addRssSource")}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Source Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BBC News, CNN, Reuters..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  RSS Feed URL
                </label>
                <input
                  type="url"
                  placeholder="https://feeds.bbci.co.uk/news/rss.xml"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddSource}
                disabled={adding || !newName.trim() || !newUrl.trim()}
              >
                {adding ? (
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <Plus className="size-4 mr-1.5" />
                )}
                Add Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
