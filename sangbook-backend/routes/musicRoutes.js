import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const router = express.Router();

// Lấy danh sách bài hát
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM songs order by id desc");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Lỗi truy vấn database" });
  }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo thư mục nếu chưa tồn tại
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDir(path.join(__dirname, "../uploads/songs"));
ensureDir(path.join(__dirname, "../uploads/songs/images"));

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "song") {
      cb(null, "uploads/songs");
    } else if (file.fieldname === "image") {
      cb(null, "uploads/songs/images");
    } else {
      cb(new Error("Không hỗ trợ loại file này"), false);
    }
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = Date.now() + fileExtension;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Thêm bài hát mới
router.post("/", upload.fields([{ name: "song", maxCount: 1 }, { name: "image", maxCount: 1 }]), async (req, res) => {
  const { title, artist, user_id } = req.body;

  if (!req.files || !req.files.song) {
    return res.status(400).json({ error: "Cần phải tải lên bài hát" });
  }

  // Chuẩn hóa đường dẫn bằng cách thay \ thành /
  const songPath = req.files.song[0].path.replace(/\\/g, "/");
  const imagePath = req.files.image ? req.files.image[0].path.replace(/\\/g, "/") : null;
  try {
    const [result] = await db.query(
      "INSERT INTO songs (title, artist, source, image, likes, user_id) VALUES (?, ?, ?, ?, 0, ?)",
      [title, artist, songPath, imagePath, user_id]
    );

    res.json({
      message: "Thêm bài hát thành công",
      id: result.insertId,
      title,
      artist,
      source: songPath,
      image: imagePath,
      user_id,
    });
  } catch (err) {
    console.error("Lỗi chi tiết:", err.message, err.stack);
    res.status(500).json({ error: "Lỗi khi thêm bài hát vào cơ sở dữ liệu", details: err.message });
  }
});

// Tăng like cho bài hát
// Tăng like cho bài hát
router.post("/like/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem bài hát có tồn tại trong cơ sở dữ liệu không
    const [songExists] = await db.query("SELECT * FROM songs WHERE id = ?", [id]);
    
    if (songExists.length === 0) {
      return res.status(404).json({ error: "Bài hát không tồn tại" });
    }

    // Tăng like cho bài hát
    const [result] = await db.query("UPDATE songs SET likes = likes + 1 WHERE id = ?", [id]);

    // Kiểm tra kết quả cập nhật
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Không thể tăng số lượng like" });
    }

    // Lấy số lượng like mới để trả về
    const [updatedSong] = await db.query("SELECT likes FROM songs WHERE id = ?", [id]);

    // Trả về số lượng like mới
    res.json({ success: true, likes: updatedSong[0].likes });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi thả tim" });
  }
});
// Thêm route GET để lấy thông tin bài hát theo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [song] = await db.query("SELECT * FROM songs WHERE id = ?", [id]);

    if (song.length === 0) {
      return res.status(404).json({ error: "Bài hát không tồn tại" });
    }

    const songData = {
      ...song[0],
      source: `http://localhost:4000/${song[0].source}`,
      image: song[0].image ? `http://localhost:4000/${song[0].image}` : null,
      lyricsPath: song.lyricsPath ? `http://localhost:4000/${song.lyricsPath}` : null,
    };

    res.json(songData);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin bài hát" });
  }
});

router.get("/lyrics/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Truy vấn đường dẫn lyrics từ database theo id bài hát
    const [result] = await db.query("SELECT lyricsPath FROM songs WHERE id = ?", [id]);

    if (result.length === 0 || !result[0].lyricsPath) {
      return res.status(404).json({ error: "Lyrics not found in database" });
    }

    // Lấy đường dẫn file từ database
    const filePath = path.join(__dirname, "..", result[0].lyricsPath);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Lyrics file not found", path: filePath });
    }

    // Đọc file và gửi về client
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Error reading lyrics file" });
      res.json({ lyrics: data });
    });
  } catch (err) {
    res.status(500).json({ error: "Database query error", details: err.message });
  }
});




export default router;
