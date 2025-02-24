import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowBigUp, ArrowBigDown, Share2, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMemeSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Meme } from "@shared/schema";

export default function Memes() {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: memes, isLoading } = useQuery<Meme[]>({
    queryKey: ["/api/memes"],
  });

  const form = useForm({
    resolver: zodResolver(insertMemeSchema),
    defaultValues: {
      userId: 1, // TODO: Replace with actual user ID
      imageUrl: "",
      caption: "",
      tags: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const createMeme = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append("userId", data.userId.toString());
      formData.append("caption", data.caption);

      // Convert comma-separated string to array and filter out empty values
      const tags = data.tags.split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      formData.append("tags", JSON.stringify(tags));

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch("/api/memes", {
        method: "POST",
        body: formData,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memes"] });
      toast({
        title: "Meme uploaded",
        description: "Your meme has been shared with the community.",
      });
      form.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
    },
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Meme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload a New Meme</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createMeme.mutate(data))}
                className="space-y-4"
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`w-full aspect-square rounded-lg border-2 border-dashed ${
                      previewUrl ? "border-primary" : "border-muted"
                    } relative overflow-hidden`}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Image className="w-12 h-12 mb-2" />
                        <p>Click to upload image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption</FormLabel>
                      <FormControl>
                        <Input placeholder="Add a caption..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="funny, college, hostel (comma separated)"
                          {...field}
                          value={field.value ? field.value.join(", ") : ""}
                          onChange={(e) => {
                            field.onChange(e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMeme.isPending || !selectedImage}
                >
                  {createMeme.isPending ? "Uploading..." : "Upload"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

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
                    <Badge key={tag} variant="secondary" className="bg-[#4F46E5]/20">
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