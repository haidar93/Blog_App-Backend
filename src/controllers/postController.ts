import { Request, Response } from "express";
import { db } from "../config/db";
import { postsTable, categoriesTable } from "../config/schema";
import { eq } from "drizzle-orm";

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await db
        .select({
            id: postsTable.id,
            title: postsTable.title,
            content: postsTable.content,
            categoryId: postsTable.categoryId,
            categoryName: categoriesTable.name,
        })
        .from(postsTable)
        .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))

        res.status(200).json({
            message: "Berhasil mengambil data artikel",
            data: posts,
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error,
        });
    }
};