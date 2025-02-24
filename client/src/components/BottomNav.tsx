import { Link, useLocation } from "wouter";
import { Home, Image, MessageCircle, HelpCircle, User } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const links = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/memes", icon: Image, label: "Memes" },
    { path: "/confessions", icon: MessageCircle, label: "Confessions" },
    { path: "/qa", icon: HelpCircle, label: "Q&A" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around px-4">
      {links.map(({ path, icon: Icon, label }) => {
        const isActive = location === path;
        return (
          <Link key={path} href={path}>
            <a className="flex flex-col items-center gap-1">
              <Icon
                className={`w-6 h-6 ${
                  isActive
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
