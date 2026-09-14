import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import { usersTable } from "../config/schema";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../middlewares/authMiddleware";
import cloudinary from "../config/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_ujian_blogd";

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, dan password wajib diisi",
            });
        }

        const exitingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (exitingUser.length > 0) {
            return res.status(400).json({
                message: "Email sudah terdaftar",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.insert(usersTable).values({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Registrasi berhasil, silahkan login",
            data: { id: result[0].insertId, username, email },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email dan password wajib diisi",
            });
        }

        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (users.length === 0) {
            return res.status(400).json({
                message: "Email atau password salah",
            });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Email atau password salah",
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login berhasil",
            data: { token, username: user.username, email: user.email },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// BARU: ambil data profil user yang sedang login
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));

        if (users.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const { password, ...userWithoutPassword } = users[0];
        res.status(200).json({ message: "Berhasil mengambil profil", data: userWithoutPassword });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// BARU: upload/ganti foto profil
export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        if (!req.file) {
            return res.status(400).json({ message: "Gambar wajib diupload" });
        }

        const uploadResult = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "blogd/profiles" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file!.buffer);
        });

        await db
            .update(usersTable)
            .set({ profileImageUrl: uploadResult.secure_url })
            .where(eq(usersTable.id, userId));

        res.status(200).json({
            message: "Foto profil berhasil diubah",
            data: { profileImageUrl: uploadResult.secure_url },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};