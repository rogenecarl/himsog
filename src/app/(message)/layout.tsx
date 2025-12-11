"use client"

import BottomNavigation from "@/components/mobile-bottom-nav"

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Main content */}
      <div className="h-full pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
