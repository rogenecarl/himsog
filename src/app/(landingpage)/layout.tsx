import Navbar from "@/components/navbar";
import { ClientUserProvider } from "@/context/ClientUserProvider";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientUserProvider>
      <div className="relative min-h-screen font-sans antialiased transition-colors duration-300">
        {/* Premium Background */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-[#FAFAF8] dark:bg-[#0A0D14]">
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff06_1px,transparent_1px)] bg-size-[24px_24px]" />

          {/* Primary warm gradient orb - top left */}
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-teal-200/40 via-cyan-100/30 to-transparent dark:from-teal-900/20 dark:via-cyan-900/10 dark:to-transparent blur-3xl" />

          {/* Secondary accent orb - top right */}
          <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-amber-100/30 via-orange-50/20 to-transparent dark:from-amber-900/10 dark:via-orange-900/5 dark:to-transparent blur-3xl" />

          {/* Bottom ambient glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-gradient-to-t from-teal-100/20 via-emerald-50/10 to-transparent dark:from-teal-950/20 dark:via-emerald-950/10 dark:to-transparent blur-3xl" />
        </div>

        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </ClientUserProvider>
  );
}
