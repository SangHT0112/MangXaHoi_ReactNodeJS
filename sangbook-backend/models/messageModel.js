import db from "../db.js";

export const saveMessage = async (send_id, receive_id, content) => {
  const query = "INSERT INTO messages (send_id, receive_id, content) VALUES (?, ?, ?)";
  await db.execute(query, [send_id, receive_id, content]);
};

export const getMessages = async (user1, user2) => {
  const query = `
    SELECT * FROM messages 
    WHERE (send_id = ? AND receive_id = ?) OR (send_id = ? AND receive_id = ?)
    ORDER BY created_at ASC`;
  const [messages] = await db.execute(query, [user1, user2, user2, user1]);
  return messages;
};
