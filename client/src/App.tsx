import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Memes from "@/pages/Memes";
import Confessions from "@/pages/Confessions";
import QA from "@/pages/QA";
import Chat from "@/pages/Chat";
import AuthPage from "@/pages/AuthPage";
import BottomNav from "@/components/BottomNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/memes" component={Memes} />
        <ProtectedRoute path="/confessions" component={Confessions} />
        <ProtectedRoute path="/qa" component={QA} />
        <ProtectedRoute path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;