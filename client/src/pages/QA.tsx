import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuestionSchema } from "@shared/schema";
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
import { HelpCircle, Flag, MessageSquare } from "lucide-react";
import type { Question } from "@shared/schema";

export default function QA() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertQuestionSchema),
    defaultValues: {
      content: "",
      isAnonymous: true,
      userId: 1, // TODO: Replace with actual user ID
    },
  });

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const createQuestion = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/questions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      form.reset();
      toast({
        title: "Question posted",
        description: "Your question has been shared with the community.",
      });
    },
  });

  const onSubmit = (data: any) => {
    createQuestion.mutate({
      ...data,
      isAnonymous,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
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
                          placeholder="What would you like to ask?"
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
                      Ask anonymously
                    </span>
                  </div>
                  <Button
                    type="submit"
                    disabled={createQuestion.isPending}
                  >
                    {createQuestion.isPending ? "Posting..." : "Ask"}
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
          questions?.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-foreground mb-4">{question.content}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>
                          {question.isAnonymous
                            ? "Anonymous"
                            : `User #${question.userId}`}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
