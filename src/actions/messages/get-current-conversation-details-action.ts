"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getCurrentConversationDetails(conversationId: string) {
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

    // Get conversation with participant details
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

    return {
      success: true,
      data: {
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
    }
  } catch (error) {
    console.error("Error fetching conversation details:", error)
    return {
      success: false,
      error: "Failed to fetch conversation details",
    }
  }
}
