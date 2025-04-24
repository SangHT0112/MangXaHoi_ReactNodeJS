import express from "express";
import multer from "multer";
import path from "path";
import { getPosts, getPostsByUser, createNewPost, removePost } from "../controllers/postController.js"; // Chắc chắn dùng createNewPost
const router = express.Router();

// Cấu hình upload file (hình ảnh & video)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "./uploads/posts"); // Lưu ảnh
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "./uploads/videos"); // Lưu video
    } else {
      cb(new Error("File không hợp lệ"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


// Route lấy danh sách bài viết
router.get("/", getPosts);
router.get("/user/:user_id", getPostsByUser);
//Route lấy danh sách bài viết admin


// Route đăng bài viết (cả hình ảnh & video)
router.post("/", upload.fields([{ name: "image" }, { name: "video" }]), createNewPost);
// Route xóa bài viết
router.delete("/:id", removePost);

export default router;
