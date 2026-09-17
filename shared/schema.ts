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

export type ToolCategory = "organize" | "convert" | "edit" | "security" | "image";

/**
 * Where a tool's work actually happens. This drives honest per-tool
 * processing disclosures and lets the platform reason about capabilities.
 * Every current tool runs on the user's device; there is no server processing.
 */
export type ProcessingMode =
  | "browser-worker" // pdf-lib in a Web Worker
  | "browser-wasm" // QPDF compiled to WebAssembly (encryption)
  | "browser-main"; // canvas / pdf-lib on the main thread

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  color: string;
  route: string;
  acceptedTypes: string[];
  multiple: boolean;
  /** How and where this tool processes files. Defaults to "browser-worker". */
  processingMode?: ProcessingMode;
  /** Maximum number of files accepted. Only meaningful when `multiple` is true. */
  maxFiles?: number;
  /** Maximum accepted size per file, in bytes. */
  maxFileBytes?: number;
  /** Minimum number of files required before the tool can run. */
  minFiles?: number;
  /** Extra search terms and task phrases used by discovery/search. */
  keywords?: string[];
  /**
   * Tool ids suggested as a next step after this tool completes.
   * Powers the result-to-next-tool workflow recommendations.
   */
  relatedTools?: string[];
}
