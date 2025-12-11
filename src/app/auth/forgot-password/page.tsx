'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Command, Mail, ArrowLeft } from 'lucide-react'

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

import { ForgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/user.schema'
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values: ForgotPasswordInput) {
        setIsLoading(true)
        try {
            const { error } = await authClient.forgetPassword({
                email: values.email,
                redirectTo: '/auth/reset-password',
            })

            if (error) {
                toast.error(error.message || 'Failed to send reset email. Please try again.')
                return
            }

            setEmailSent(true)
            toast.success('Password reset email sent! Please check your inbox.')
        } catch (error) {
            console.error('Error sending password reset email:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Success state - email sent
    if (emailSent) {
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
                                        <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Check your email</h1>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                        We&apos;ve sent a password reset link to{' '}
                                        <span className="font-medium text-slate-900 dark:text-white">{form.getValues('email')}</span>
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        Didn&apos;t receive the email? Check your spam folder or try again.
                                    </p>

                                    <Button
                                        variant="outline"
                                        onClick={() => setEmailSent(false)}
                                        className="w-full h-9 text-sm font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        Try another email
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

    return (
        <div className="bg-slate-50 dark:bg-[#0B0F19] flex min-h-svh flex-col items-center justify-center p-4 md:p-8 transition-colors duration-300">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-4">
                    <Card className="overflow-hidden border-0 shadow-xl rounded-xl ring-1 ring-slate-200/50 dark:ring-white/10 p-0">
                        <CardContent className="p-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-center p-6 md:p-8 bg-white dark:bg-[#1E293B]">
                                    <div className="mb-6 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2 text-primary dark:text-cyan-400">
                                            <Command className="h-5 w-5" />
                                            <span className="font-bold text-sm tracking-tight">HIMSOG</span>
                                        </div>
                                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Forgot password?</h1>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                            No worries, we&apos;ll send you reset instructions.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-xs text-slate-700 dark:text-slate-300">Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="example@gmail.com"
                                                            type="email"
                                                            autoComplete="email"
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
                                            {isLoading ? 'Sending...' : 'Reset Password'}
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
