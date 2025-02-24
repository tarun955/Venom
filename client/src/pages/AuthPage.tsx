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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    setLocation('/');
    return null;
  }

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
      photoUrl: "/assets/ai2.png", // Default avatar
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        await loginMutation.mutateAsync({
          username: data.username,
          password: data.password,
        });
        setLocation('/');
      } else {
        await registerMutation.mutateAsync(data);
        setLocation('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Authentication failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hero Section */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-primary/90 to-primary text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to College Connect</h1>
        <p className="text-lg opacity-90 mb-8">
          Connect with fellow students, share memes, and build meaningful relationships in your college community.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <div className="border border-white/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Share & Connect</h3>
            <p className="text-sm opacity-75">Share memes, thoughts, and connect with like-minded students.</p>
          </div>
          <div className="border border-white/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Find Your Match</h3>
            <p className="text-sm opacity-75">Meet students with similar interests and build lasting friendships.</p>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? "Welcome Back!" : "Create Your Account"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Enter your credentials to continue"
                  : "Fill in your details to get started"}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isLogin && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
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
                    </div>

                    <FormField
                      control={form.control}
                      name="hostelStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hostel Status</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="E.g., Hostel A, Day Scholar"
                              {...field}
                            />
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
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                >
                  {loginMutation.isPending || registerMutation.isPending
                    ? "Please wait..."
                    : isLogin
                    ? "Log In"
                    : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-sm"
                onClick={() => {
                  setIsLogin(!isLogin);
                  form.reset();
                }}
              >
                {isLogin
                  ? "Don't have an account? Create one"
                  : "Already have an account? Log in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}