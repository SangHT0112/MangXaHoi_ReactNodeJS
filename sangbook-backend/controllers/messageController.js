import { saveMessage, getMessages } from "../models/messageModel.js";
import db from "../db.js";
export const sendMessage = async (req, res) => {
  const { send_id, receive_id, content } = req.body;

  if (!send_id || !receive_id || !content) {
    return res.status(400).json({ message: "Thiếu thông tin tin nhắn" });
  }

  try {
    await saveMessage(send_id, receive_id, content);
    res.status(201).json({ message: "Tin nhắn đã gửi" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi tin nhắn", error });
  }
};

export const fetchMessages = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const [messages] = await db.execute(
      "SELECT * FROM messages WHERE (send_id = ? AND receive_id = ?) OR (send_id = ? AND receive_id = ?) ORDER BY created_at ASC",
      [user1, user2, user2, user1]
    );

    // Lấy reactions cho từng tin nhắn
    for (let msg of messages) {
      const [reactions] = await db.execute(
        "SELECT user_id, reaction FROM message_reactions WHERE message_id = ?",
        [msg.id]
      );
      msg.reactions = reactions; // Thêm reactions vào từng tin nhắn
    }

    res.json({ messages });
  } catch (error) {
    console.error("Lỗi lấy tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



export const revokeMessage = async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body; // Người gửi yêu cầu thu hồi

  try {
    // Kiểm tra xem tin nhắn có thuộc về người gửi không
    const [message] = await db.query("SELECT send_id FROM messages WHERE id = ?", [messageId]);
    if (!message.length || message[0].send_id !== userId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền thu hồi tin nhắn này" });
    }

    // Cập nhật nội dung tin nhắn thành "Tin nhắn đã thu hồi"
    await db.query("UPDATE messages SET content = ? WHERE id = ?", ["Tin nhắn đã thu hồi", messageId]);
    res.status(200).json({ success: true, message: "Tin nhắn đã được thu hồi" });
  } catch (error) {
    console.error("Lỗi khi thu hồi tin nhắn:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};



// Thả hoặc cập nhật reaction
export const addReaction = async (req, res) => {
  const { messageId } = req.params;
  const { userId, reaction } = req.body;

  try {
    // Kiểm tra xem user đã thả reaction chưa
    const [existingReaction] = await db.query(
      "SELECT * FROM message_reactions WHERE message_id = ? AND user_id = ?",
      [messageId, userId]
    );

    if (existingReaction.length > 0) {
      // Cập nhật reaction nếu đã có
      await db.query(
        "UPDATE message_reactions SET reaction = ? WHERE message_id = ? AND user_id = ?",
        [reaction, messageId, userId]
      );
    } else {
      // Thêm reaction mới
      await db.query(
        "INSERT INTO message_reactions (message_id, user_id, reaction) VALUES (?, ?, ?)",
        [messageId, userId, reaction]
      );
    }

    res.status(200).json({ success: true, message: "Reaction đã được thêm" });
  } catch (error) {
    console.error("Lỗi khi thêm reaction:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Lấy reactions của một tin nhắn
export const getReactions = async (req, res) => {
  const { messageId } = req.params;

  try {
    const [reactions] = await db.query(
      "SELECT reaction, user_id FROM message_reactions WHERE message_id = ?",
      [messageId]
    );
    res.status(200).json({ success: true, reactions });
  } catch (error) {
    console.error("Lỗi khi lấy reactions:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

