import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeCard from "@/components/SwipeCard";
import type { User } from "@shared/schema";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right" && users) {
      // Handle match
      console.log("Match with:", users[currentIndex].name);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (!users || currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-center mb-4">
          No more profiles to show!
        </h2>
        <p className="text-muted-foreground text-center">
          Check back later for more matches
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="relative h-[70vh] max-w-md mx-auto">
        <SwipeCard user={users[currentIndex]} onSwipe={handleSwipe} />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full h-16 w-16"
            onClick={() => handleSwipe("left")}
          >
            <X className="h-8 w-8" />
          </Button>
          <Button
            size="lg"
            variant="default"
            className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
            onClick={() => handleSwipe("right")}
          >
            <Check className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}
