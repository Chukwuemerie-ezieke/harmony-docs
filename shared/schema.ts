import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Tool definitions for the frontend
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "organize" | "convert" | "edit" | "security" | "image";
  color: string;
  route: string;
  acceptedTypes: string[];
  multiple: boolean;
}
