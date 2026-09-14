import { Request, Response } from "express";
import { db } from "../config/db";
import { postsTable, categoriesTable } from "../config/schema";
import { eq } from "drizzle-orm";
import cloudinary from "../config/cloudinary";

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        imageUrl: postsTable.imageUrl, // FIXED: Tambahkan imageUrl
        categoryId: postsTable.categoryId,
        categoryName: categoriesTable.name,
      })
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id));

    res.status(200).json({
      message: "Berhasil mengambil data artikel",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, categoryId } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({
        message: "Title, content, dan categoryId wajib diisi",
      });
    }

    // FIXED: Konversi categoryId ke Number
    const numericCategoryId = Number(categoryId);

    const category = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, numericCategoryId));

    if (category.length === 0) {
      return res.status(400).json({
        message: "Kategori tidak ditemukan",
      });
    }

    let imageUrl: string | null = null;

    if (req.file) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blogd" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const result = await db.insert(postsTable).values({
      title,
      content,
      categoryId: numericCategoryId,
      imageUrl,
    });

    res.status(201).json({
      message: "Berhasil menambahkan artikel",
      data: { 
        id: result[0].insertId, 
        title, 
        content, 
        categoryId: numericCategoryId, 
        imageUrl 
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        imageUrl: postsTable.imageUrl, // FIXED: Tambahkan imageUrl
        categoryId: postsTable.categoryId,
        categoryName: categoriesTable.name,
      })
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.id, Number(id)));

    if (post.length === 0) {
      return res.status(404).json({
        message: "Artikel tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil data artikel",
      data: post[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({
        message: "Title, content, dan categoryId wajib diisi",
      });
    }

    const numericCategoryId = Number(categoryId);

    const category = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, numericCategoryId));

    if (category.length === 0) {
      return res.status(400).json({
        message: "Kategori tidak ditemukan",
      });
    }

    const existingPost = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, Number(id)));

    if (existingPost.length === 0) {
      return res.status(404).json({
        message: "Artikel tidak ditemukan",
      });
    }

    // FIXED: Dukung update gambar di updatePost
    let imageUrl = existingPost[0].imageUrl;

    if (req.file) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blogd" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    await db
      .update(postsTable)
      .set({ 
        title, 
        content, 
        categoryId: numericCategoryId, 
        imageUrl 
      })
      .where(eq(postsTable.id, Number(id)));

    res.status(200).json({
      message: "Berhasil mengubah artikel",
      data: { id: Number(id), title, content, categoryId: numericCategoryId, imageUrl },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingPost = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, Number(id)));

    if (existingPost.length === 0) {
      return res.status(404).json({
        message: "Artikel tidak ditemukan",
      });
    }

    await db.delete(postsTable).where(eq(postsTable.id, Number(id)));

    res.status(200).json({
      message: "Berhasil menghapus artikel",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};