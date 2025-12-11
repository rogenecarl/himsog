"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface ConversationUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  healthcareName?: string | null
}

interface Conversation {
  id: string
  otherUser: ConversationUser
  lastMessageAt: Date | null
  lastMessageContent: string | null
  createdAt: Date
}

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId?: string
  basePath: string
}

export function ChatSidebar({ conversations, currentConversationId, basePath }: ChatSidebarProps) {
  const router = useRouter()

  const handleConversationClick = (conversationId: string) => {
    router.push(`${basePath}/${conversationId}`)
  }

  return (
    <div className="flex flex-col w-full md:w-80 bg-sidebar border-r border-sidebar-border h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-6 border-b border-sidebar-border">
        <h1 className="text-lg md:text-2xl font-bold text-sidebar-foreground">Messages</h1>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-9 md:h-10 md:w-10"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-2 md:p-4">
        <div className="relative">
          <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 md:pl-10 bg-secondary border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 text-sm md:text-base h-9 md:h-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center text-xs md:text-sm text-sidebar-foreground/50 py-8 px-4">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => {
            const displayName =
              conversation.otherUser.role === "PROVIDER"
                ? conversation.otherUser.healthcareName || conversation.otherUser.name
                : conversation.otherUser.name

            const isActive = conversation.id === currentConversationId

            return (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={cn(
                  "w-full px-2 md:px-4 py-2.5 md:py-3 text-left border-b border-sidebar-border/50 transition-all duration-200 hover:bg-sidebar-accent/50",
                  isActive && "bg-sidebar-primary/10 border-l-2 border-l-sidebar-primary"
                )}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="w-9 h-9 md:w-12 md:h-12 shrink-0">
                    <AvatarImage src={conversation.otherUser.image || undefined} />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold text-sm md:text-base">
                      {displayName?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 md:gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sidebar-foreground truncate text-sm md:text-base">
                          {displayName || "Unknown User"}
                        </h3>
                        <p className="text-[10px] md:text-xs text-sidebar-foreground/60 font-medium truncate">
                          {conversation.otherUser.role === "PROVIDER"
                            ? "Healthcare Provider"
                            : "Patient"}
                        </p>
                      </div>
                      {conversation.lastMessageAt && (
                        <p className="text-[10px] md:text-xs text-sidebar-foreground/50 shrink-0">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-sidebar-foreground/70 truncate mt-0.5 md:mt-1">
                      {conversation.lastMessageContent || "No messages yet"}
                    </p>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Bottom Actions */}
      {/* <div className="p-2 md:p-4 border-t border-sidebar-border flex gap-2">
        <Button variant="outline" className="flex-1 text-xs md:text-sm h-8 md:h-9" size="sm">
          Settings
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div> */}
    </div>
  )
}