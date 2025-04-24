import Comment from "../models/commentPostModel.js";

export const createComment = async (req, res) => {
  try {
    const { user_id, post_id, content } = req.body;
    if (!user_id || !post_id || !content.trim()) {
      return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    }
    const commentId = await Comment.create(user_id, post_id, content);
    res.json({ status: "success", message: "Bình luận đã được lưu", commentId });
  } catch (err) {
    console.error("Lỗi tạo bình luận:", err);
    res.status(500).json({ error: "Lỗi server khi tạo bình luận" });
  }
};

export const getCommentsByPost = async (req, res) => {
    try {
        const { post_id } = req.params;
        const comments = await Comment.getByPostId(post_id); // 
        res.json(comments); // Chỉ trả về bình luận, không có buffer
    } catch (err) {
        res.status(500).json({ error: "Lỗi server" });
    }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.getAll();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy tất cả bình luận" });
  }
};


