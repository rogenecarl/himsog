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
        {/* Background with Grid Pattern */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[#0B0F19]">
          {/* Grid Pattern Layer */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[14px_24px]"></div>

          {/* Gradient Blobs */}
          <div className="absolute left-0 right-0 top-0 m-auto h-[310px] w-[310px] rounded-full bg-violet-400 dark:bg-violet-600 opacity-20 dark:opacity-10 blur-[100px]"></div>
          <div className="absolute right-0 top-0 m-auto h-[310px] w-[310px] rounded-full bg-cyan-400 dark:bg-cyan-600 opacity-20 dark:opacity-10 blur-[100px]"></div>
        </div>

        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </ClientUserProvider>
  );
}
