import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  Brain,
  Check,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Facebook,
  FileText,
  Filter,
  Globe,
  Hash,
  Image,
  Key,
  Loader2,
  Lock,
  Minus,
  Paintbrush,
  Plus,
  Save,
  Send,
  Settings,
  Shield,
  Type,
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "../../convex/_generated/api";
import { useTranslation, languageOptions, type Language } from "@/contexts/TranslationContext";

/* ═══════════════════════════════════════════════════════
   GENERAL SETTINGS MODAL — Language, Timezone, Date Format
   ═══════════════════════════════════════════════════════ */
function GeneralSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { language: currentLang, setLanguage: setLang, t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<Language>(currentLang);
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem("nf-timezone") || "UTC"
  );
  const [dateFormat, setDateFormat] = useState(
    () => localStorage.getItem("nf-dateformat") || "DD/MM/YYYY"
  );

  const timezones = [
    "UTC",
    "Africa/Lagos",
    "Africa/Cairo",
    "Africa/Johannesburg",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  const dateFormats = [
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "DD.MM.YYYY",
  ];

  function handleSave() {
    setLang(selectedLang);
    localStorage.setItem("nf-timezone", timezone);
    localStorage.setItem("nf-dateformat", dateFormat);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            GENERAL SETTINGS
          </DialogTitle>
          <DialogDescription>
            {t("settings.general")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Language */}
          <div>
            <h4 className="text-sm font-semibold mb-1">{t("settings.language")}</h4>
            <p className="text-xs text-muted-foreground mb-2">
              {t("settings.securityApiKeysDesc")}
            </p>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as Language)}
              className="w-full rounded-lg border border-border bg-accent/50 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {languageOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <h4 className="text-sm font-semibold mb-1">{t("settings.timezone")}</h4>
            <p className="text-xs text-muted-foreground mb-2">
              {t("settings.securityApiKeysDesc")}
            </p>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-border bg-accent/50 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Date Format */}
          <div>
            <h4 className="text-sm font-semibold mb-1">{t("settings.dateFormat")}</h4>
            <p className="text-xs text-muted-foreground mb-2">
              {t("settings.securityApiKeysDesc")}
            </p>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-lg border border-border bg-accent/50 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {dateFormats.map((df) => (
                <option key={df} value={df}>
                  {df}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════
   NOTIFICATION SETTINGS MODAL
   ═══════════════════════════════════════════════════════ */
function NotificationSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const sections = [
    {
      title: "FETCH ALERTS",
      items: [
        {
          label: "Successful Fetch",
          desc: "Notify when news articles are fetched successfully",
          default: true,
        },
        {
          label: "Fetch Errors",
          desc: "Notify when news fetching fails or encounters errors",
          default: true,
        },
      ],
    },
    {
      title: "POSTING ALERTS",
      items: [
        {
          label: "Post Published",
          desc: "Notify when a post is successfully sent to Telegram or Facebook",
          default: true,
        },
        {
          label: "Post Failed",
          desc: "Notify when posting to a platform fails",
          default: true,
        },
      ],
    },
    {
      title: "AUTOMATION",
      items: [
        {
          label: "Automation Started",
          desc: "Notify when the automation cycle begins",
          default: true,
        },
        {
          label: "Automation Stopped",
          desc: "Notify when automation is paused or stopped",
          default: true,
        },
      ],
    },
    {
      title: "CONTENT ALERTS",
      items: [
        {
          label: "Duplicate Detected",
          desc: "Notify when duplicate articles are found and skipped",
          default: true,
        },
        {
          label: "Content Filtered",
          desc: "Notify when articles are blocked by your filters",
          default: true,
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          label: t("settings.dailyDigest"),
          desc: "Receive a daily summary of all activity",
          default: true,
        },
        {
          label: "Notification Sound",
          desc: "Play a sound when notifications are triggered",
          default: true,
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            NOTIFICATION SETTINGS
          </DialogTitle>
          <DialogDescription>
            Configure which notifications and alerts you receive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-muted-foreground tracking-wider mb-3">
                {section.title}
              </h4>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <Switch defaultChecked={item.default} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => onOpenChange(false)}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTOMATION SETTINGS MODAL
   ═══════════════════════════════════════════════════════ */
function AutomationSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const [fetchInterval, setFetchInterval] = useState(60);
  const [maxPosts, setMaxPosts] = useState(5);
  const [postDelay, setPostDelay] = useState(10);
  const [maxArticles, setMaxArticles] = useState(() => {
    const saved = localStorage.getItem("nf-max-articles");
    return saved ? Number(saved) : 10;
  });

  function handleSave() {
    localStorage.setItem("nf-fetch-interval", String(fetchInterval));
    localStorage.setItem("nf-max-posts", String(maxPosts));
    localStorage.setItem("nf-post-delay", String(postDelay));
    localStorage.setItem("nf-max-articles", String(maxArticles));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            AUTOMATION SETTINGS
          </DialogTitle>
          <DialogDescription>
            Configure how the automation pipeline fetches and posts news.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold mb-1">{t("settings.interval")}</h4>
            <p className="text-xs text-muted-foreground mb-3">
              How often to automatically fetch new articles from your sources.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setFetchInterval((v) => Math.max(5, v - 5))}
              >
                <Minus className="size-4" />
              </Button>
              <div className="text-center">
                <span className="text-2xl font-bold">{fetchInterval}</span>
                <span className="text-sm text-muted-foreground ml-1">min</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setFetchInterval((v) => v + 5)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">
              Max Articles Per Fetch
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Maximum number of news articles to fetch per cycle (prevents
              exceeding API limits).
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setMaxArticles((v) => Math.max(1, v - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-2xl font-bold">{maxArticles}</span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setMaxArticles((v) => v + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">
              {t("settings.maxArticles")}
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Maximum number of articles to process and post in each automation
              cycle.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setMaxPosts((v) => Math.max(1, v - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-2xl font-bold">{maxPosts}</span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setMaxPosts((v) => v + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">{t("settings.batchSize")}</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Seconds to wait between posting each article to avoid rate limits.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPostDelay((v) => Math.max(1, v - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <div className="text-center">
                <span className="text-2xl font-bold">{postDelay}</span>
                <span className="text-sm text-muted-foreground ml-1">sec</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPostDelay((v) => v + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Behavior</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-start Automation</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically start fetching and posting when the app loads.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Confirm Before Posting</p>
                  <p className="text-xs text-muted-foreground">
                    Show a confirmation prompt before publishing each post.
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════
   APPEARANCE SETTINGS MODAL (Functional)
   ═══════════════════════════════════════════════════════ */
function AppearanceSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<string>(
    theme === "dark" ? "Dark" : "Light"
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem("nf-accent") || "Blue"
  );
  const [font, setFont] = useState(
    () => localStorage.getItem("nf-font") || "Space Grotesk"
  );

  const accents = [
    { name: "Blue", color: "bg-blue-500" },
    { name: "Emerald", color: "bg-emerald-500" },
    { name: "Purple", color: "bg-purple-500" },
    { name: "Indigo", color: "bg-indigo-400" },
    { name: "Rose", color: "bg-rose-500" },
  ];

  const fonts = [
    {
      name: "Inter",
      desc: "Highly readable & standard modern branding",
      cssFamily: "'Inter', sans-serif",
    },
    {
      name: "Space Grotesk",
      desc: "Sharp & punchy editorial display features",
      cssFamily: "'Space Grotesk', sans-serif",
    },
    {
      name: "JetBrains Mono",
      desc: "Aesthetic developer terminal-style monospacing",
      cssFamily: "'JetBrains Mono', monospace",
    },
  ];

  function handleSave() {
    if (themeMode === "Dark" && theme === "light" && toggleTheme) {
      toggleTheme();
    } else if (themeMode === "Light" && theme === "dark" && toggleTheme) {
      toggleTheme();
    } else if (themeMode === "System") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (
        (systemDark && theme === "light") ||
        (!systemDark && theme === "dark")
      ) {
        toggleTheme?.();
      }
    }

    localStorage.setItem("nf-accent", accentColor);
    const accentMap: Record<string, string> = {
      Blue: "oklch(0.65 0.18 264)",
      Emerald: "oklch(0.65 0.17 160)",
      Purple: "oklch(0.55 0.22 300)",
      Indigo: "oklch(0.55 0.18 280)",
      Rose: "oklch(0.60 0.20 15)",
    };
    if (accentMap[accentColor]) {
      document.documentElement.style.setProperty(
        "--primary",
        accentMap[accentColor]
      );
      document.documentElement.style.setProperty(
        "--ring",
        accentMap[accentColor]
      );
    }

    localStorage.setItem("nf-font", font);
    const fontObj = fonts.find((f) => f.name === font);
    if (fontObj) {
      document.documentElement.style.setProperty(
        "font-family",
        fontObj.cssFamily
      );
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            CONFIGURING APPEARANCE
          </DialogTitle>
          <DialogDescription>
            Customize your console interface layouts, system light/dark presets,
            and color presets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold mb-3">{t("settings.theme")}</h4>
            <div className="grid grid-cols-3 gap-2">
              {(["Light", "Dark", "System"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    themeMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-foreground hover:bg-accent/80"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">
              {t("settings.accentColor")}
            </h4>
            <div className="flex gap-3">
              {accents.map((a) => (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => setAccentColor(a.name)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`size-10 rounded-full ${a.color} flex items-center justify-center ring-2 ${
                      accentColor === a.name
                        ? "ring-white ring-offset-2 ring-offset-background"
                        : "ring-transparent"
                    }`}
                  >
                    {accentColor === a.name && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {a.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">
              {t("settings.font")}
            </h4>
            <div className="space-y-2">
              {fonts.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setFont(f.name)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    font === f.name
                      ? "bg-accent ring-1 ring-primary/50"
                      : "bg-accent/50 hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          f.name === "JetBrains Mono" ? "font-mono" : ""
                        }`}
                      >
                        {f.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                    {font === f.name && (
                      <span className="text-primary text-sm">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════
   HASHTAGS SETTINGS MODAL
   ═══════════════════════════════════════════════════════ */
function HashtagsSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [hashtags, setHashtags] = useState(
    () =>
      localStorage.getItem("nf-hashtags") ||
      "#news, #breaking, #newsflow, #update, #headline"
  );
  const [geminiDynamic, setGeminiDynamic] = useState(
    () => localStorage.getItem("nf-gemini-hashtags") !== "false"
  );

  function handleSave() {
    localStorage.setItem("nf-hashtags", hashtags);
    localStorage.setItem("nf-gemini-hashtags", String(geminiDynamic));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            CONFIGURING HASHTAGS
          </DialogTitle>
          <DialogDescription>
            Define tags appended to your bulletins to drive organic
            discoverability across social networks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold mb-2">
              Static Suffix Hashtags (Comma Separated)
            </h4>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-border bg-accent/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#news, #breaking, #update"
            />
            <p className="text-xs text-primary mt-2">
              These hashtags are automatically appended to every Telegram and
              Facebook post.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  Inject Gemini Dynamic Hashtags
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Allow Gemini AI to extract subject keywords dynamically during
                  summarization (e.g., transforming "Mars Probe" into
                  #SpaceExploration).
                </p>
              </div>
              <Switch
                checked={geminiDynamic}
                onCheckedChange={setGeminiDynamic}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════
   POSTING SETTINGS MODAL
   ═══════════════════════════════════════════════════════ */
function PostingSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [postFormat, setPostFormat] = useState(
    () => localStorage.getItem("nf-post-format") || "HTML"
  );
  const [includeImages, setIncludeImages] = useState(
    () => localStorage.getItem("nf-include-images") !== "false"
  );
  const [includeSourceLinks, setIncludeSourceLinks] = useState(
    () => localStorage.getItem("nf-include-links") !== "false"
  );
  const [includeHashtags, setIncludeHashtags] = useState(
    () => localStorage.getItem("nf-include-hashtags") !== "false"
  );
  const [aiRewrite, setAiRewrite] = useState(
    () => localStorage.getItem("nf-ai-rewrite") !== "false"
  );
  const [rewriteStyle, setRewriteStyle] = useState(
    () => localStorage.getItem("nf-rewrite-style") || "professional"
  );

  function handleSave() {
    localStorage.setItem("nf-post-format", postFormat);
    localStorage.setItem("nf-include-images", String(includeImages));
    localStorage.setItem("nf-include-links", String(includeSourceLinks));
    localStorage.setItem("nf-include-hashtags", String(includeHashtags));
    localStorage.setItem("nf-ai-rewrite", String(aiRewrite));
    localStorage.setItem("nf-rewrite-style", rewriteStyle);
    onOpenChange(false);
  }

  const formatOptions = [
    {
      value: "HTML",
      label: "HTML",
      desc: "Rich formatting with bold, links, etc.",
    },
    {
      value: "MARKDOWN",
      label: "Markdown",
      desc: "Standard markdown formatting",
    },
    {
      value: "PLAIN",
      label: "Plain Text",
      desc: "No formatting, just text",
    },
  ];

  const styleOptions = [
    {
      value: "professional",
      label: "Professional",
      desc: "Formal, news-agency tone",
    },
    {
      value: "casual",
      label: "Casual",
      desc: "Friendly, social-media tone",
    },
    {
      value: "summary",
      label: "Summary",
      desc: "Compressed key facts only",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            POSTING SETTINGS
          </DialogTitle>
          <DialogDescription>
            Configure how your news posts are formatted and published.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Post Format */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Post Format</h4>
            <div className="space-y-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPostFormat(opt.value)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    postFormat === opt.value
                      ? "bg-accent ring-1 ring-primary/50"
                      : "bg-accent/50 hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {opt.desc}
                      </p>
                    </div>
                    {postFormat === opt.value && (
                      <span className="text-primary text-sm">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Content Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include Images</p>
                  <p className="text-xs text-muted-foreground">
                    Attach news images to posts
                  </p>
                </div>
                <Switch
                  checked={includeImages}
                  onCheckedChange={setIncludeImages}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include Source Links</p>
                  <p className="text-xs text-muted-foreground">
                    Add article URL to each post
                  </p>
                </div>
                <Switch
                  checked={includeSourceLinks}
                  onCheckedChange={setIncludeSourceLinks}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include Hashtags</p>
                  <p className="text-xs text-muted-foreground">
                    Append configured hashtags to posts
                  </p>
                </div>
                <Switch
                  checked={includeHashtags}
                  onCheckedChange={setIncludeHashtags}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">AI Rewrite</p>
                  <p className="text-xs text-muted-foreground">
                    Rewrite content using Gemini AI before posting
                  </p>
                </div>
                <Switch
                  checked={aiRewrite}
                  onCheckedChange={setAiRewrite}
                />
              </div>
            </div>
          </div>

          {/* Rewrite Style */}
          {aiRewrite && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Rewrite Style</h4>
              <div className="space-y-2">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRewriteStyle(opt.value)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      rewriteStyle === opt.value
                        ? "bg-accent ring-1 ring-primary/50"
                        : "bg-accent/50 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.desc}
                        </p>
                      </div>
                      {rewriteStyle === opt.value && (
                        <span className="text-primary text-sm">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   API KEY MANAGER MODAL — PIN-protected key management
   ═══════════════════════════════════════════════════════ */
const API_KEY_LABELS: Record<string, { label: string; icon: typeof Key }> = {
  FACEBOOK_PAGE_TOKEN: { label: "Facebook Page Token", icon: Facebook },
  FACEBOOK_PAGE_ID: { label: "Facebook Page ID", icon: Facebook },
  TELEGRAM_TOKEN: { label: "Telegram Bot Token", icon: Send },
  TELEGRAM_CHANNEL: { label: "Telegram Channel", icon: Send },
  NEWSAPI_KEY: { label: "NewsAPI Key", icon: Globe },
  GNEWS_KEY: { label: "GNews Key", icon: Globe },
  NEWSDATA_KEY: { label: "NewsData Key", icon: Globe },
  CURRENTS_KEY: { label: "Currents Key", icon: Globe },
  THENEWSAPI_KEY: { label: "TheNewsAPI Key", icon: Globe },
  GEMINI_API_KEY: { label: "Gemini AI Key", icon: Brain },
};

function ApiKeyManagerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());

  const keysData = useQuery(
    api.apiKeys.listKeys,
    authorized ? { pin } : "skip"
  );
  const updateKey = useMutation(api.apiKeys.updateKey);

  const handlePinSubmit = () => {
    if (pin === "1966") {
      setAuthorized(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleSave = async (keyName: string) => {
    if (!editValue.trim()) return;
    setSaving(true);
    try {
      await updateKey({ pin, keyName, value: editValue.trim() });
      setSavedKey(keyName);
      setEditingKey(null);
      setEditValue("");
      setTimeout(() => setSavedKey(null), 2000);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setSaving(false);
  };

  const toggleShowValue = (name: string) => {
    setShowValues((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleClose = () => {
    setAuthorized(false);
    setPin("");
    setPinError(false);
    setEditingKey(null);
    setShowValues(new Set());
    onOpenChange(false);
  };

  const maskValue = (val: string) => {
    if (!val) return "Not set";
    if (val.length <= 8) return "••••••••";
    return val.slice(0, 4) + "•".repeat(Math.min(val.length - 8, 20)) + val.slice(-4);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            API Key Manager
          </DialogTitle>
          <DialogDescription>
            {authorized
              ? "Update your API keys and tokens. Changes take effect immediately."
              : t("settings.securityApiKeysDesc")}
          </DialogDescription>
        </DialogHeader>

        {!authorized ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="size-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                This section is protected. Enter your 4-digit PIN.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setPinError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                  placeholder="••••"
                  className="w-32 text-center text-2xl tracking-[0.5em] rounded-lg border border-border bg-background px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {pinError && (
                <p className="text-xs text-red-400 font-medium">
                  ❌ Incorrect PIN. Try again.
                </p>
              )}
              <Button onClick={handlePinSubmit} disabled={pin.length !== 4}>
                <Lock className="size-4 mr-2" />
                Unlock
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {keysData?.keys?.map((key) => {
              const meta = API_KEY_LABELS[key.name] || {
                label: key.name,
                icon: Key,
              };
              const Icon = meta.icon;
              const isEditing = editingKey === key.name;
              const isVisible = showValues.has(key.name);
              const justSaved = savedKey === key.name;

              return (
                <div
                  key={key.name}
                  className="p-3 rounded-lg bg-accent/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {justSaved && (
                        <Badge variant="outline" className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
                          <Check className="size-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                      {key.hasValue && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => toggleShowValue(key.name)}
                        >
                          {isVisible ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          if (isEditing) {
                            setEditingKey(null);
                          } else {
                            setEditingKey(key.name);
                            setEditValue(key.value);
                          }
                        }}
                      >
                        {isEditing ? t("common.cancel") : "Edit"}
                      </Button>
                    </div>
                  </div>

                  {/* Show current value (masked) */}
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {isVisible && key.hasValue ? key.value : maskValue(key.value)}
                    </p>
                  )}

                  {/* Edit mode */}
                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={`Enter ${meta.label}...`}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(key.name)}
                        disabled={saving || !editValue.trim()}
                      >
                        {saving ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Save className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const [generalOpen, setGeneralOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [hashtagsOpen, setHashtagsOpen] = useState(false);
  const [postingOpen, setPostingOpen] = useState(false);
  const [apiKeysOpen, setApiKeysOpen] = useState(false);
  const { theme } = useTheme();

  // Restore saved accent + font on mount
  useEffect(() => {
    const savedAccent = localStorage.getItem("nf-accent");
    const accentMap: Record<string, string> = {
      Blue: "oklch(0.65 0.18 264)",
      Emerald: "oklch(0.65 0.17 160)",
      Purple: "oklch(0.55 0.22 300)",
      Indigo: "oklch(0.55 0.18 280)",
      Rose: "oklch(0.60 0.20 15)",
    };
    if (savedAccent && accentMap[savedAccent]) {
      document.documentElement.style.setProperty(
        "--primary",
        accentMap[savedAccent]
      );
      document.documentElement.style.setProperty(
        "--ring",
        accentMap[savedAccent]
      );
    }
    const savedFont = localStorage.getItem("nf-font");
    const fontMap: Record<string, string> = {
      Inter: "'Inter', sans-serif",
      "Space Grotesk": "'Space Grotesk', sans-serif",
      "JetBrains Mono": "'JetBrains Mono', monospace",
    };
    if (savedFont && fontMap[savedFont]) {
      document.documentElement.style.setProperty(
        "font-family",
        fontMap[savedFont]
      );
    }
  }, []);

  const hashtagCount = (
    localStorage.getItem("nf-hashtags") ||
    "#news, #breaking, #newsflow, #update, #headline"
  )
    .split(",")
    .filter((t) => t.trim()).length;

  const postFormat = localStorage.getItem("nf-post-format") || "HTML";

  const generalSettings = [
    {
      label: t("settings.general"),
      description: "App language, timezone and date format",
      icon: Settings,
      color: "bg-slate-500/20 text-slate-400",
      value:
        localStorage.getItem("nf-language") || "English",
      onClick: () => setGeneralOpen(true),
    },
    {
      label: t("settings.automation"),
      description: "Set intervals, retries, and automation behavior",
      icon: Zap,
      color: "bg-green-500/20 text-green-400",
      value: `${localStorage.getItem("nf-fetch-interval") || "60"} min`,
      onClick: () => setAutomationOpen(true),
    },
    {
      label: t("settings.notifications"),
      description: "Configure push notifications and alerts",
      icon: Bell,
      color: "bg-amber-500/20 text-amber-400",
      onClick: () => setNotifOpen(true),
    },
    {
      label: t("settings.dataStorage"),
      description: "Cache, data usage and storage management",
      icon: Database,
      color: "bg-red-500/20 text-red-400",
      onClick: undefined,
    },
    {
      label: t("settings.appearance"),
      description: "Choose app theme and display options",
      icon: Paintbrush,
      color: "bg-purple-500/20 text-purple-400",
      value: theme === "dark" ? "Dark" : "Light",
      onClick: () => setAppearanceOpen(true),
    },
  ];

  const connectionSettings = [
    {
      label: t("sidebar.telegram"),
      description: "Manage your bot, channel and connection",
      icon: Send,
      color: "bg-cyan-500/20 text-cyan-400",
      status: t("common.connected"),
      href: "/telegram",
    },
    {
      label: t("sidebar.facebook"),
      description: "Manage your page connection and settings",
      icon: Facebook,
      color: "bg-purple-500/20 text-purple-400",
      status: "Connected",
      href: "/facebook",
    },
    {
      label: t("sidebar.sources"),
      description: "Manage and organize your news sources",
      icon: Globe,
      color: "bg-green-500/20 text-green-400",
      status: "6 Sources",
      href: "/sources",
    },
  ];

  const postingSettings = [
    {
      label: t("settings.postFormat"),
      description: "Choose how news will be formatted",
      icon: FileText,
      color: "bg-slate-500/20 text-slate-400",
      value: postFormat,
      onClick: () => setPostingOpen(true),
    },
    {
      label: t("settings.imageSettings"),
      description: "Set image size, quality and sources",
      icon: Image,
      color: "bg-blue-500/20 text-blue-400",
      value:
        localStorage.getItem("nf-include-images") === "false" ? t("common.off") : t("common.on"),
      onClick: () => setPostingOpen(true),
    },
    {
      label: t("settings.captionRewrite"),
      description: "Customize title, description and content style",
      icon: Type,
      color: "bg-orange-500/20 text-orange-400",
      value:
        localStorage.getItem("nf-ai-rewrite") === "false"
          ? t("common.off")
          : t("common.on"),
      onClick: () => setPostingOpen(true),
    },
    {
      label: t("settings.hashtags"),
      description: "Manage default hashtags for posts",
      icon: Hash,
      color: "bg-pink-500/20 text-pink-400",
      value: `${hashtagCount} Hashtags`,
      onClick: () => setHashtagsOpen(true),
    },
  ];

  const advancedSettings = [
    {
      label: t("settings.filtersRules"),
      description: "Manage filters, duplicates and content rules",
      icon: Filter,
      href: "/rules",
    },
    {
      label: t("settings.aiSettings"),
      description: "Configure AI rewriting and summarization",
      icon: Brain,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.title")}
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("settings.general")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {generalSettings.map((setting, i) => (
              <div key={setting.label}>
                <button
                  type="button"
                  onClick={setting.onClick}
                  className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-9 rounded-lg ${setting.color} flex items-center justify-center`}
                    >
                      <setting.icon className="size-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        {setting.label}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {"value" in setting && setting.value && (
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                        {setting.value}
                      </span>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </button>
                {i < generalSettings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("settings.connections")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {connectionSettings.map((setting, i) => (
              <div key={setting.label}>
                <Link
                  to={setting.href}
                  className="flex items-center justify-between py-3 hover:bg-accent/50 rounded-lg px-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-9 rounded-lg ${setting.color} flex items-center justify-center`}
                    >
                      <setting.icon className="size-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        {setting.label}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]"
                    >
                      {setting.status}
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
                {i < connectionSettings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posting Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("settings.postingSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {postingSettings.map((setting, i) => (
              <div key={setting.label}>
                <button
                  type="button"
                  onClick={setting.onClick}
                  className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-9 rounded-lg ${setting.color} flex items-center justify-center`}
                    >
                      <setting.icon className="size-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        {setting.label}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-primary font-medium">
                      {setting.value}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </button>
                {i < postingSettings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("settings.advanced")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {advancedSettings.map((setting, i) => (
              <div key={setting.label}>
                {setting.href ? (
                  <Link
                    to={setting.href}
                    className="flex items-center justify-between py-3 hover:bg-accent/50 rounded-lg px-1 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-slate-500/20 text-slate-400 flex items-center justify-center">
                        <setting.icon className="size-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          {setting.label}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-slate-500/20 text-slate-400 flex items-center justify-center">
                        <setting.icon className="size-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          {setting.label}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                )}
                {i < advancedSettings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys / Security */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4 text-amber-400" />
            {t("settings.securityApiKeys")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => setApiKeysOpen(true)}
            className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Key className="size-4" />
              </div>
              <div>
                <span className="text-sm font-medium">API Key Manager</span>
                <p className="text-xs text-muted-foreground">
                  Update Facebook token, Telegram token, and other API keys
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                <Lock className="size-2.5 mr-1" />
                PIN Protected
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Footer note */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">
          🟢 NewsFlow poster active thread. All integrations authorized.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Designed & developed with excellence by{" "}
          <span className="font-bold">NWABENU FRANK CHIBEZE</span>
        </p>
      </div>

      {/* Modals */}
      <GeneralSettingsModal open={generalOpen} onOpenChange={setGeneralOpen} />
      <NotificationSettingsModal open={notifOpen} onOpenChange={setNotifOpen} />
      <AutomationSettingsModal
        open={automationOpen}
        onOpenChange={setAutomationOpen}
      />
      <AppearanceSettingsModal
        open={appearanceOpen}
        onOpenChange={setAppearanceOpen}
      />
      <HashtagsSettingsModal
        open={hashtagsOpen}
        onOpenChange={setHashtagsOpen}
      />
      <PostingSettingsModal
        open={postingOpen}
        onOpenChange={setPostingOpen}
      />
      <ApiKeyManagerModal
        open={apiKeysOpen}
        onOpenChange={setApiKeysOpen}
      />
    </div>
  );
}
