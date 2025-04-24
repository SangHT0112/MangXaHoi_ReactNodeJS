import express from "express";
import { getSidebar, addSidebarItem, removeSidebarItem  } from "../controllers/sidebarController.js";

const router = express.Router();

// Lấy danh sách menu
router.get("/", getSidebar);

// Thêm menu mới (hỗ trợ upload file)
router.post("/", addSidebarItem);
// Xóa menu theo ID
router.delete("/:id", removeSidebarItem);
export default router;
