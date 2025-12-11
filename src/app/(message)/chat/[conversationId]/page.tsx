import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getConversations, getConversationWithMessages } from  "@/actions/messages/message-action"
import { ChatSidebar } from "@/components/shared/chat-sidebar"
import { ChatMain } from "@/components/shared/chat-main"

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const { conversationId } = await params
  const userId = session.user.id

  // Fetch conversations list and current conversation with messages in parallel
  // getConversationWithMessages combines conversation details + messages in single query
  const [conversationsResult, conversationWithMessagesResult] = await Promise.all([
    getConversations(),
    getConversationWithMessages(conversationId, { limit: 50 }),
  ])

  const conversations = conversationsResult.success ? conversationsResult.data || [] : []

  if (!conversationWithMessagesResult.success || !conversationWithMessagesResult.data) {
    redirect("/chat")
  }

  const { conversation, messages } = conversationWithMessagesResult.data

  // Transform messages for the chat component
  const transformedMessages = messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    sender: {
      id: msg.sender.id,
      name: msg.sender.name,
      image: msg.sender.image,
    },
    createdAt: msg.createdAt.toISOString(),
    status: msg.status as "SENT" | "DELIVERED" | "READ",
  }))

  const displayName =
    conversation.otherUser.role === "PROVIDER"
      ? conversation.otherUser.healthcareName || conversation.otherUser.name
      : conversation.otherUser.name

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile when viewing conversation, shown on desktop */}
      <div className="hidden md:block">
        <ChatSidebar
          conversations={conversations}
          currentConversationId={conversationId}
          basePath="/chat"
        />
      </div>

      {/* Chat Main - Full width on mobile, flex-1 on desktop */}
      <div className="w-full md:flex-1">
        <ChatMain
          conversationId={conversationId}
          currentUserId={userId}
          currentUserName={session.user.name || "You"}
          otherUserName={displayName || "Unknown User"}
          otherUserImage={conversation.otherUser.image}
          otherUserRole={conversation.otherUser.role}
          initialMessages={transformedMessages}
        />
      </div>
    </div>
  )
}
