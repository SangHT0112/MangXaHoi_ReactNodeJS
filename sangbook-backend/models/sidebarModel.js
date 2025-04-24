import db from "../db.js"; // Kết nối MySQL
import fs from "fs"; // Import để xóa file
import path from "path"; // Import để xử lý đường dẫn

// Lấy tất cả menu
export const getSidebarItems = async () => {
  try {
    const [rows] = await db.query("SELECT id, ten_menu, image FROM sidebar ORDER BY id ASC");
    return rows;
  } catch (error) {
    throw error;
  }
};

// Thêm menu mới
export const createSidebarItem = async (ten_menu, image) => {
  try {
    const [result] = await db.query(
      "INSERT INTO sidebar (ten_menu, image) VALUES (?, ?)",
      [ten_menu, image]
    );
    return { id: result.insertId, ten_menu, image };
  } catch (error) {
    throw error;
  }
};

// Xóa menu theo ID
export const deleteSidebarItem = async (id) => {
    try {
      // Lấy đường dẫn ảnh trước khi xóa menu
      const [rows] = await db.query("SELECT image FROM sidebar WHERE id = ?", [id]);
      
      if (rows.length === 0) {
        throw new Error("Menu không tồn tại!");
      }   
  
      const imagePath = rows[0].image;
  
      // Xóa menu khỏi database
      await db.query("DELETE FROM sidebar WHERE id = ?", [id]);
  
      // Nếu có ảnh thì xóa ảnh trong thư mục uploads
      if (imagePath) {
        const absolutePath = path.join("uploads", imagePath.replace("uploads/", ""));
        
        // Kiểm tra xem file có tồn tại không rồi mới xóa
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }
  
      return { message: "Menu đã bị xóa!" };
    } catch (error) {
      console.error("Lỗi khi xóa menu:", error);
      throw error;
    }
  };