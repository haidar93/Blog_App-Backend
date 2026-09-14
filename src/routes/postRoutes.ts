import { Router } from "express";
import { getAllPosts, createPost, getPostById, updatePost, deletePost } from "../controllers/postController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

// GET ALL & GET BY ID
router.get("/", getAllPosts);
router.get("/:id", getPostById); 

// CREATE & UPDATE (menggunakan authMiddleware + upload.single)
router.post("/", authMiddleware, upload.single("image"), createPost);
router.put("/:id", authMiddleware, upload.single("image"), updatePost);

// DELETE
router.delete("/:id", authMiddleware, deletePost);

export default router;