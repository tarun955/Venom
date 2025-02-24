import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, MessageSquare, UserPlus } from "lucide-react";

export default function Profile() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      age: 18,
      branch: "",
      hostelStatus: "",
      hobbies: [],
      instagramHandle: "",
      photoUrl: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      form.setValue("photoUrl", url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4 pb-20">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32 border-4 border-primary">
                {photoUrl ? (
                  <AvatarImage src={photoUrl} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-4xl">
                    {form.getValues("name")?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button
                    size="icon"
                    className="rounded-full cursor-pointer"
                    asChild
                  >
                    <div>
                      <Camera className="w-4 h-4" />
                    </div>
                  </Button>
                </label>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                {form.getValues("name") || "Complete Your Profile"}
              </h1>
              <p className="text-muted-foreground">
                {form.getValues("branch") || "Set your branch and interests"}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Matches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Connect
              </Button>
            </div>
          </div>

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Your age"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="Your branch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hostelStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hostel Status</FormLabel>
                      <FormControl>
                        <Input placeholder="Your hostel status" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Handle (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}