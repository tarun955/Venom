import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Memes from "@/pages/Memes";
import Confessions from "@/pages/Confessions";
import QA from "@/pages/QA";
import Chat from "@/pages/Chat";
import BottomNav from "@/components/BottomNav";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile" component={Profile} />
        <Route path="/memes" component={Memes} />
        <Route path="/confessions" component={Confessions} />
        <Route path="/qa" component={QA} />
        <Route path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;