import db from "../db.js";

const Comment = {
  create: async (user_id, post_id, content) => {
    const [result] = await db.execute(
      "INSERT INTO post_comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW())",
      [user_id, post_id, content]
    );
    return result.insertId; // Trả về ID của bình luận vừa tạo
  },

  getByPostId: async (post_id) => {
    const [rows] = await db.execute(
        `SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, 
                u.username, u.avatar 
        FROM post_comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ? ORDER BY c.created_at DESC`, 
        [post_id]
        );
        return rows; // ✅ Trả về danh sách bình luận
    },

    getAll: async () => {
      const query = `SELECT 
                      c.id AS comment_id, c.post_id, c.user_id, c.content, c.created_at, 
                      u.username AS comment_author, u.avatar AS comment_avatar,
                      p.content AS post_content, p.image AS post_image, p.video AS post_video, p.email AS post_author_email,
                      pu.username AS post_author, pu.avatar AS post_avatar
                      FROM post_comments c 
                      JOIN users u ON c.user_id = u.id
                      JOIN posts p ON c.post_id = p.id
                      JOIN users pu ON p.user_id = pu.id
                      ORDER BY c.post_id ASC, c.created_at DESC
                      LIMIT 25;
                      `;
      const [rows] = await db.execute(query);
      return rows;
  },
  
};

export default Comment;
