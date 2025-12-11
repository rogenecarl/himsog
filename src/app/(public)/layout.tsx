import Navbar from "@/components/navbar";
import { ClientUserProvider } from "@/context/ClientUserProvider";

// Using ClientUserProvider allows pages to be static (no server-side auth)
// Individual pages can override with their own dynamic setting

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientUserProvider>
      <div className="relative bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
        <div className="absolute inset-x-0 top-0 w-full h-[450px] sm:h[500px] md:h-[550px] lg:h-[800px] -z-10 pointer-events-none">
        </div>
        {/* Hide Navbar on mobile (sm and below) to allow page-specific mobile headers */}
        <div className="hidden sm:block">
          <Navbar />
        </div>
        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 lg:pt-23 bg-white dark:bg-[#0B0F19] ">
          {children}
        </main>
      </div>
    </ClientUserProvider>
  );
}
