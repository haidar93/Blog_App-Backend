import { Router } from "express";
import { addBookmark, removeBookmark, getMyBookmarks } from "../controllers/bookmarkController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getMyBookmarks);
router.post("/", authMiddleware, addBookmark);
router.delete("/:postId", authMiddleware, removeBookmark);

export default router;