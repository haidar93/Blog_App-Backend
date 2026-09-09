import { Request, Response } from "express";
import { db } from "../config/db";
import { categoriesTable } from "../config/schema";
import { from } from "node:stream/iter";

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await db.select().from(categoriesTable);

        res.status(200).json ({
            message: "Berhasil mengambil data kategori",
            data: categories,
        });
    } catch (error) {
        res.status(500).json ({
            message: "Terjadi kesalan server",
            error: error,
        });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Nama kategoru wajib diisi",
            })
        }

        const result = await db.insert(categoriesTable).values({name});

        res.status(201).json({
            message: "Bersahil menambahlkan kategor",
            data: { id: result[0].insertId, name},
        })
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error,
        })
    }
};