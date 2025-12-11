"use client";

import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image src={"/logo.png"} alt="Logo" width={30} height={30} priority className="transition-opacity group-hover:opacity-80" />
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none transition-colors">
          Himsog
        </span>
        <span className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400 tracking-wide uppercase transition-colors">
          Healthcare
        </span>
      </div>
    </Link>
  );
}
