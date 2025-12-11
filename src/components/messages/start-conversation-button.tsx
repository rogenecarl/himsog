'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Loader2 } from 'lucide-react'
import { createOrGetConversation } from '@/actions/messages/message-action'
import { toast } from 'sonner'
import { ChatPopup } from './chat-popup'

interface StartConversationButtonProps {
  providerId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function StartConversationButton({
  providerId,
  variant = 'default',
  size = 'default',
  className,
}: StartConversationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleStartConversation = async () => {
    setIsLoading(true)

    try {
      const result = await createOrGetConversation(providerId)

      if (!result.success || !result.data) {
        toast.error(result.error || 'Failed to start conversation')
        return
      }

      // Get current user ID from conversation data
      const userId = result.data.user1Id === providerId ? result.data.user2Id : result.data.user1Id

      // Open chat popup
      setConversationId(result.data.id)
      setCurrentUserId(userId)
      setIsMinimized(false)
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error('Failed to start conversation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseChat = () => {
    setConversationId(null)
    setCurrentUserId(null)
  }

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      <Button
        onClick={handleStartConversation}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Provider
          </>
        )}
      </Button>

      {conversationId && currentUserId && (
        <ChatPopup
          conversationId={conversationId}
          currentUserId={currentUserId}
          onClose={handleCloseChat}
          isMinimized={isMinimized}
          onToggleMinimize={handleToggleMinimize}
        />
      )}
    </>
  )
}
