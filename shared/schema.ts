import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  branch: text("branch").notNull(),
  hostelStatus: text("hostel_status").notNull(),
  hobbies: text("hobbies").array().notNull(),
  instagramHandle: text("instagram_handle"),
  photoUrl: text("photo_url").notNull(),
});

export const memes = pgTable("memes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  tags: text("tags").array(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
});

export const memeVotes = pgTable("meme_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  memeId: integer("meme_id").notNull(),
  voteType: text("vote_type").notNull(), // 'upvote' or 'downvote'
});

export const confessions = pgTable("confessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(true),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(true),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull(),
  user2Id: integer("user2_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  age: true,
  branch: true,
  hostelStatus: true,
  hobbies: true,
  instagramHandle: true,
  photoUrl: true,
});

export const insertMemeSchema = createInsertSchema(memes).pick({
  userId: true,
  imageUrl: true,
  caption: true,
  tags: true,
});

export const insertMemeVoteSchema = createInsertSchema(memeVotes).pick({
  userId: true,
  memeId: true,
  voteType: true,
});

export const insertConfessionSchema = createInsertSchema(confessions).pick({
  userId: true,
  content: true,
  isAnonymous: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  userId: true,
  content: true,
  isAnonymous: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  matchId: true,
  senderId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMeme = z.infer<typeof insertMemeSchema>;
export type InsertMemeVote = z.infer<typeof insertMemeVoteSchema>;
export type InsertConfession = z.infer<typeof insertConfessionSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type User = typeof users.$inferSelect;
export type Meme = typeof memes.$inferSelect;
export type MemeVote = typeof memeVotes.$inferSelect;
export type Confession = typeof confessions.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;