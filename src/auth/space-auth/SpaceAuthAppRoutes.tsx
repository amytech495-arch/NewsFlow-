import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "@/components/PublicLayout";
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import {
  AnalyticsPage,
  AutomationPage,
  DashboardPage,
  FacebookPage,
  HelpPage,
  LandingPage,
  LogsPage,
  LoginPage,
  PostsPage,
  RulesPage,
  SettingsPage,
  SignupPage,
  SourcesPage,
  TelegramPage,
} from "@/pages";
import { convex } from "../convexClient";

export function SpaceAuthAppRoutes() {
  return (
    <ConvexAuthProvider client={convex}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/telegram" element={<TelegramPage />} />
            <Route path="/facebook" element={<FacebookPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConvexAuthProvider>
  );
}
