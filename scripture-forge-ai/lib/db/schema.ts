/**
 * Database Schema for ScriptureForge AI
 * Using Drizzle ORM with PostgreSQL
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  primaryKey,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// AUTH TABLES (NextAuth.js compatible)
// ============================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Subscription info
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"),
  subscriptionId: text("subscription_id"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  // Preferences
  preferredTranslation: varchar("preferred_translation", { length: 10 }).default("esv"),
  theme: varchar("theme", { length: 10 }).default("system"),
  fontSize: integer("font_size").default(18),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ============================================
// BIBLE CONTENT TABLES
// ============================================

export const bibleTranslations = pgTable("bible_translations", {
  id: varchar("id", { length: 10 }).primaryKey(), // e.g., "esv", "kjv"
  name: text("name").notNull(),
  abbreviation: varchar("abbreviation", { length: 10 }).notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  copyright: text("copyright"),
  isPublicDomain: boolean("is_public_domain").default(false),
});

export const bibleBooks = pgTable("bible_books", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  abbreviation: varchar("abbreviation", { length: 10 }).notNull(),
  testament: varchar("testament", { length: 5 }).notNull(), // "OT" or "NT"
  orderNumber: integer("order_number").notNull(),
  chapterCount: integer("chapter_count").notNull(),
});

export const bibleVerses = pgTable(
  "bible_verses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    translationId: varchar("translation_id", { length: 10 })
      .notNull()
      .references(() => bibleTranslations.id),
    bookId: uuid("book_id")
      .notNull()
      .references(() => bibleBooks.id),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    text: text("text").notNull(),
    // For search optimization
    searchText: text("search_text"), // lowercase, normalized
  },
  (table) => ({
    translationBookIdx: index("verse_translation_book_idx").on(
      table.translationId,
      table.bookId
    ),
    chapterIdx: index("verse_chapter_idx").on(
      table.translationId,
      table.bookId,
      table.chapter
    ),
  })
);

// ============================================
// USER CONTENT TABLES
// ============================================

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => bibleVerses.id),
    reference: text("reference").notNull(), // "John 3:16"
    note: text("note"),
    color: varchar("color", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("bookmark_user_idx").on(table.userId),
  })
);

export const highlights = pgTable(
  "highlights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => bibleVerses.id),
    reference: text("reference").notNull(),
    color: varchar("color", { length: 20 }).default("yellow"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("highlight_user_idx").on(table.userId),
  })
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verseId: uuid("verse_id").references(() => bibleVerses.id),
    reference: text("reference"), // optional - can be general note
    title: text("title"),
    content: text("content").notNull(),
    tags: jsonb("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("note_user_idx").on(table.userId),
  })
);

// ============================================
// CHAT & AI TABLES
// ============================================

export const chatConversations = pgTable(
  "chat_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isArchived: boolean("is_archived").default(false),
  },
  (table) => ({
    userIdx: index("conversation_user_idx").on(table.userId),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => chatConversations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<{
      verseReferences?: string[];
      promptType?: string;
      model?: string;
      tokensUsed?: number;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index("message_conversation_idx").on(table.conversationId),
  })
);

// ============================================
// READING PLANS & DEVOTIONALS
// ============================================

export const readingPlans = pgTable("reading_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "chronological", "topical", "book"
  isPublic: boolean("is_public").default(true),
  createdBy: uuid("created_by").references(() => users.id),
});

export const readingPlanDays = pgTable("reading_plan_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => readingPlans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: text("title"),
  passages: jsonb("passages").$type<string[]>().notNull(), // ["John 1:1-18", "Psalm 1"]
  devotionalContent: text("devotional_content"),
});

export const userReadingProgress = pgTable(
  "user_reading_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => readingPlans.id, { onDelete: "cascade" }),
    currentDay: integer("current_day").default(1),
    completedDays: jsonb("completed_days").$type<number[]>().default([]),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userPlanIdx: index("progress_user_plan_idx").on(table.userId, table.planId),
  })
);

// ============================================
// PRAYER JOURNAL
// ============================================

export const prayerEntries = pgTable(
  "prayer_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    content: text("content").notNull(),
    category: varchar("category", { length: 30 }), // "thanksgiving", "petition", "confession", etc.
    isAnswered: boolean("is_answered").default(false),
    answeredAt: timestamp("answered_at"),
    answeredNote: text("answered_note"),
    mood: varchar("mood", { length: 20 }),
    relatedVerses: jsonb("related_verses").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("prayer_user_idx").on(table.userId),
  })
);

// ============================================
// SUBSCRIPTIONS & USAGE
// ============================================

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: varchar("status", { length: 20 }).notNull(), // "active", "canceled", "past_due"
  tier: varchar("tier", { length: 20 }).notNull(), // "free", "starter", "premium"
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usageTracking = pgTable(
  "usage_tracking",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date").defaultNow().notNull(),
    aiQueriesCount: integer("ai_queries_count").default(0),
    wordsGenerated: integer("words_generated").default(0),
  },
  (table) => ({
    userDateIdx: index("usage_user_date_idx").on(table.userId, table.date),
  })
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  bookmarks: many(bookmarks),
  highlights: many(highlights),
  notes: many(notes),
  conversations: many(chatConversations),
  prayerEntries: many(prayerEntries),
  subscription: one(subscriptions),
}));

export const chatConversationsRelations = relations(
  chatConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [chatConversations.userId],
      references: [users.id],
    }),
    messages: many(chatMessages),
  })
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));
