import express from "express";
import { createComment, getCommentsByPost, getAllComments } from "../controllers/commentPostController.js";
const router = express.Router();

router.post("/", createComment); //APU Tạo bình luận
router.get("/:post_id", getCommentsByPost); //API lấy bình luận theo bài viết



router.get("/", getAllComments); // API lấy tất cả bình luận cho admin

export default router;