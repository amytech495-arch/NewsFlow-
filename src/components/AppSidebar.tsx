import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
  BarChart3,
  BookOpen,
  Facebook,
  FileText,
  Filter,
  HelpCircle,
  Home,
  LogOut,
  Moon,
  Rss,
  Send,
  Settings,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={href} onClick={() => setOpenMobile(false)}>
          <Icon className="size-4" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const mainNavItems = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: Home },
    { href: "/sources", label: t("sidebar.sources"), icon: Rss },
    { href: "/telegram", label: t("sidebar.telegram"), icon: Send },
    { href: "/facebook", label: t("sidebar.facebook"), icon: Facebook },
    { href: "/automation", label: t("sidebar.automation"), icon: Zap },
    { href: "/rules", label: t("sidebar.rules"), icon: Filter },
    { href: "/posts", label: t("sidebar.posts"), icon: FileText },
    { href: "/logs", label: t("sidebar.logs"), icon: BookOpen },
    { href: "/analytics", label: t("sidebar.analytics"), icon: BarChart3 },
  ];

  const bottomNavItems = [
    { href: "/help", label: t("sidebar.help"), icon: HelpCircle },
    { href: "/settings", label: t("sidebar.settings"), icon: Settings },
  ];

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto">
        <Separator className="mx-3 my-2" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map(item => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={location.pathname === item.href}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-3 py-2">
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold"
            size="sm"
          >
            <Sparkles className="size-4 mr-1.5" />
            {t("sidebar.subscribe")}
          </Button>
        </div>
      </div>
    </SidebarContent>
  );
}

function SidebarUserMenu() {
  const user = useQuery(api.auth.currentUser);
  const { signOut } = useAuthActions();
  const { theme, toggleTheme, switchable } = useTheme();
  const { t } = useTranslation();

  return (
    <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
      {switchable && (
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            {theme === "light" ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
            {t("sidebar.darkMode")}
          </span>
          <div
            className={`relative w-9 h-5 rounded-full transition-colors ${
              theme === "dark" ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${
                theme === "dark" ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>
      )}

      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left min-w-0">
          <span className="text-sm font-medium truncate">
            {user?.name || t("sidebar.admin")}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
            {user?.email || "user@example.com"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
      >
        <LogOut className="size-4" />
        Logout
      </button>
    </SidebarFooter>
  );
}

function SidebarHeaderContent() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <Link
        to="/dashboard"
        onClick={() => setOpenMobile(false)}
        className="flex items-center gap-2.5 px-2 py-1"
      >
        <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <FileText className="size-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight">{APP_NAME}</span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {APP_TAGLINE}
          </span>
        </div>
      </Link>
    </SidebarHeader>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeaderContent />
      <SidebarNav />
      <SidebarUserMenu />
    </Sidebar>
  );
}
