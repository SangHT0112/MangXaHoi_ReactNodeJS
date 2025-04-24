import db from "../db.js"; // Kết nối với MySQL
import fs from "fs";
import path from "path";
// Lấy tất cả bài viết
export const getAllPosts = async (user_id) => {   //user_id để lấy tương tác bài viếtviết
  const [rows] = await db.query(
    `SELECT 
      Posts.*,
      Users.email,
      Users.username, 
      Users.avatar, 
      (SELECT COUNT(*) FROM post_reactions WHERE post_reactions.post_id = Posts.id) AS like_count,
      (SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = Posts.id) AS comment_count,
      (SELECT reaction FROM post_reactions WHERE post_reactions.post_id = Posts.id AND post_reactions.user_id = ?) AS user_reaction
    FROM Posts
    JOIN Users ON Posts.user_id = Users.id
    ORDER BY Posts.id DESC`,
    [user_id]
  );
  return rows;
};



// Tạo bài viết mới
// Tạo bài viết mới
export const createPost = async (user_id, content, image, video) => {
  const imagePath = image ? `uploads/posts/${image.filename}` : null;
  const videoPath = video ? `uploads/videos/${video.filename}` : null;

  try {
    const [result] = await db.query(
      "INSERT INTO Posts (user_id, content, image, video) VALUES (?, ?, ?, ?)",
      [user_id, content, imagePath, videoPath]
    );

     // Truy vấn lại để lấy thông tin người dùng
     const [user] = await db.query(
      `SELECT username, avatar FROM Users WHERE id = ?`,
      [user_id]
    );

    return {
      id: result.insertId,
      user_id,
      username: user[0]?.username || 'Unknown', // Kiểm tra nếu không có username
      avatar: user[0]?.avatar || 'default-avatar.png',
      content,
      image: imagePath,
      video: videoPath,
    };
  } catch (error) {
    console.error("Lỗi khi thêm bài viết vào database:", error);
    throw error;
  }
};



// Xóa bài viết
export const deletePost = async (post_id, user_id) => {
  try {
    // Lấy thông tin bài viết trước khi xóa
    const [rows] = await db.query("SELECT image, video FROM Posts WHERE id = ?", [post_id]);

    if (rows.length === 0) {
      return { success: false, message: "Bài viết không tồn tại hoặc không thuộc quyền sở hữu!" };
    }

    const { image, video } = rows[0];

    // Xóa bài viết khỏi database
    await db.query("DELETE FROM Posts WHERE id = ?", [post_id]);

    // Xóa file ảnh nếu có
    if (image) {
      const imagePath = path.join("uploads/posts", path.basename(image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Xóa file video nếu có
    if (video) {
      const videoPath = path.join("uploads/videos", path.basename(video));
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    return { success: true, message: "Xóa bài viết thành công!" };
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    throw error;
  }
};
