import express from "express";
import { sendMessage, fetchMessages,revokeMessage, addReaction, getReactions  } from "../controllers/messageController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/:user1/:user2", fetchMessages);
router.get("/:send_id/:receive_id", async (req, res) => {
    const { send_id, receive_id } = req.params;

    try {
        const [messages] = await db.execute(
            "SELECT * FROM messages WHERE (send_id = ? AND receive_id = ?) OR (send_id = ? AND receive_id = ?) ORDER BY created_at ASC",
            [send_id, receive_id, receive_id, send_id]
        );
        res.json({ messages });
    } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

router.put("/:messageId/revoke", revokeMessage);
router.post("/:messageId/reaction", addReaction);
router.get("/:messageId/reactions", getReactions);
export default router;


