import { useState } from "react";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  ChevronRight,
  Copy,
  Filter,
  Globe,
  Hash,
  HelpCircle,
  Languages,
  Link2Off,
  MessageSquare,
  Minus,
  Pencil,
  Plus,
  Shield,
  Smile,
  Type,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function RulesPage() {
  const { t } = useTranslation();
  // Content filter states
  const [blockedKeywords, setBlockedKeywords] = useState<string[]>([]);
  const [blockedHashtags, setBlockedHashtags] = useState<string[]>([]);
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [languageFilter, setLanguageFilter] = useState("English");
  const [matureContent, setMatureContent] = usePersistedToggle("nf-rule-mature", true);
  const [duplicateFilter, setDuplicateFilter] = usePersistedToggle("nf-rule-duplicate", true);

  // Processing rule states
  const [minWordCount, setMinWordCount] = useState(20);
  const [titleLengthLimit, setTitleLengthLimit] = useState(80);
  const [removeStopWords, setRemoveStopWords] = usePersistedToggle("nf-rule-stopwords", true);
  const [removeLinks, setRemoveLinks] = usePersistedToggle("nf-rule-links", false);
  const [aiRewrite, _setAiRewrite] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState("All");

  // Modals
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const [hashtagsOpen, setHashtagsOpen] = useState(false);
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [domainInput, setDomainInput] = useState("");

  const activeFilters =
    blockedKeywords.length +
    blockedHashtags.length +
    blockedDomains.length +
    (matureContent ? 1 : 0) +
    (duplicateFilter ? 1 : 0) +
    (languageFilter !== "All" ? 1 : 0);

  const activeRules =
    (removeStopWords ? 1 : 0) +
    (removeLinks ? 1 : 0) +
    (aiRewrite ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("rules.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("rules.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="size-4 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">
                {t("rules.activeFilters")}
              </span>
            </div>
            <div className="text-3xl font-bold">{activeFilters}</div>
            <p className="text-xs text-muted-foreground">
              {t("rules.subtitle")}
            </p>
            <button
              type="button"
              className="text-xs text-primary font-medium mt-2 hover:underline"
            >
              {t("rules.viewFilters")} &gt;
            </button>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="size-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                {t("rules.activeRules")}
              </span>
            </div>
            <div className="text-3xl font-bold">{activeRules}</div>
            <p className="text-xs text-muted-foreground">
              {t("rules.processingRules")}
            </p>
            <button
              type="button"
              className="text-xs text-primary font-medium mt-2 hover:underline"
            >
              {t("rules.viewRules")} &gt;
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Content Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("sidebar.rules")}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("rules.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Blocked Keywords */}
          <button
            type="button"
            onClick={() => setKeywordsOpen(true)}
            className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Pencil className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.blockedKeywords")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.blockedKeywordsDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {blockedKeywords.length} {t("rules.keywords")}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </button>
          <Separator />

          {/* Blocked Hashtags */}
          <button
            type="button"
            onClick={() => setHashtagsOpen(true)}
            className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Hash className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.blockedHashtags")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.blockedHashtagsDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {blockedHashtags.length} {t("rules.hashtags")}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </button>
          <Separator />

          {/* Blocked Domains */}
          <button
            type="button"
            onClick={() => setDomainsOpen(true)}
            className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                <Globe className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.blockedDomains")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.blockedDomainsDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {blockedDomains.length} {t("rules.domains")}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </button>
          <Separator />

          {/* Language Filter */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <Languages className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.languageFilter")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.languageFilterDesc")}
                </p>
              </div>
            </div>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="text-xs bg-accent border border-border rounded-md px-2 py-1 text-foreground"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="All">All</option>
            </select>
          </div>
          <Separator />

          {/* Mature Content Filter */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Shield className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">
                  {t("rules.matureContent")}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.matureContentDesc")}
                </p>
              </div>
            </div>
            <Switch
              checked={matureContent}
              onCheckedChange={setMatureContent}
            />
          </div>
          <Separator />

          {/* Duplicate Content Filter */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Copy className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">
                  {t("rules.duplicateFilter")}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.duplicateFilterDesc")}
                </p>
              </div>
            </div>
            <Switch
              checked={duplicateFilter}
              onCheckedChange={setDuplicateFilter}
            />
          </div>
        </CardContent>
      </Card>

      {/* Processing Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("automation.pipelineSteps")}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("rules.processingRules")}
          </p>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Minimum Word Count */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                <CheckCircle className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.minWordCount")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.minWordCountDesc")}
                </p>
              </div>
            </div>
            <select
              value={minWordCount}
              onChange={(e) => setMinWordCount(Number(e.target.value))}
              className="text-xs bg-accent border border-border rounded-md px-2 py-1 text-foreground"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
          <Separator />

          {/* Title Length Limit */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Type className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.titleLength")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.titleLengthDesc")}
                </p>
              </div>
            </div>
            <select
              value={titleLengthLimit}
              onChange={(e) => setTitleLengthLimit(Number(e.target.value))}
              className="text-xs bg-accent border border-border rounded-md px-2 py-1 text-foreground"
            >
              <option value={60}>60</option>
              <option value={80}>80</option>
              <option value={100}>100</option>
              <option value={120}>120</option>
            </select>
          </div>
          <Separator />

          {/* Remove Stop Words */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-slate-500/20 text-slate-400 flex items-center justify-center">
                <Ban className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.removeStopWords")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.removeStopWordsDesc")}
                </p>
              </div>
            </div>
            <Switch
              checked={removeStopWords}
              onCheckedChange={setRemoveStopWords}
            />
          </div>
          <Separator />

          {/* Remove Links from Content */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <Link2Off className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">
                  {t("rules.removeLinks")}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.removeLinksDesc")}
                </p>
              </div>
            </div>
            <Switch checked={removeLinks} onCheckedChange={setRemoveLinks} />
          </div>
          <Separator />

          {/* AI Rewrite Rule */}
          <button
            type="button"
            className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.aiRewriteRule")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.aiRewriteRuleDesc")}
                </p>
              </div>
            </div>
            <span className="text-xs text-primary font-medium">
              {aiRewrite ? t("common.on") : t("common.off")} &gt;
            </span>
          </button>
          <Separator />

          {/* Sentiment Filter */}
          <div className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Smile className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">{t("rules.sentimentFilter")}</span>
                <p className="text-xs text-muted-foreground">
                  {t("rules.sentimentFilterDesc")}
                </p>
              </div>
            </div>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="text-xs bg-accent border border-border rounded-md px-2 py-1 text-foreground"
            >
              <option value="All">All</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Keywords Modal */}
      <ListEditorModal
        open={keywordsOpen}
        onOpenChange={setKeywordsOpen}
        title={t("rules.blockedKeywords")}
        description={t("rules.addKeyword")}
        items={blockedKeywords}
        onAdd={(item) => setBlockedKeywords((prev) => [...prev, item])}
        onRemove={(i) =>
          setBlockedKeywords((prev) => prev.filter((_, idx) => idx !== i))
        }
        inputValue={keywordInput}
        onInputChange={setKeywordInput}
        placeholder={t("rules.enterKeyword")}
      />

      {/* Blocked Hashtags Modal */}
      <ListEditorModal
        open={hashtagsOpen}
        onOpenChange={setHashtagsOpen}
        title={t("rules.blockedHashtags")}
        description={t("rules.addHashtag")}
        items={blockedHashtags}
        onAdd={(item) => setBlockedHashtags((prev) => [...prev, item])}
        onRemove={(i) =>
          setBlockedHashtags((prev) => prev.filter((_, idx) => idx !== i))
        }
        inputValue={hashtagInput}
        onInputChange={setHashtagInput}
        placeholder={t("rules.enterHashtag")}
      />

      {/* Blocked Domains Modal */}
      <ListEditorModal
        open={domainsOpen}
        onOpenChange={setDomainsOpen}
        title={t("rules.blockedDomains")}
        description={t("rules.addDomain")}
        items={blockedDomains}
        onAdd={(item) => setBlockedDomains((prev) => [...prev, item])}
        onRemove={(i) =>
          setBlockedDomains((prev) => prev.filter((_, idx) => idx !== i))
        }
        inputValue={domainInput}
        onInputChange={setDomainInput}
        placeholder={t("rules.enterDomain")}
      />
    </div>
  );
}

/* ── Reusable list editor modal ── */
function ListEditorModal({
  open,
  onOpenChange,
  title,
  description,
  items,
  onAdd,
  onRemove,
  inputValue,
  onInputChange,
  placeholder,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  inputValue: string;
  onInputChange: (v: string) => void;
  placeholder: string;
}) {
  const { t } = useTranslation();
  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      onInputChange("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-border bg-accent/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button size="sm" onClick={handleAdd}>
              <Plus className="size-4 mr-1" />
              {t("common.add")}
            </Button>
          </div>
          {items.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/50"
                >
                  <span className="text-sm">{item}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Minus className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              {t("common.noResults")}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
