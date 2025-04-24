import db from "../db.js";

export const getReactionByUser = async (postId, userId) => {
  const [result] = await db.query(
    "SELECT * FROM post_reactions WHERE post_id = ? AND user_id = ?",
    [postId, userId]
  );
  return result.length > 0 ? result[0] : null;
};

export const addReaction = async (postId, userId, reaction) => {
  await db.query(
    "INSERT INTO post_reactions (post_id, user_id, reaction) VALUES (?, ?, ?)",
    [postId, userId, reaction]
  );
};

export const updateReaction = async (postId, userId, reaction) => {
  await db.query(
    "UPDATE post_reactions SET reaction = ? WHERE post_id = ? AND user_id = ?",
    [reaction, postId, userId]
  );
};

export const removeReaction = async (postId, userId) => {
  await db.query("DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?", [
    postId,
    userId,
  ]);
};

// ✅ Cập nhật like_count
export const updateLikeCount = async (postId) => {
  await db.query(
    "UPDATE posts SET like_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = ?) WHERE id = ?",
    [postId, postId]
  );
};
