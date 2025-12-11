'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Minus, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrivateChat, type PrivateMessage } from '@/hooks/use-private-chat'
import { getConversationWithMessages } from '@/actions/messages/message-action'

interface ChatPopupProps {
  conversationId: string
  currentUserId: string
  onClose: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

export function ChatPopup({
  conversationId,
  currentUserId,
  onClose,
  isMinimized,
  onToggleMinimize,
}: ChatPopupProps) {
  const [otherUser, setOtherUser] = useState<{
    name: string | null
    image: string | null
    role: string
    healthcareName?: string | null
  } | null>(null)
  const [initialMessages, setInitialMessages] = useState<PrivateMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Fetch conversation details and messages in a single optimized call
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Single action fetches both conversation details and messages
        const result = await getConversationWithMessages(conversationId, { limit: 50 })

        if (result.success && result.data) {
          setOtherUser(result.data.conversation.otherUser)

          const formattedMessages: PrivateMessage[] = result.data.messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            sender: {
              id: msg.sender.id,
              name: msg.sender.name,
              image: msg.sender.image,
            },
            createdAt: msg.createdAt.toISOString(),
            status: msg.status as 'SENT' | 'DELIVERED' | 'READ',
          }))
          setInitialMessages(formattedMessages)
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Error fetching chat data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [conversationId, setMessages])

  // Merge messages
  const allMessages = [...initialMessages, ...realtimeMessages].filter(
    (message, index, self) => index === self.findIndex((m) => m.id === message.id)
  ).sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim() || !isConnected || isSending) return

    try {
      await sendMessage(newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const displayName = otherUser?.role === 'PROVIDER'
    ? otherUser.healthcareName || otherUser.name
    : otherUser?.name

  return (
    <div
      className={cn(
        'fixed bottom-0 right-4 z-50 flex flex-col bg-white dark:bg-[#1E293B] rounded-t-lg shadow-2xl border border-gray-200 dark:border-white/10 transition-all duration-300',
        isMinimized ? 'h-14 w-80' : 'h-[500px] w-80 md:w-96'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 rounded-t-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-9 h-9 border-2 border-white">
            <AvatarImage src={otherUser?.image || undefined} />
            <AvatarFallback className="bg-blue-500 text-white font-semibold">
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-sm truncate">
              {displayName || 'Loading...'}
            </h3>
            <p className="text-xs text-blue-100">
              {isConnected ? 'Active now' : 'Connecting...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isMinimized && (
            <>
              {/* <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-500"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-500"
              >
                <Video className="w-4 h-4" />
              </Button> */}
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMinimize}
            className="h-8 w-8 text-white hover:bg-blue-500"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white hover:bg-blue-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-[#0B0F19]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            ) : allMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">No messages yet</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Start the conversation!</p>
                </div>
              </div>
            ) : (
              allMessages.map((message) => {
                const isOwn = message.senderId === currentUserId

                return (
                  <div
                    key={message.id}
                    className={cn('flex gap-2', isOwn && 'justify-end')}
                  >
                    {!isOwn && (
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarImage src={message.sender.image || undefined} />
                        <AvatarFallback className="bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs">
                          {message.sender.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        'flex flex-col gap-1 max-w-[75%]',
                        isOwn && 'items-end'
                      )}
                    >
                      <div
                        className={cn(
                          'px-3 py-2 rounded-2xl wrap-break-words',
                          isOwn
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 px-2">
                        {new Date(message.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-3 py-3 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-white/10">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                disabled={!isConnected || isSending}
                className="flex-1 text-sm border-gray-300 dark:border-white/10 focus:border-blue-500 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!isConnected || isSending || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
