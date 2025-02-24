import { useQuery } from "@tanstack/react-query";
import { ArrowBigUp, ArrowBigDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Meme } from "@shared/schema";

export default function Memes() {
  const { data: memes, isLoading } = useQuery<Meme[]>({
    queryKey: ["/api/memes"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {memes?.map((meme) => (
          <Card key={meme.id} className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={meme.imageUrl}
                alt={meme.caption}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4">
                {meme.caption && (
                  <p className="text-sm text-foreground mb-2">{meme.caption}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {meme.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">
                      <ArrowBigUp className="w-5 h-5 mr-1" />
                      {meme.upvotes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ArrowBigDown className="w-5 h-5 mr-1" />
                      {meme.downvotes}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
