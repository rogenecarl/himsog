"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, User } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { UpdateProfileNameSchema, type UpdateProfileNameInput } from "@/schemas";
import { updateProfileName } from "@/actions/user/profile-actions";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ProfileForm() {
  const user = useUser();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<UpdateProfileNameInput>({
    resolver: zodResolver(UpdateProfileNameSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const onSubmit = async (values: UpdateProfileNameInput) => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const result = await updateProfileName(values);

      if (result.success) {
        setSuccessMessage("Profile updated successfully");
        // Invalidate user queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["user"] });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.error);
      }
    } catch {
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Update your personal details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-gray-50 dark:bg-[#0B0F19] text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your email address cannot be changed
              </p>
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Display name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      className="bg-white dark:bg-[#0B0F19] border-gray-200 dark:border-white/10"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500 dark:text-gray-400">
                    This is the name that will be displayed across the platform
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Success Message */}
            {successMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                <Check className="h-4 w-4" />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isDirty}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
