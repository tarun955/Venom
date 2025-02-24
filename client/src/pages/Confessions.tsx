import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConfessionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { MessageCircle, Flag } from "lucide-react";
import type { Confession } from "@shared/schema";

export default function Confessions() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertConfessionSchema),
    defaultValues: {
      content: "",
      isAnonymous: true,
      userId: 1, // TODO: Replace with actual user ID
    },
  });

  const { data: confessions, isLoading } = useQuery<Confession[]>({
    queryKey: ["/api/confessions"],
  });

  const createConfession = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/confessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
      form.reset();
      toast({
        title: "Confession posted",
        description: "Your confession has been shared anonymously.",
      });
    },
  });

  const onSubmit = (data: any) => {
    createConfession.mutate({
      ...data,
      isAnonymous,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Share a Confession</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="What's on your mind?"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <span className="text-sm text-muted-foreground">
                      Post anonymously
                    </span>
                  </div>
                  <Button
                    type="submit"
                    disabled={createConfession.isPending}
                  >
                    {createConfession.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          confessions?.map((confession) => (
            <Card key={confession.id}>
              <CardContent className="pt-6">
                <p className="text-foreground mb-4">{confession.content}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {confession.isAnonymous
                        ? "Anonymous"
                        : `User #${confession.userId}`}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
