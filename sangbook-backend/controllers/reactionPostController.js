import { getReactionByUser, addReaction, updateReaction, removeReaction, updateLikeCount} from "../models/reactionPostModel.js";
import db from "../db.js";
export const handleReaction = async (req, res) => {
  try {
    const { post_id, user_id, reaction } = req.body;

    if (!post_id || !user_id) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const existingReaction = await getReactionByUser(post_id, user_id);

    if (existingReaction) {
      if (!reaction) {
        // Nếu reaction = null => Xóa reaction
        await removeReaction(post_id, user_id);
      } else {
        // Nếu chọn reaction khác => Cập nhật reaction
        await updateReaction(post_id, user_id, reaction);
      }
    } else {
      // Nếu chưa có reaction => Thêm mới
      await addReaction(post_id, user_id, reaction);
    }

    // Cập nhật like_count sau khi thay đổi reaction
    await updateLikeCount(post_id);

    res.status(200).json({ message: "Reaction đã được cập nhật" });
  } catch (error) {
    console.error("Lỗi cập nhật reaction:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách tương tác cho một bài viết
export const getReactionByPost = async (req, res) => {
  try {
    const { postId } = req.params; // Lấy postId từ params

    const [reactions] = await db.query(`
      SELECT pr.reaction, u.username, u.avatar
      FROM post_reactions pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.post_id = ?
      ORDER BY pr.id DESC
    `, [postId]);

    res.json(reactions);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tương tác:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



//ADMIN
// Lấy danh sách tương tác
export const getReactions = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.id AS post_id, p.content, p.image, p.video, p.created_at, 
             u.username AS post_author, u.avatar AS post_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    const postIds = posts.map(post => post.post_id);
    
    if (postIds.length === 0) {
      return res.json([]);
    }

    const [reactions] = await db.query(`
      SELECT pr.post_id, pr.reaction, u.username AS user_name, u.avatar AS user_avatar
      FROM post_reactions pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.post_id IN (?)
    `, [postIds]);

    // Gán danh sách reaction vào từng bài đăng
    const postMap = {};
    posts.forEach(post => {
      postMap[post.post_id] = { ...post, reactions: [] };
    });

    reactions.forEach(reaction => {
      postMap[reaction.post_id].reactions.push({
        user_name: reaction.user_name,
        user_avatar: reaction.user_avatar,
        reaction: reaction.reaction
      });
    });

    res.json(Object.values(postMap));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tương tác:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách tương tác!" });
  }
};


// Xóa một lượt thích
export const deleteInteraction = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM interactions WHERE id = ?", [id]);
    res.json({ message: "Lượt thích đã bị xóa!" });
  } catch (error) {
    console.error("Lỗi khi xóa lượt thích:", error);
    res.status(500).json({ error: "Lỗi khi xóa lượt thích!" });
  }
};



