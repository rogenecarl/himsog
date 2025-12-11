import Navbar from "@/components/navbar";
import { ClientUserProvider } from "@/context/ClientUserProvider";

// Static layout - user data fetched client-side

export default function MapLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClientUserProvider>
            <div className="relative bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white h-screen overflow-hidden transition-colors duration-300">
                {/* Hide Navbar on mobile for map view */}
                <div className="hidden md:block">
                    <Navbar />
                </div>
                <main className="h-screen">{children}</main>
            </div>
        </ClientUserProvider>
    );
}
