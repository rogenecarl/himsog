"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { SignInSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { Loader2, Mail, Lock } from "lucide-react" // Ensure lucide-react is installed
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function SignInForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    async function onSubmit(values: z.infer<typeof SignInSchema>) {
        setIsLoading(true);
        const toastId = toast.loading("Signing in...");

        try {
            const { error } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error(error.message || "Invalid email or password", { id: toastId });
                return;
            }

            const { data: session } = await authClient.getSession();

            if (session?.user) {
                toast.success("Signed in successfully", { id: toastId });

                const user = session.user as { role?: string };
                const role = user.role || "USER";
                const redirectMap: Record<string, string> = {
                    ADMIN: "/admin/dashboard",
                    PROVIDER: "/provider/dashboard",
                    USER: "/browse-services",
                };

                router.push(redirectMap[role] || "/browse-services");
            }
        } catch (error) {
            toast.error("An unexpected error occurred", { id: toastId });
            console.error("Sign in error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-[400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col space-y-2 text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Welcome back
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enter your credentials to access your account
                </p>
            </div>

            {/* Social Login First - Better conversion */}
            <Button
                variant="outline"
                type="button"
                className="w-full h-11 font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 cursor-pointer group"
                onClick={() => authClient.signIn.social({ provider: "google" })}
            >
                <svg className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Continue with Google
            </Button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-[#0B0F19] px-4 text-slate-400 dark:text-slate-500 font-medium">
                        or continue with email
                    </span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email address
                                </FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors duration-200" />
                                        <Input
                                            placeholder="name@example.com"
                                            type="email"
                                            autoComplete="email"
                                            {...field}
                                            className="pl-10 h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-slate-400"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Password
                                    </FormLabel>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-xs font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors duration-200" />
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            {...field}
                                            className="pl-10 h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-slate-400"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 mt-2 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : "Sign in"}
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                    href="/auth/choose-role"
                    className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200"
                >
                    Create account
                </Link>
            </p>

            <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                    Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                    Privacy Policy
                </Link>
            </p>
        </div>
    )
}