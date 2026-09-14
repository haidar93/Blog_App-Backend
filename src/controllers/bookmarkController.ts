import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { db } from "../config/db";
import { bookmarksTable, postsTable, categoriesTable } from "../config/schema";
import { eq, and } from "drizzle-orm";

export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = req.userId!;

    if (!postId) {
      return res.status(400).json({ message: "postId wajib diisi" });
    }

    const existing = await db
      .select()
      .from(bookmarksTable)
      .where(and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.postId, postId)));

    if (existing.length > 0) {
      return res.status(400).json({ message: "Artikel sudah disimpan sebelumnya" });
    }

    await db.insert(bookmarksTable).values({ userId, postId });
    res.status(201).json({ message: "Artikel berhasil disimpan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.userId!;

    await db
      .delete(bookmarksTable)
      .where(and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.postId, Number(postId))));

    res.status(200).json({ message: "Artikel dihapus dari daftar simpanan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getMyBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const bookmarks = await db
      .select({
        postId: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        categoryId: postsTable.categoryId,
        categoryName: categoriesTable.name,
      })
      .from(bookmarksTable)
      .innerJoin(postsTable, eq(bookmarksTable.postId, postsTable.id))
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(bookmarksTable.userId, userId));

    res.status(200).json({ message: "Berhasil mengambil daftar tersimpan", data: bookmarks });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};