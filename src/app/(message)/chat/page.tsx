import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getConversations } from "@/actions/messages/message-action"
import { ChatSidebar } from "@/components/shared/chat-sidebar"

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const result = await getConversations()
  const conversations = result.success ? result.data || [] : []

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Sidebar - Full width on mobile, fixed width on desktop */}
      <div className="w-full md:w-auto">
        <ChatSidebar conversations={conversations} basePath="/chat" />
      </div>

      {/* Empty State - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-linear-to-br from-background via-background to-secondary/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground/70 mb-2">Select a conversation</h2>
          <p className="text-foreground/50">Choose a chat to start messaging</p>
        </div>
      </div>
    </div>
  )
}
