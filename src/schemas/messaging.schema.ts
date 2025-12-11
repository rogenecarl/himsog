// src/schemas/messaging.schema.ts

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================
export const MessageStatusSchema = z.enum([
  'SENT',
  'DELIVERED',
  'READ'
]);

// ============================================================================
// CONVERSATION SCHEMA
// ============================================================================
export const ConversationSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  user1Id: z.string().uuid({ message: "Invalid user1 UUID" }),
  user2Id: z.string().uuid({ message: "Invalid user2 UUID" }),
  lastMessageAt: z.date().nullable(),
  lastMessageContent: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a conversation
export const CreateConversationSchema = z.object({
  user1Id: z.string().uuid({ message: "Invalid user1 UUID" }),
  user2Id: z.string().uuid({ message: "Invalid user2 UUID" }),
}).refine((data) => data.user1Id !== data.user2Id, {
  message: "Cannot create a conversation with yourself",
  path: ["user2Id"],
});

// Schema for finding or creating a conversation
export const FindOrCreateConversationSchema = z.object({
  otherUserId: z.string().uuid({ message: "Invalid user UUID" }),
});

// ============================================================================
// MESSAGE SCHEMA
// ============================================================================
export const MessageSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  conversationId: z.string().uuid({ message: "Invalid conversation UUID" }),
  senderId: z.string().uuid({ message: "Invalid sender UUID" }),
  content: z.string().min(1, { message: "Message content is required" }),
  status: MessageStatusSchema.default('SENT'),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for sending a message
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid({ message: "Invalid conversation UUID" }),
  content: z.string()
    .min(1, { message: "Message content is required" })
    .max(5000, { message: "Message must be less than 5000 characters" })
    .trim(),
});

// Schema for marking message as read
export const MarkMessageReadSchema = z.object({
  messageId: z.string().uuid({ message: "Invalid message UUID" }),
});

// Schema for bulk marking messages as read
export const BulkMarkMessagesReadSchema = z.object({
  conversationId: z.string().uuid({ message: "Invalid conversation UUID" }),
});

// Schema for message filtering
export const MessageFilterSchema = z.object({
  conversationId: z.string().uuid({ message: "Invalid conversation UUID" }),
  beforeDate: z.date().optional(),
  afterDate: z.date().optional(),
  status: MessageStatusSchema.optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).default(50),
});

// Schema for conversation filtering
export const ConversationFilterSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user UUID" }),
  search: z.string().optional(),
  hasUnread: z.boolean().optional(),
  sortBy: z.enum(['lastMessageAt', 'createdAt']).default('lastMessageAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Conversation = z.infer<typeof ConversationSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type FindOrCreateConversationInput = z.infer<typeof FindOrCreateConversationSchema>;

export type Message = z.infer<typeof MessageSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type MarkMessageReadInput = z.infer<typeof MarkMessageReadSchema>;
export type BulkMarkMessagesReadInput = z.infer<typeof BulkMarkMessagesReadSchema>;
export type MessageFilterInput = z.infer<typeof MessageFilterSchema>;
export type ConversationFilterInput = z.infer<typeof ConversationFilterSchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { User } from './user.schema';

export type ConversationWithUsers = Conversation & {
  user1: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  user2: Pick<User, 'id' | 'name' | 'email' | 'image'>;
};

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export type ConversationWithUnreadCount = Conversation & {
  user1: Pick<User, 'id' | 'name' | 'image'>;
  user2: Pick<User, 'id' | 'name' | 'image'>;
  _count: {
    messages: number;
  };
  unreadCount?: number;
};

export type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'name' | 'image'>;
};
