'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import { sendMessage as sendMessageAction } from '@/actions/messages/message-action'

interface UsePrivateChatProps {
  conversationId: string
  currentUserId: string
}

export interface PrivateMessage {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    name: string | null
    image: string | null
  }
  createdAt: string
  status: 'SENT' | 'DELIVERED' | 'READ'
}

const EVENT_MESSAGE_TYPE = 'private_message'

export function usePrivateChat({ conversationId, currentUserId }: UsePrivateChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!conversationId) return

    const channelName = `conversation:${conversationId}`
    const newChannel = supabase.channel(channelName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        const message = payload.payload as PrivateMessage
        // Only add message if it's from another user (avoid duplicates)
        if (message.senderId !== currentUserId) {
          setMessages((current) => {
            // Check if message already exists
            const exists = current.some((m) => m.id === message.id)
            if (exists) return current
            return [...current, message]
          })
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [conversationId, currentUserId, supabase])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected || !content.trim()) return

      setIsSending(true)

      try {
        // Save to database first
        const result = await sendMessageAction(conversationId, content)

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to send message')
        }

        const message: PrivateMessage = {
          id: result.data.id,
          content: result.data.content,
          senderId: result.data.senderId,
          sender: {
            id: result.data.sender.id,
            name: result.data.sender.name,
            image: result.data.sender.image,
          },
          createdAt: result.data.createdAt.toISOString(),
          status: result.data.status as 'SENT' | 'DELIVERED' | 'READ',
        }

        // Update local state immediately
        setMessages((current) => [...current, message])

        // Broadcast to other users via Supabase
        await channel.send({
          type: 'broadcast',
          event: EVENT_MESSAGE_TYPE,
          payload: message,
        })
      } catch (error) {
        console.error('Error sending message:', error)
        throw error
      } finally {
        setIsSending(false)
      }
    },
    [channel, isConnected, conversationId]
  )

  return { messages, sendMessage, isConnected, isSending, setMessages }
}
