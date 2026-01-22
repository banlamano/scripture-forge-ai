import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatConversations, chatMessages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/chat/conversations/[id]/messages - Add a message to a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { role, content, metadata } = body;

    if (!role || !content) {
      return NextResponse.json(
        { error: "Role and content are required" },
        { status: 400 }
      );
    }

    // Verify the conversation belongs to the user
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.id, id),
          eq(chatConversations.userId, session.user.id)
        )
      )
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create the message
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        conversationId: id,
        role,
        content,
        metadata: metadata || null,
      })
      .returning();

    // Update conversation's updatedAt and title if it's the first user message
    const updateData: Partial<typeof chatConversations.$inferInsert> = {
      updatedAt: new Date(),
    };

    // Auto-generate title from first user message if title is default
    if (role === "user" && (!conversation.title || conversation.title === "New Conversation")) {
      // Use first 50 chars of the message as title
      updateData.title = content.substring(0, 50) + (content.length > 50 ? "..." : "");
    }

    await db
      .update(chatConversations)
      .set(updateData)
      .where(eq(chatConversations.id, id));

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
