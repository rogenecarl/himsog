"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobilePageHeaderProps {
    title: string
    subtitle?: string
    backHref?: string
    showBackButton?: boolean
    rightContent?: React.ReactNode
    className?: string
}

export function MobilePageHeader({
    title,
    subtitle,
    backHref,
    showBackButton = true,
    rightContent,
    className,
}: MobilePageHeaderProps) {
    const router = useRouter()

    const handleBack = () => {
        if (backHref) {
            router.push(backHref)
        } else {
            router.back()
        }
    }

    return (
        <div className={cn("mb-4 sm:mb-6", className)}>
            {/* Mobile header with back button */}
            <div className="flex items-center gap-3 md:hidden mb-2">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="size-9 shrink-0 -ml-2"
                    >
                        <ArrowLeft className="size-5" />
                        <span className="sr-only">Go back</span>
                    </Button>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                {rightContent && (
                    <div className="shrink-0">{rightContent}</div>
                )}
            </div>

            {/* Desktop header */}
            <div className="hidden md:flex md:flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-slate-600 dark:text-slate-400">
                            {subtitle}
                        </p>
                    )}
                </div>
                {rightContent && <div>{rightContent}</div>}
            </div>
        </div>
    )
}
