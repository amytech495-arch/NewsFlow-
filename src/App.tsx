import { AuthStrategyRoutes } from "./auth/AuthStrategyRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TranslationProvider } from "./contexts/TranslationContext";

function App() {
  return (
    <ErrorBoundary>
      <TranslationProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <Toaster />
          <AuthStrategyRoutes />
        </ThemeProvider>
      </TranslationProvider>
    </ErrorBoundary>
  );
}

export default App;
