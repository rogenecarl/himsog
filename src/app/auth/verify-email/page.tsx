'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, CheckCircle2, Mail, RefreshCw, Command } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { authClient } from '@/lib/auth-client'

function OTPInput({
    value,
    onChange,
    disabled,
}: {
    value: string[]
    onChange: (value: string[]) => void
    disabled: boolean
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, inputValue: string) => {
        // Only allow numbers
        const sanitized = inputValue.replace(/[^0-9]/g, '')
        if (sanitized.length > 1) return

        const newValue = [...value]
        newValue[index] = sanitized
        onChange(newValue)

        // Auto-focus next input
        if (sanitized && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
        if (pastedData.length === 6) {
            onChange(pastedData.split(''))
            inputRefs.current[5]?.focus()
        }
    }

    return (
        <div className="flex gap-2 justify-center">
            {value.map((digit, index) => (
                <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 transition-colors text-slate-900 dark:text-white"
                    autoFocus={index === 0}
                />
            ))}
        </div>
    )
}

function VerifyEmailForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [verified, setVerified] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const email = searchParams.get('email')

    useEffect(() => {
        if (!email) {
            router.push('/auth/sign-in')
        }
    }, [email, router])

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        if (otp.every(digit => digit !== '') && otp.join('').length === 6) {
            handleVerify()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp])

    async function handleVerify() {
        if (!email || otp.some(digit => digit === '')) return

        setIsVerifying(true)
        try {
            const { error } = await authClient.emailOtp.verifyEmail({
                email,
                otp: otp.join(''),
            })

            if (error) {
                toast.error(error.message || 'Invalid verification code. Please try again.')
                setOtp(Array(6).fill(''))
                return
            }

            setVerified(true)
            toast.success('Email verified successfully!')

            // Redirect to sign-in after short delay
            setTimeout(() => {
                router.push('/auth/sign-in')
            }, 2000)
        } catch (error) {
            console.error('Error verifying email:', error)
            toast.error('An unexpected error occurred. Please try again.')
            setOtp(Array(6).fill(''))
        } finally {
            setIsVerifying(false)
        }
    }

    async function handleResend() {
        if (!email || countdown > 0) return

        setIsResending(true)
        try {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'email-verification',
            })

            if (error) {
                toast.error(error.message || 'Failed to resend code. Please try again.')
                return
            }

            toast.success('A new verification code has been sent to your email.')
            setCountdown(60) // 60 second cooldown
            setOtp(Array(6).fill(''))
        } catch (error) {
            console.error('Error resending OTP:', error)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setIsResending(false)
        }
    }

    if (!email) {
        return null
    }

    // Success state - email verified
    if (verified) {
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
                                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Email verified!</h1>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                        Your email has been successfully verified. You will be redirected shortly.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => router.push('/auth/sign-in')}
                                        className="w-full h-9 text-sm font-medium"
                                    >
                                        Continue to Sign In
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // Form state - verify email
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
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-cyan-900/30 mb-4 mx-auto">
                                    <Mail className="h-6 w-6 text-primary dark:text-cyan-400" />
                                </div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Verify your email</h1>
                                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                    We&apos;ve sent a 6-digit code to{' '}
                                    <span className="font-medium text-slate-900 dark:text-white">{email}</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    disabled={isVerifying}
                                />

                                <Button
                                    onClick={handleVerify}
                                    disabled={isVerifying || otp.some(digit => digit === '')}
                                    className="w-full h-9 text-sm font-medium"
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                                </Button>

                                {/* Divider */}
                                <div className="relative py-1">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-100 dark:border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-[#1E293B] px-2 text-slate-500 dark:text-slate-400">Didn&apos;t receive code?</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={handleResend}
                                    disabled={isResending || countdown > 0}
                                    className="w-full h-9 text-sm font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {isResending ? (
                                        'Sending...'
                                    ) : countdown > 0 ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Resend in {countdown}s
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Resend Code
                                        </>
                                    )}
                                </Button>

                                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                                    Check your spam folder if you don&apos;t see the email.
                                </p>

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

                    <div className="text-center text-[10px] text-slate-600 dark:text-slate-400 px-8">
                        Already verified? <Link href="/auth/sign-in" className="underline hover:text-slate-900 dark:hover:text-white">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
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
            <VerifyEmailForm />
        </Suspense>
    )
}
