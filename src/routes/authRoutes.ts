import { Router } from "express";
import { register, login, updateProfilePicture, getMyProfile } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMyProfile);
router.put("/profile-picture", authMiddleware, upload.single("image"), updateProfilePicture);

export default router;