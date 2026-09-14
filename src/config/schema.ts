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
    imageUrl: text("image_url"), // <-- Tambahkan di sini
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}); 

// USERS
export const usersTable = mysqlTable("users", {
    id: int("id").autoincrement().primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    profileImageUrl: text("profile_image_url"), // BARU
    createdAt: timestamp("created_at").defaultNow(),
});

// BOOKMARK
export const bookmarksTable = mysqlTable("bookmarks", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    postId: int("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
});