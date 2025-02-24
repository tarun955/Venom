import { motion, PanInfo, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiInstagram } from "react-icons/si";
import type { User } from "@shared/schema";
import { useState } from "react";

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: "left" | "right") => void;
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const controls = useAnimation();
  const [exitX, setExitX] = useState(0);

  const onDragEnd = async (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const swipeThreshold = 100;

    if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? "right" : "left";
      setExitX(direction === "right" ? 1000 : -1000);

      await controls.start({ 
        x: direction === "right" ? 1000 : -1000,
        rotate: direction === "right" ? 50 : -50,
        transition: { duration: 0.2 }
      });

      onSwipe(direction);
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring" } });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      animate={controls}
      initial={{ scale: 1 }}
      whileDrag={{ scale: 1.05 }}
      style={{ x: 0 }}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      <motion.div
        className="absolute inset-0 bg-[#4F46E5] opacity-0"
        style={{
          opacity: 0,
          right: "100%",
        }}
        animate={{
          opacity: exitX > 0 ? 0.3 : 0,
        }}
      />
      <motion.div
        className="absolute inset-0 bg-[#FF6B9D] opacity-0"
        style={{
          opacity: 0,
          left: "100%",
        }}
        animate={{
          opacity: exitX < 0 ? 0.3 : 0,
        }}
      />
      <Card className="w-full aspect-[3/4] overflow-hidden card-gradient">
        <CardContent className="p-0 h-full relative">
          <img
            src={user.photoUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-2xl font-bold">
                {user.name}, {user.age}
              </h3>
              {user.instagramHandle && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-[#4F46E5]/20">
                  <SiInstagram className="w-4 h-4" />
                  {user.instagramHandle}
                </Badge>
              )}
            </div>
            <p className="text-white/80 mt-1">{user.branch}</p>
            <p className="text-white/80">{user.hostelStatus}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.hobbies.map((hobby) => (
                <Badge key={hobby} variant="outline" className="bg-white/10 border-[#FF6B9D]/30">
                  {hobby}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}