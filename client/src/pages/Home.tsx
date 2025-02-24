import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeCard from "@/components/SwipeCard";
import type { User } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMatch = useMutation({
    mutationFn: async (data: { user1Id: number; user2Id: number }) => {
      const res = await apiRequest("POST", "/api/matches", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/1"] }); // TODO: Replace with actual user ID
      toast({
        title: "It's a match! 🎉",
        description: "You can now chat with this person.",
      });
    },
  });

  const rejectMatch = useMutation({
    mutationFn: async (data: { user1Id: number; user2Id: number }) => {
      const res = await apiRequest("POST", "/api/matches/reject", data);
      return res.json();
    },
  });

  const handleSwipe = (direction: "left" | "right") => {
    if (!users) return;

    const currentUser = users[currentIndex];
    if (direction === "right") {
      // Create a match when swiping right
      createMatch.mutate({
        user1Id: 1, // TODO: Replace with actual user ID
        user2Id: currentUser.id,
      });
    } else {
      // Reject match when swiping left
      rejectMatch.mutate({
        user1Id: 1, // TODO: Replace with actual user ID
        user2Id: currentUser.id,
      });
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
        <AnimatePresence>
          {[...Array(3)].map((_, i) => {
            const userIndex = currentIndex + i;
            if (userIndex >= users.length) return null;

            return (
              <motion.div
                key={users[userIndex].id}
                initial={{ scale: 1 - i * 0.05, y: i * 10, zIndex: -i }}
                animate={{ scale: 1 - i * 0.05, y: i * 10, zIndex: -i }}
                exit={{ x: 0 }}
                className="absolute top-0 left-0 right-0"
                style={{ filter: `brightness(${1 - i * 0.15})` }}
              >
                {i === 0 ? (
                  <SwipeCard
                    user={users[userIndex]}
                    onSwipe={handleSwipe}
                  />
                ) : (
                  <div className="pointer-events-none">
                    <SwipeCard
                      user={users[userIndex]}
                      onSwipe={() => {}}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

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