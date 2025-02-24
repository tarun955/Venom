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
import FaceDetection from "@/components/FaceDetection";

export default function Profile() {
  const [showFaceDetection, setShowFaceDetection] = useState(false);
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
    setShowFaceDetection(true);
  };

  const handleFaceDetected = () => {
    // Submit form after face detection
    console.log("Form submitted:", form.getValues());
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Profile Setup</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </Form>

      <FaceDetection
        isOpen={showFaceDetection}
        onClose={() => setShowFaceDetection(false)}
        onDetected={handleFaceDetected}
      />
    </div>
  );
}
