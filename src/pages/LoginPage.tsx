import { useEffect, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { SignIn } from "@/components/SignIn";
import { TestUserLoginSection } from "@/components/TestUserLoginSection";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";

const CF_SITE_KEY = "0x4AAAAAADkgiC35AIuBIGZy";

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function CloudflareTurnstile({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    // Load Turnstile script if not loaded
    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.head.appendChild(script);
    }

    const renderWidget = () => {
      if (
        renderedRef.current ||
        !widgetRef.current ||
        !(window as any).turnstile
      )
        return;
      renderedRef.current = true;
      (window as any).turnstile.render(widgetRef.current, {
        sitekey: CF_SITE_KEY,
        callback: (token: string) => onVerify(token),
        theme: "dark",
      });
    };

    // Wait for script to load
    const interval = setInterval(() => {
      if ((window as any).turnstile) {
        renderWidget();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [onVerify]);

  return <div ref={widgetRef} className="flex justify-center" />;
}

export function LoginPage() {
  const { t } = useTranslation();
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const { signIn } = useAuthActions();

  const handleGoogleSignIn = () => {
    if (!turnstileVerified) return;
    signIn("google").catch((err: unknown) => {
      console.error("Google sign-in error:", err);
      alert("Google sign-in failed: " + String(err));
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Top nav bar */}
        <div className="flex items-center justify-between -mt-8 mb-4">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileText className="size-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">NewsFlow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t("auth.signIn")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">{t("auth.getStarted")}</Link>
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("auth.welcomeBack")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("auth.signInDesc")}
          </p>
        </div>

        {/* Cloudflare Turnstile */}
        <CloudflareTurnstile onVerify={() => setTurnstileVerified(true)} />

        {!turnstileVerified && (
          <p className="text-center text-xs text-amber-400">
            ⚠️ Please complete the verification above to sign in
          </p>
        )}

        <div
          className={
            turnstileVerified
              ? ""
              : "opacity-50 pointer-events-none select-none"
          }
        >
          <TestUserLoginSection />
          <SignIn />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign in with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full h-11 gap-3 text-sm font-medium"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Button variant="link" className="p-0 h-auto font-medium" asChild>
              <Link to="/signup">{t("auth.signUp")}</Link>
            </Button>
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Verified & protected by Cloudflare
          </p>
        </div>
      </div>
    </div>
  );
}
