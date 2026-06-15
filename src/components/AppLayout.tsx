import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { Bell, FileText } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { api } from "../../convex/_generated/api";

export function AppLayout() {
  const location = useLocation();
  const [lastReadAt, setLastReadAt] = useState(() => {
    const stored = localStorage.getItem("nf-notif-read-at");
    return stored ? Number(stored) : 0;
  });

  const notifCount = useQuery(api.logs.unreadCount, { lastReadAt });

  // Mark as read when visiting /logs
  useEffect(() => {
    if (location.pathname === "/logs") {
      const now = Date.now();
      localStorage.setItem("nf-notif-read-at", String(now));
      setLastReadAt(now);
    }
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top header bar — always visible */}
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/80 backdrop-blur-md px-4">
          {/* Left: Sidebar trigger */}
          <div className="flex items-center w-10">
            <SidebarTrigger className="md:hidden" />
          </div>

          {/* Center: Animated logo + branding */}
          <Link
            to="/dashboard"
            className="flex-1 flex items-center justify-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="newsflow-icon-wrapper size-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <FileText className="size-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {APP_TAGLINE}
              </span>
            </div>
          </Link>

          {/* Right: Notification bell */}
          <div className="flex items-center w-10 justify-end">
            <Link
              to="/logs"
              className="relative p-2 rounded-full hover:bg-accent transition-colors"
            >
              <Bell className="size-5 text-muted-foreground" />
              {(notifCount ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-background">
                  {(notifCount ?? 0) > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Animated icon styles */}
        <style>{`
          .newsflow-icon-wrapper {
            animation: newsflowPulse 3s ease-in-out infinite;
            position: relative;
          }

          .newsflow-icon-wrapper::after {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 10px;
            background: linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6);
            background-size: 300% 300%;
            animation: newsflowGlow 4s ease-in-out infinite;
            z-index: -1;
            opacity: 0.5;
            filter: blur(4px);
          }

          @keyframes newsflowPulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            50% {
              transform: scale(1.08);
              box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
            }
          }

          @keyframes newsflowGlow {
            0%, 100% {
              background-position: 0% 50%;
              opacity: 0.4;
            }
            50% {
              background-position: 100% 50%;
              opacity: 0.7;
            }
          }
        `}</style>
      </SidebarInset>
    </SidebarProvider>
  );
}
