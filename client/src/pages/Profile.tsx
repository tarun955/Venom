import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
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
import { Camera, MessageSquare, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Profile() {
  const { toast } = useToast();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

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

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      setPhotoUrl(user.photoUrl);
      form.reset({
        username: user.username,
        password: "", // Don't set the password
        name: user.name,
        age: user.age,
        branch: user.branch,
        hostelStatus: user.hostelStatus,
        hobbies: user.hobbies,
        instagramHandle: user.instagramHandle || "",
        photoUrl: user.photoUrl,
      });
    }
  }, [user, form]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      // Ensure we're passing the current user's ID
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          id: user?.id // Include the user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      form.setValue("photoUrl", url);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
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
                    {user?.name?.[0]?.toUpperCase() || "?"}
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
                {user?.name || "Complete Your Profile"}
              </h1>
              <p className="text-muted-foreground">
                {user?.branch || "Set your branch and interests"}
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
              <Button variant="destructive" className="gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="hobbies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hobbies</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter hobbies (comma separated)"
                          value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                          onChange={(e) => {
                            const hobbies = e.target.value
                              .split(",")
                              .map((hobby) => hobby.trim())
                              .filter((hobby) => hobby.length > 0);
                            field.onChange(hobbies);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Updating..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}