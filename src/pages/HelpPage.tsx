import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Mail,
  MessageCircle,
  PlayCircle,
  Star,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";

const SUPPORT_EMAIL = "nwabenufrank00@gmail.com";

/* ───── FAQ Data ───── */
const faqItems = [
  {
    question: "How does NewsFlow work?",
    answer:
      "NewsFlow automatically fetches news articles from multiple APIs (NewsAPI, GNews, NewsData, Currents, TheNewsAPI), optionally rewrites them with Gemini AI, then posts them to your Telegram channel and Facebook page on a configurable schedule.",
  },
  {
    question: "How do I connect my Telegram bot?",
    answer:
      'Go to Settings → Telegram, enter your bot token from @BotFather, and specify your channel username (e.g. @yourchannel). Make sure the bot is added as an admin to the channel with "Post Messages" permission.',
  },
  {
    question: "How do I connect my Facebook Page?",
    answer:
      "Go to Settings → Facebook Page, enter your Page ID and a Page Access Token with publish_to_groups and pages_manage_posts permissions. You can generate a long-lived token from Facebook's Graph API Explorer.",
  },
  {
    question: "Why is my post not published on Facebook?",
    answer:
      "Common causes: expired page token, insufficient permissions, or the post content violating Facebook's community standards. Check the Logs page for detailed error messages and regenerate your token if needed.",
  },
  {
    question: "How can I filter or block unwanted news?",
    answer:
      "Go to Rules & Filters to set up keyword blocklists, category filters, source exclusions, and duplicate detection. You can also set minimum word counts and language filters.",
  },
  {
    question: "How do I change the fetch interval?",
    answer:
      "Go to Settings → Automation to adjust the fetch interval (minimum 5 minutes). You can also set the maximum posts per cycle and delay between posts to avoid rate limits.",
  },
];

/* ───── FAQ Accordion Item ───── */
function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left"
    >
      <div className="flex items-center justify-between py-3.5 px-1">
        <div className="flex items-center gap-3">
          <HelpCircle className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">{question}</span>
        </div>
        {open ? (
          <ChevronUp className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        )}
      </div>
      {open && (
        <div className="pb-3 pl-8 pr-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </button>
  );
}

/* ───── Help Page ───── */
export function HelpPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{t("help.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("help.subtitle")}
          </p>
        </div>
      </div>

      {/* Need Help? Banner */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1">Need help?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is ready to assist you with any questions or
                issues.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() =>
                    (window.location.href = `mailto:${SUPPORT_EMAIL}?subject=NewsFlow Support Request`)
                  }
                >
                  <Mail className="size-3.5 mr-1.5" />
                  Contact Support
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `mailto:${SUPPORT_EMAIL}?subject=NewsFlow Live Chat`)
                  }
                >
                  <MessageCircle className="size-3.5 mr-1.5" />
                  Live Chat
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Average response time: &lt; 2 hours
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="size-16 rounded-full bg-background/20 flex items-center justify-center">
                <MessageCircle className="size-8 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frequently Asked Questions */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">{t("help.faq")}</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">
              {t("common.all")}
            </span>
          </div>
          <div className="divide-y divide-border">
            {faqItems.map(item => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guides & Resources */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">{t("help.guides")}</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">
              View All
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                title: t("help.gettingStarted"),
                desc: t("help.gettingStartedDesc"),
                icon: BookOpen,
                color: "text-blue-500",
                link: t("help.guides") + " →",
                linkColor: "text-blue-400",
              },
              {
                title: t("help.connectAPIs"),
                desc: t("help.connectAPIsDesc"),
                icon: PlayCircle,
                color: "text-red-500",
                link: t("help.guides") + " →",
                linkColor: "text-red-400",
              },
              {
                title: t("help.setupTelegram"),
                desc: t("help.setupTelegramDesc"),
                icon: Lightbulb,
                color: "text-green-500",
                link: t("help.guides") + " →",
                linkColor: "text-green-400",
              },
              {
                title: t("help.setupFacebook"),
                desc: t("help.setupFacebookDesc"),
                icon: Star,
                color: "text-amber-500",
                link: t("help.guides") + " →",
                linkColor: "text-amber-400",
              },
            ].map(guide => (
              <div key={guide.title} className="text-center space-y-2">
                <div className="mx-auto size-12 rounded-full bg-accent flex items-center justify-center">
                  <guide.icon className={`size-6 ${guide.color}`} />
                </div>
                <h4 className="text-sm font-semibold">{guide.title}</h4>
                <p className="text-xs text-muted-foreground">{guide.desc}</p>
                <span className={`text-xs font-medium ${guide.linkColor}`}>
                  {guide.link}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support Center */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-base font-bold mb-4">{t("help.support")}</h3>
          <div className="space-y-1">
            {[
              {
                label: t("help.contact"),
                desc: SUPPORT_EMAIL,
                icon: Mail,
                color: "text-blue-400",
                action: t("help.contact"),
                actionColor:
                  "bg-blue-500/10 text-blue-400 border border-blue-500/30",
                onClick: () =>
                  (window.location.href = `mailto:${SUPPORT_EMAIL}?subject=NewsFlow Support`),
              },
              {
                label: t("help.support"),
                desc: t("help.troubleshootingDesc"),
                icon: MessageCircle,
                color: "text-green-400",
                action: t("help.support"),
                actionColor:
                  "bg-green-500/10 text-green-400 border border-green-500/30",
                onClick: () =>
                  (window.location.href = `mailto:${SUPPORT_EMAIL}?subject=NewsFlow Chat Request`),
              },
              {
                label: t("help.faq"),
                desc: t("help.troubleshootingDesc"),
                icon: Ticket,
                color: "text-purple-400",
                action: null,
                actionColor: "",
                onClick: undefined,
              },
              {
                label: t("help.documentation"),
                desc: "Check the current status of all systems",
                icon: CheckCircle,
                color: "text-emerald-400",
                action: "All Systems Operational",
                actionColor: "text-emerald-400 text-xs font-medium",
                onClick: undefined,
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-3 px-1 ${
                  i < 3 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-accent flex items-center justify-center">
                    <item.icon className={`size-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                {item.action &&
                  (item.onClick ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className={item.actionColor}
                      onClick={item.onClick}
                    >
                      {item.action}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className={item.actionColor}>{item.action}</span>
                      <ArrowRight className="size-3 text-emerald-400" />
                    </div>
                  ))}
                {!item.action && item.label === "My Tickets" && (
                  <ArrowRight className="size-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* {t("help.contact")} */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Star className="size-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Help us improve</h3>
                <p className="text-xs text-muted-foreground">
                  We value your feedback! Let us know how we can make NewsFlow
                  better for you.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white shrink-0"
              onClick={() =>
                (window.location.href = `mailto:${SUPPORT_EMAIL}?subject=NewsFlow Feedback`)
              }
            >
              Send Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">
          🟢 NewsFlow poster active thread. All integrations authorized.
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Designed & developed with excellence by{" "}
          <span className="font-bold">{t("sidebar.designedBy")}</span>
        </p>
      </div>
    </div>
  );
}
