"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, Loader2, MoreVertical, Info, Smile, Paperclip, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import { type PrivateMessage, usePrivateChat } from "@/hooks/use-private-chat"
import { useRouter } from "next/navigation"

interface ChatMainProps {
  conversationId: string
  currentUserId: string
  currentUserName: string
  otherUserName: string
  otherUserImage: string | null
  otherUserRole: string
  initialMessages?: PrivateMessage[]
}

export function ChatMain({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserImage,
  otherUserRole,
  initialMessages = [],
}: ChatMainProps) {
  const router = useRouter()
  const { containerRef, scrollToBottom } = useChatScroll()
  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    isSending,
    setMessages,
  } = usePrivateChat({
    conversationId,
    currentUserId,
  })

  const [newMessage, setNewMessage] = useState("")

  // Initialize with database messages
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages, setMessages])

  // Merge realtime messages with initial messages
  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) => index === self.findIndex((m) => m.id === message.id)
    )
    return uniqueMessages.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [initialMessages, realtimeMessages])

  useEffect(() => {
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!newMessage.trim() || !isConnected || isSending) return

      try {
        await sendMessage(newMessage)
        setNewMessage("")
      } catch (error) {
        console.error("Failed to send message:", error)
      }
    },
    [newMessage, isConnected, isSending, sendMessage]
  )

  return (
    <div className="flex-1 flex flex-col bg-linear-to-br from-background via-background to-secondary/10 h-full">
      {/* Header */}
      <div className="px-3 md:px-6 py-3 md:py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {/* Back button - visible only on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/chat")}
              className="md:hidden shrink-0 hover:bg-accent/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <Avatar className="w-9 h-9 md:w-12 md:h-12 shrink-0">
              <AvatarImage src={otherUserImage || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {otherUserName.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground text-sm md:text-lg truncate">
                {otherUserName}
              </h2>
              <p className="text-xs md:text-sm text-foreground/60 truncate">
                {otherUserRole === "PROVIDER" ? "Healthcare Provider" : "Patient"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 md:gap-2 shrink-0">
            {/* Hide some buttons on mobile */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex hover:bg-accent/10 hover:text-accent"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex hover:bg-accent/10 hover:text-accent"
            >
              <Video className="w-5 h-5" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-accent/10 hover:text-accent"
            >
              <Info className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent/10">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem className="sm:hidden">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Video className="w-4 h-4 mr-2" />
                  Video Call
                </DropdownMenuItem> */}
                <DropdownMenuItem>
                  <Info className="w-4 h-4 mr-2" />
                  Info
                </DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem>Mute</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-foreground/50">
            No messages yet. Start the conversation!
          </div>
        ) : (
          allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId
            const isOwn = message.senderId === currentUserId

            return (
              <div key={message.id} className={cn("flex gap-2 md:gap-3", isOwn && "justify-end")}>
                {!isOwn && (
                  <div className="shrink-0 w-7 h-7 md:w-10 md:h-10">
                    {showAvatar ? (
                      <Avatar className="w-7 h-7 md:w-10 md:h-10">
                        <AvatarImage src={message.sender.image || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs md:text-sm font-semibold">
                          {message.sender.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-7 h-7 md:w-10 md:h-10" />
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-0.5 md:gap-1 max-w-[75%] sm:max-w-xs md:max-w-md",
                    isOwn && "items-end"
                  )}
                >
                  {showAvatar && !isOwn && (
                    <p className="text-xs text-foreground/60 font-medium px-2 md:px-3">
                      {message.sender.name}
                    </p>
                  )}
                  <div
                    className={cn(
                      "px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl wrap-break-words",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border border-border text-foreground rounded-bl-none"
                    )}
                  >
                    <p className="text-sm md:text-base">{message.content}</p>
                  </div>
                  <p
                    className={cn(
                      "text-[10px] md:text-xs text-foreground/50 px-2 md:px-3",
                      isOwn && "text-right"
                    )}
                  >
                    {new Date(message.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="px-3 md:px-6 py-3 md:py-4 border-t border-border bg-card">
        <div className="flex gap-1.5 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex shrink-0 hover:bg-accent/10 hover:text-accent"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected || isSending}
              className="pr-10 bg-secondary border-border text-sm md:text-base"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 transform -translate-y-1/2 hover:bg-accent/10 hover:text-accent h-8 w-8 md:h-9 md:w-9"
            >
              <Smile className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          <Button
            onClick={() => handleSendMessage()}
            size="icon"
            disabled={!isConnected || isSending || !newMessage.trim()}
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9 md:h-10 md:w-10"
          >
            {isSending ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}