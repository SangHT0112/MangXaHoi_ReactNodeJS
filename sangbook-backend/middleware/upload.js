import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ✅ Fix lỗi __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Kiểm tra & tạo thư mục uploads/avatars nếu chưa có
const uploadDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) ext = ".jpg"; // Nếu không có đuôi, mặc định là .jpg
    const fileName = `${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

export default upload;
