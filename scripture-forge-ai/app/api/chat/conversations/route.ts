import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatConversations, chatMessages } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET /api/chat/conversations - Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const conversations = await db
      .select({
        id: chatConversations.id,
        title: chatConversations.title,
        createdAt: chatConversations.createdAt,
        updatedAt: chatConversations.updatedAt,
        isArchived: chatConversations.isArchived,
      })
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.userId, session.user.id),
          eq(chatConversations.isArchived, false)
        )
      )
      .orderBy(desc(chatConversations.updatedAt))
      .limit(50);

    // Get the first message of each conversation for preview
    const conversationsWithPreview = await Promise.all(
      conversations.map(async (conv) => {
        const firstMessage = await db
          .select({
            content: chatMessages.content,
          })
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, conv.id))
          .orderBy(chatMessages.createdAt)
          .limit(1);

        return {
          ...conv,
          preview: firstMessage[0]?.content?.substring(0, 100) || "",
        };
      })
    );

    return NextResponse.json(conversationsWithPreview);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/chat/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title } = body;

    const [newConversation] = await db
      .insert(chatConversations)
      .values({
        userId: session.user.id,
        title: title || "New Conversation",
      })
      .returning();

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
