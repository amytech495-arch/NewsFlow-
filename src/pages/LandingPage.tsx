import { useConvexAuth } from "convex/react";
import {
  ArrowRight,
  Brain,
  Check,
  Facebook,
  FileText,
  Newspaper,
  Send,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type LandingPageViewProps = {
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthActions: boolean;
};

function LandingPageView({
  isAuthenticated,
  isLoading,
  showAuthActions,
}: LandingPageViewProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <FileText className="size-4 text-white" />
          </div>
          <span className="font-bold">NewsFlow</span>
        </div>
        {showAuthActions && !isAuthenticated && !isLoading && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}
        {showAuthActions && isAuthenticated && (
          <Button size="sm" asChild>
            <Link to="/dashboard">
              Dashboard <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            Automated News Pipeline
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            News to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
              Telegram to Facebook
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Fetch news from multiple APIs, rewrite with AI, and automatically
            post to your Telegram channel and Facebook page. All on autopilot.
          </p>

          {showAuthActions && !isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="text-base h-11 px-6" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base h-11 px-6"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
          {showAuthActions && isAuthenticated && (
            <div className="pt-2">
              <Button size="lg" className="text-base h-11 px-6" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-green-400" />
              <span>6+ News APIs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-green-400" />
              <span>AI Rewriting</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Check className="size-4 text-green-400" />
              <span>Full Automation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wide uppercase">
              Pipeline
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How NewsFlow Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A fully automated 4-step pipeline from news fetch to social media
              posting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: Newspaper,
                title: "1. Fetch News",
                desc: "Pull from NewsAPI, GNews, NewsData, Currents, TheNewsAPI & RSS feeds",
                color: "bg-blue-500/10 text-blue-400",
              },
              {
                icon: Brain,
                title: "2. AI Rewrite",
                desc: "Rewrite articles with Gemini AI for professional, unique content",
                color: "bg-amber-500/10 text-amber-400",
              },
              {
                icon: Send,
                title: "3. Telegram",
                desc: "Post formatted news to your Telegram channel automatically",
                color: "bg-cyan-500/10 text-cyan-400",
              },
              {
                icon: Facebook,
                title: "4. Facebook",
                desc: "Publish to your Facebook Page with images and hashtags",
                color: "bg-purple-500/10 text-purple-400",
              },
            ].map(feature => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-foreground/20"
              >
                <div
                  className={`inline-flex size-11 items-center justify-center rounded-xl ${feature.color} mb-4`}
                >
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {showAuthActions && (
            <div className="text-center mt-12">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Start Now
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Designed & developed with excellence by{" "}
          <span className="font-bold">NWABENU FRANK CHIBEZE</span>
        </p>
      </footer>
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <LandingPageView
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      showAuthActions
    />
  );
}
