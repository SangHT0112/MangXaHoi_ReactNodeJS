import * as FriendModel from "../models/friendModel.js";
import db from "../db.js";
// Gửi lời mời kết bạn
export const sendFriendRequest = async (req, res) => {
    try {
        const { send_id, receive_id } = req.body;

        const status = await FriendModel.checkFriendStatus(send_id, receive_id);
        if (status !== "none") {
            return res.status(400).json({ success: false, message: "Đã có lời mời kết bạn trước đó" });
        }

        await FriendModel.sendFriendRequest(send_id, receive_id);
        res.json({ success: true, message: "Đã gửi lời mời kết bạn" });
    } catch (error) {
        console.error("Lỗi khi gửi lời mời kết bạn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// Kiểm tra trạng thái kết bạn
export const checkFriendStatus = async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const status = await FriendModel.checkFriendStatus(user1, user2);
        res.json({ success: true, status });
    } catch (error) {
        console.error("Lỗi kiểm tra trạng thái kết bạn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (req, res) => {
    try {
        const { request_id } = req.body;

        if (!request_id) {
            return res.status(400).json({ success: false, message: "Thiếu request_id" });
        }

        // Lấy thông tin send_id và receive_id từ request_id
        const [rows] = await db.execute("SELECT send_id, receive_id FROM friends WHERE id = ?", [request_id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lời mời kết bạn" });
        }

        const { send_id, receive_id } = rows[0];

        await db.execute(
            "UPDATE friends SET status = 'accepted' WHERE id = ? AND status = 'pending'",
            [request_id]
        );

        res.json({ success: true, message: "Đã chấp nhận lời mời kết bạn" });
    } catch (error) {
        console.error("Lỗi chấp nhận lời mời kết bạn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};



export const declineFriendRequest = async (req, res) => {
    const { request_id } = req.body;

    try {
        // Xóa lời mời kết bạn
        await db.execute(
            "DELETE FROM friends WHERE id = ? AND status = 'pending'",
            [request_id]
        );

        res.json({ success: true, message: "Đã từ chối lời mời kết bạn" });
    } catch (error) {
        console.error("Lỗi khi từ chối lời mời:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
// Lấy danh sách lời mời kết bạn
export const getFriendRequests = async (req, res) => {
    try {
        const { receive_id } = req.params;
        const friendRequests = await FriendModel.getFriendRequests(receive_id);
        res.json({ success: true, friendRequests });
    } catch (error) {
        console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

//Lấy danh sách bạn bè
export const getAcceptedFriends = async (req, res) => {
    try {
        const { userId } = req.params;
        const friends = await FriendModel.getAcceptedFriends(userId);
        res.json({ success: true, friends });
    } catch (error) {
        console.error("Lỗi lấy danh sách bạn bè:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};



//Các user chưa kết bạn
export const getSuggestedFriends = async (req, res) => {
    try {
        const { userId } = req.params;
        const suggestedFriends = await FriendModel.getSuggestedFriends(userId);
        res.json({ success: true, suggestedFriends });
    } catch (error) {
        console.error("Lỗi lấy danh sách gợi ý kết bạn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

