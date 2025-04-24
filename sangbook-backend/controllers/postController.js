import { getAllPosts, createPost, deletePost} from "../models/postModel.js";
import db from "../db.js";
// Lấy tất cả bài viết
export const getPosts = async (req, res) => {
  try {
    const user_id = req.query.user_id; // Lấy user_id từ query
    if (!user_id) return res.status(400).json({ error: "Thiếu user_id!" });

    const posts = await getAllPosts(user_id);
    res.json(posts);
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res.status(500).json({ error: "Lỗi khi lấy bài viết!" });
  }
};

//Lấy bài viết theo id
export const getPostsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log("User id ", user_id);
    const [posts] = await db.execute(
      `SELECT posts.*, users.username, users.avatar 
       FROM posts 
       JOIN users ON posts.user_id = users.id 
       WHERE posts.user_id = ? 
       ORDER BY posts.created_at DESC`,
      [user_id]
    );
    res.json({ success: true, posts });
  } catch (error) {
    console.error("Lỗi lấy bài viết của người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};




// Xử lý đăng bài mới
export const createNewPost = async (req, res) => {
  const { user_id, content } = req.body; // Lấy user_id từ request body
  const image = req.files?.image ? req.files.image[0] : null;
  const video = req.files?.video ? req.files.video[0] : null;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Thiếu thông tin user_id hoặc nội dung bài viết!" });
  }

  try {
    const newPost = await createPost(user_id, content, image, video);
    res.status(201).json({
      message: "Bài viết đã được đăng thành công!",
      post: newPost,
    });
  } catch (error) {
    console.error("Lỗi khi đăng bài viết:", error);
    res.status(500).json({ error: "Lỗi khi đăng bài viết!" });
  }
};



// Xử lý xóa bài viết
export const removePost = async (req, res) => {
  const post_id = req.params.id; // Lấy post_id từ URL
  const user_id = req.query.user_id; // Lấy user_id từ query

  if (!post_id || !user_id) {
    return res.status(400).json({ error: "Thiếu post_id hoặc user_id!" });
  }

  try {
    const result = await deletePost(post_id, user_id);
    if (!result.success) {
      return res.status(403).json({ error: result.message });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    res.status(500).json({ error: "Lỗi khi xóa bài viết!" });
  }
};

