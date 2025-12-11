'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Command, KeyRound } from 'lucide-react'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { ResetPasswordSchema, type ResetPasswordInput } from '@/schemas/user.schema'
import { authClient } from '@/lib/auth-client'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [tokenError, setTokenError] = useState(false)

    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setTokenError(true)
        }
    }, [token])

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(values: ResetPasswordInput) {
        if (!token) {
            toast.error('Invalid or missing reset token.')
            return
        }

        setIsLoading(true)
        try {
            const { error } = await authClient.resetPassword({
                newPassword: values.password,
                token,
            })

            if (error) {
                toast.error(error.message || 'Failed to reset password. Please try again.')
                return
            }

            setResetSuccess(true)
            toast.success('Password reset successful!')
        } catch (error) {
            console.error('Error resetting password:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Error state - invalid token
    if (tokenError) {
        return (
            <div className="bg-slate-50 dark:bg-[#0B0F19] flex min-h-svh flex-col items-center justify-center p-4 md:p-8 transition-colors duration-300">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-4">
                        <Card className="overflow-hidden border-0 shadow-xl rounded-xl ring-1 ring-slate-200/50 dark:ring-white/10 p-0">
                            <CardContent className="p-6 md:p-8 bg-white dark:bg-[#1E293B]">
                                <div className="mb-6 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-4 text-primary dark:text-cyan-400">
                                        <Command className="h-5 w-5" />
                                        <span className="font-bold text-sm tracking-tight">HIMSOG</span>
                                    </div>
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 mx-auto">
                                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Invalid reset link</h1>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                        This password reset link is invalid or has expired.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        Please request a new password reset link.
                                    </p>

                                    <Button
                                        onClick={() => router.push('/auth/forgot-password')}
                                        className="w-full h-9 text-sm font-medium"
                                    >
                                        Request New Link
                                    </Button>

                                    <Link href="/auth/sign-in" className="w-full">
                                        <Button
                                            variant="ghost"
                                            className="w-full h-9 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Sign In
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // Success state - password reset
    if (resetSuccess) {
        return (
            <div className="bg-slate-50 dark:bg-[#0B0F19] flex min-h-svh flex-col items-center justify-center p-4 md:p-8 transition-colors duration-300">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-4">
                        <Card className="overflow-hidden border-0 shadow-xl rounded-xl ring-1 ring-slate-200/50 dark:ring-white/10 p-0">
                            <CardContent className="p-6 md:p-8 bg-white dark:bg-[#1E293B]">
                                <div className="mb-6 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-4 text-primary dark:text-cyan-400">
                                        <Command className="h-5 w-5" />
                                        <span className="font-bold text-sm tracking-tight">HIMSOG</span>
                                    </div>
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 mx-auto">
                                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Password reset!</h1>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                        Your password has been successfully reset. You can now sign in with your new password.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => router.push('/auth/sign-in')}
                                        className="w-full h-9 text-sm font-medium"
                                    >
                                        Sign In with New Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // Form state - reset password
    return (
        <div className="bg-slate-50 dark:bg-[#0B0F19] flex min-h-svh flex-col items-center justify-center p-4 md:p-8 transition-colors duration-300">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-4">
                    <Card className="overflow-hidden border-0 shadow-xl rounded-xl ring-1 ring-slate-200/50 dark:ring-white/10 p-0">
                        <CardContent className="p-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-center p-6 md:p-8 bg-white dark:bg-[#1E293B]">
                                    <div className="mb-6 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-4 text-primary dark:text-cyan-400">
                                            <Command className="h-5 w-5" />
                                            <span className="font-bold text-sm tracking-tight">HIMSOG</span>
                                        </div>
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-cyan-900/30 mb-4 mx-auto">
                                            <KeyRound className="h-6 w-6 text-primary dark:text-cyan-400" />
                                        </div>
                                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Set new password</h1>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                            Your new password must be different from previously used passwords.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-xs text-slate-700 dark:text-slate-300">New Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Enter new password"
                                                            autoComplete="new-password"
                                                            disabled={isLoading}
                                                            {...field}
                                                            className="h-9 bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 transition-colors text-slate-900 dark:text-white"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-xs text-slate-700 dark:text-slate-300">Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Confirm new password"
                                                            autoComplete="new-password"
                                                            disabled={isLoading}
                                                            {...field}
                                                            className="h-9 bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 transition-colors text-slate-900 dark:text-white"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" disabled={isLoading} className="w-full h-9 text-sm mt-1 font-medium">
                                            {isLoading ? 'Resetting...' : 'Reset Password'}
                                        </Button>

                                        <Link href="/auth/sign-in" className="w-full">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full h-9 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="text-center text-[10px] text-slate-600 dark:text-slate-400 px-8">
                        Remember your password? <Link href="/auth/sign-in" className="underline hover:text-slate-900 dark:hover:text-white">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-slate-50 dark:bg-[#0B0F19] flex min-h-svh flex-col items-center justify-center p-4 md:p-8 transition-colors duration-300">
                    <div className="w-full max-w-sm">
                        <Card className="overflow-hidden border-0 shadow-xl rounded-xl ring-1 ring-slate-200/50 dark:ring-white/10 p-0">
                            <CardContent className="flex items-center justify-center py-16 bg-white dark:bg-[#1E293B]">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    )
}
