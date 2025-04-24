import express from "express";
import { handleReaction, getReactionByPost, getReactions, deleteInteraction } from "../controllers/reactionPostController.js";

const router = express.Router();

// Route xử lý reaction
router.post("/", handleReaction);

// Lấy danh sách tương tác cho một bài viết (Frontend)
router.get("/:postId", getReactionByPost);






// Lấy danh sách tất cả tương tác (Admin)
router.get("/admin", getReactions);

// Xóa một lượt thích
router.delete("/:id", deleteInteraction);

export default router;
