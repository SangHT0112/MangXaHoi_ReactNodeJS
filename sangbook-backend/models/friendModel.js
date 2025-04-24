import db from "../db.js";

export const sendFriendRequest = async (send_id, receive_id) => {
    return db.execute(
        "INSERT INTO friends (send_id, receive_id, status) VALUES (?, ?, 'pending')",
        [send_id, receive_id]
    );
};

export const checkFriendStatus = async (user1, user2) => {
    const [result] = await db.execute(
        "SELECT status FROM friends WHERE (send_id = ? AND receive_id = ?) OR (send_id = ? AND receive_id = ?)",
        [user1, user2, user2, user1]
    );
    return result.length > 0 ? result[0].status : "none";
};

export const acceptFriendRequest = async (send_id, receive_id) => {
    return db.execute(
        "UPDATE friends SET status = 'accepted' WHERE send_id = ? AND receive_id = ? AND status = 'pending'",
        [send_id, receive_id]
    );
};

export const getFriendRequests = async (receive_id) => {
    const [result] = await db.execute(
        `SELECT f.id AS request_id, u.id AS send_id, u.username, u.avatar 
         FROM friends f 
         JOIN users u ON f.send_id = u.id 
         WHERE f.receive_id = ? AND f.status = 'pending'`,
        [receive_id]
    );
    return result;
};

export const getAcceptedFriends = async (userId) => {
    const [rows] = await db.execute(
        `SELECT u.id, u.username, u.avatar 
         FROM friends f
         JOIN users u ON (f.send_id = u.id OR f.receive_id = u.id)
         WHERE (f.send_id = ? OR f.receive_id = ?) 
         AND f.status = 'accepted'
         AND u.id != ?`,
        [userId, userId, userId]
    );
    return rows;
};


export const getSuggestedFriends = async (userId) => {
    const [rows] = await db.execute(
        `SELECT u.id, u.username, u.avatar
         FROM users u
         WHERE u.id != ?
         AND u.id NOT IN (
             SELECT send_id FROM friends WHERE receive_id = ? AND status = 'accepted'
             UNION
             SELECT receive_id FROM friends WHERE send_id = ? AND status = 'accepted'
         )
         LIMIT 20`, // Giới hạn 10 gợi ý
        [userId, userId, userId]
    );
    return rows;
};

