import { memo } from "react";
import Link from "next/link";
import Image from "next/image";

function AdminSidebarHeaderComponent() {
    return (
        <div className="flex h-14 items-center gap-2.5 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 group/link group-data-[collapsible=icon]:gap-0"
            >
                <Image
                    src="/logo.png"
                    alt="Himsog"
                    width={28}
                    height={28}
                    priority
                    className="h-7 w-7 flex-shrink-0 transition-opacity group-hover/link:opacity-80"
                />
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                        Himsog
                    </span>
                    <span className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400 tracking-wide uppercase">
                        Admin Portal
                    </span>
                </div>
            </Link>
        </div>
    )
}

export default memo(AdminSidebarHeaderComponent);