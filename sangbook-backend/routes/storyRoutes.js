import express from "express";
import multer from "multer";
import path from "path";
import { getStories, createNewStory, removeStory,increaseViewCount, getUserStories } from "../controllers/storyController.js";

const router = express.Router();

// Cấu hình upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "./uploads/stories");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "./uploads/videos");
    } else {
      cb(new Error("File không hợp lệ"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Lấy danh sách story
router.get("/", getStories);
router.get("/user/:userId", getUserStories); // Lấy stories của người dùng theo userId
// Đăng story mới
router.post("/", upload.fields([{ name: "image" }, { name: "video" }]), createNewStory);
router.put("/view/:storyId", increaseViewCount);
// Xóa story
router.delete("/:id", removeStory);

export default router;
