import { getSidebarItems, createSidebarItem, deleteSidebarItem } from "../models/sidebarModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Tạo thư mục nếu chưa có
const uploadDir = "uploads/menus/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Lưu vào thư mục uploads/menus/
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage }).single("image");

// Lấy danh sách menu
export const getSidebar = async (req, res) => {
  try {
    const sidebar = await getSidebarItems();
    res.json(sidebar);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy menu!" });
  }
};

// Thêm menu mới
export const addSidebarItem = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi upload hình ảnh!" });
    }

    const { ten_menu } = req.body;
    const image = req.file ? `uploads/menus/${req.file.filename}` : null;    // Đường dẫn đúng

    if (!ten_menu || !image) {
      return res.status(400).json({ error: "Thiếu thông tin menu!" });
    }

    try {
      const newItem = await createSidebarItem(ten_menu, image);
      res.status(201).json({ message: "Menu đã được thêm!", item: newItem });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi thêm menu!" });
    }
  });
};

// Xóa menu theo ID
export const removeSidebarItem = async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ error: "Thiếu ID menu cần xóa!" });
    }
  
    try {
      const result = await deleteSidebarItem(id);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Không tìm thấy menu!" });
      }
  
      res.json({ message: "Xóa menu thành công!" });
    } catch (error) {
      console.error("Lỗi khi xóa menu:", error);
      res.status(500).json({ error: "Lỗi server khi xóa menu!" });
    }
  };
  
