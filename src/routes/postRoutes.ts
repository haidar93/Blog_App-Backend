import { Router } from "express";
import { getAllPosts } from "../controllers/postController";

const router = Router();

router.get("/", getAllPosts);

export default router;