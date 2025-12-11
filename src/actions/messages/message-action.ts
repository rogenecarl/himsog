"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// Get all conversations for the current user
export async function getConversations() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to view conversations",
      }
    }

    const userId = session.user.id

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            provider: {
              select: {
                healthcareName: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            provider: {
              select: {
                healthcareName: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })

    // Transform to show the "other" user
    const transformedConversations = conversations.map((conv) => {
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1
      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
          image: otherUser.image,
          role: otherUser.role,
          healthcareName: otherUser.provider?.healthcareName,
        },
        lastMessageAt: conv.lastMessageAt,
        lastMessageContent: conv.lastMessageContent,
        createdAt: conv.createdAt,
      }
    })

    return {
      success: true,
      data: transformedConversations,
    }
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return {
      success: false,
      error: "Failed to fetch conversations",
    }
  }
}

// Create or get existing conversation
export async function createOrGetConversation(otherUserId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to create a conversation",
      }
    }

    const userId = session.user.id

    if (!otherUserId) {
      return {
        success: false,
        error: "Other user ID is required",
      }
    }

    if (userId === otherUserId) {
      return {
        success: false,
        error: "Cannot create conversation with yourself",
      }
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            provider: {
              select: {
                healthcareName: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            provider: {
              select: {
                healthcareName: true,
              },
            },
          },
        },
      },
    })

    // Create new conversation if it doesn't exist
    if (!conversation) {
      const [user1Id, user2Id] = [userId, otherUserId].sort()

      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
        },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              provider: {
                select: {
                  healthcareName: true,
                },
              },
            },
          },
          user2: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              provider: {
                select: {
                  healthcareName: true,
                },
              },
            },
          },
        },
      })
    }

    revalidatePath("/messages")
    revalidatePath("/provider/messages")

    return {
      success: true,
      data: conversation,
    }
  } catch (error) {
    console.error("Error creating conversation:", error)
    return {
      success: false,
      error: "Failed to create conversation",
    }
  }
}

// Get conversation with messages in a single optimized query
export async function getConversationWithMessages(
  conversationId: string,
  options?: { limit?: number; cursor?: string }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    const userId = session.user.id
    const limit = options?.limit || 50

    // Single query to get conversation with messages and verify access
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            provider: {
              select: {
                healthcareName: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            provider: {
              select: {
                healthcareName: true,
              },
            },
          },
        },
        messages: {
          take: limit,
          orderBy: { createdAt: 'desc' },
          ...(options?.cursor && {
            cursor: { id: options.cursor },
            skip: 1,
          }),
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found or access denied",
      }
    }

    // Determine the "other" user
    const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1

    // Reverse messages to get chronological order (we fetched desc for pagination)
    const messages = conversation.messages.reverse()

    return {
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            image: otherUser.image,
            role: otherUser.role,
            healthcareName: otherUser.provider?.healthcareName,
          },
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
        },
        messages,
        hasMore: conversation.messages.length === limit,
        nextCursor: messages.length > 0 ? messages[0].id : undefined,
      },
    }
  } catch (error) {
    console.error("Error fetching conversation with messages:", error)
    return {
      success: false,
      error: "Failed to fetch conversation data",
    }
  }
}

// Get messages for a conversation - optimized single query with access check
export async function getMessages(conversationId: string, options?: { limit?: number }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to view messages",
      }
    }

    const userId = session.user.id
    const limit = options?.limit || 100

    // Single query: fetch messages only if user has access to conversation
    // Uses nested filter to verify access without separate query
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    })

    // If no messages found, verify conversation exists and user has access
    if (messages.length === 0) {
      const conversationExists = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        select: { id: true },
      })

      if (!conversationExists) {
        return {
          success: false,
          error: "Conversation not found or access denied",
        }
      }
    }

    return {
      success: true,
      data: messages,
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return {
      success: false,
      error: "Failed to fetch messages",
    }
  }
}

// Send a message
export async function sendMessage(conversationId: string, content: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to send messages",
      }
    }

    const userId = session.user.id

    if (!content.trim()) {
      return {
        success: false,
        error: "Message content cannot be empty",
      }
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    })

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found or access denied",
      }
    }

    // Create message and update conversation in a transaction
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: content.trim(),
          status: 'SENT',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessageContent: content.trim().substring(0, 100),
        },
      }),
    ])

    revalidatePath("/messages")
    revalidatePath("/provider/messages")
    revalidatePath(`/messages/${conversationId}`)
    revalidatePath(`/provider/messages/${conversationId}`)

    return {
      success: true,
      data: message,
    }
  } catch (error) {
    console.error("Error sending message:", error)
    return {
      success: false,
      error: "Failed to send message",
    }
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    const userId = session.user.id

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    })

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found or access denied",
      }
    }

    // Mark all unread messages from other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: 'READ' },
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return {
      success: false,
      error: "Failed to mark messages as read",
    }
  }
}

// Get unread message count - optimized single query
export async function getUnreadCount() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    const userId = session.user.id

    // Single query with nested filter - no need to fetch conversation IDs first
    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        senderId: { not: userId },
        status: { not: 'READ' },
      },
    })

    return {
      success: true,
      data: unreadCount,
    }
  } catch (error) {
    console.error("Error getting unread count:", error)
    return {
      success: false,
      error: "Failed to get unread count",
    }
  }
}
