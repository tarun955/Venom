import { motion, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiInstagram } from "react-icons/si";
import type { User } from "@shared/schema";

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: "left" | "right") => void;
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full"
      whileDrag={{ scale: 1.05 }}
    >
      <Card className="w-full aspect-[3/4] overflow-hidden">
        <CardContent className="p-0 h-full relative">
          <img
            src={user.photoUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-2xl font-bold">{user.name}, {user.age}</h3>
              {user.instagramHandle && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <SiInstagram className="w-4 h-4" />
                  {user.instagramHandle}
                </Badge>
              )}
            </div>
            <p className="text-white/80 mt-1">{user.branch}</p>
            <p className="text-white/80">{user.hostelStatus}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.hobbies.map((hobby) => (
                <Badge key={hobby} variant="outline" className="bg-white/10">
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
