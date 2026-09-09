import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";

// CATEGORIES
export const categoriesTable = mysqlTable("categories", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
});

// POSTS
export const postsTable = mysqlTable("posts", {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id").notNull().references(() => categoriesTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});