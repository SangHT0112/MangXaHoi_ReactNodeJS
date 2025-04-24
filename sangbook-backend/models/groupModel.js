import db from "../db.js";

// Tạo nhóm mới
export const createGroup = async (groupName, created_by, avatar) => {
    const [result] = await db.query(
        "INSERT INTO groups (name, created_by, avatar) VALUES (?, ?, ?)",
        [groupName, created_by, avatar]
    );
    return result.insertId;
};

// Thêm thành viên vào nhóm
export const addGroupMembers = async (groupId, members) => {
    if (!Array.isArray(members) || members.length === 0) return;

    const values = members.map(userId => [groupId, userId]);
    await db.query("INSERT INTO group_members (group_id, user_id) VALUES ?", [values]);
};

// Lấy danh sách nhóm của người dùng
export const getUserGroups = async (userId) => {
    const [rows] = await db.query(`
        SELECT g.* FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?`, [userId]);
    return rows;
};


//GroupDetaiPage
// Lấy thông tin chi tiết của nhóm, bao gồm thông tin người tạo nhóm
export const getGroupById = async (groupId) => {
    const query = `
      SELECT 
        groups.*, 
        users.avatar AS creator_avatar, 
        users.username AS creator_username 
      FROM groups
      JOIN users ON groups.created_by = users.id
      WHERE groups.id = ?
    `;
    const [rows] = await db.query(query, [groupId]);
    return rows[0] || null;
  };



// Lấy tất cả thành viên trong nhóm
export const getGroupMembers = async (groupId) => {
    const query = `
        SELECT users.id, users.username, users.avatar 
        FROM group_members 
        JOIN users ON group_members.user_id = users.id 
        WHERE group_members.group_id = ?;
    `;
    
    try {
        const [rows] = await db.query(query, [groupId]);
        return rows; // Trả về danh sách thành viên
    } catch (error) {
        console.error("Lỗi lấy danh sách thành viên:", error);
        throw error;
    }
};


//Lay tat ca hoi nhom
export const getAllGroups = async() =>{
    const [rows] = await db.query("SELECT * from groups");
    return rows;
}



//Gửi yêu cầu tham gia nhóm
// Gửi yêu cầu tham gia nhóm
export const sendJoinRequest = async (groupId, userId, message) => {
    console.log("📌 Gửi yêu cầu tham gia nhóm với dữ liệu:", { groupId, userId, message });

    const [result] = await db.query(
        "INSERT INTO group_requests (group_id, user_id, message, status) VALUES (?, ?, ?, 'pending')",
        [groupId, userId, message]
    );
    return result.insertId;
};


// Lấy danh sách yêu cầu tham gia nhóm (dành cho trưởng nhóm)
export const getJoinRequests = async (groupId) => {
    const [rows] = await db.query(
        `SELECT gr.*, u.username, u.avatar 
         FROM group_requests gr
         JOIN users u ON gr.user_id = u.id
         WHERE gr.group_id = ? AND gr.status = 'pending'`,
        [groupId]
    );
    return rows;
};

// Chấp nhận hoặc từ chối yêu cầu tham gia nhóm
export const handleJoinRequest = async (requestId, isAccepted) => {
    console.log("ID CUA NGUOI YEU CAU", requestId);
    if (isNaN(requestId)) {
        throw new Error("requestId không hợp lệ.");
    }
    const [rows] = await db.query("SELECT group_id, user_id FROM group_requests WHERE id = ?", requestId);

    // Nếu không tìm thấy yêu cầu, throw lỗi phù hợp
    if (rows.length === 0) {
        throw new Error(`Yêu cầu tham gia nhóm với ID ${requestId} không tồn tại.`);
    }

    const { group_id, user_id } = rows[0];

    if (isAccepted) {
        // Thêm người dùng vào nhóm nếu yêu cầu được chấp nhận
        await db.query("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [group_id, user_id]);
    }

    // Cập nhật trạng thái yêu cầu tham gia nhóm
    await db.query("UPDATE group_requests SET status = ? WHERE id = ?", [isAccepted ? 'accepted' : 'rejected', requestId]);
};



// Xóa thành viên khỏi nhóm
export const removeMemberFromGroup = async (groupId, userId) => {
    // Kiểm tra xem người dùng có phải là thành viên của nhóm không
    const [groupMembers] = await db.query("SELECT * FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, userId]);

    if (groupMembers.length === 0) {
        throw new Error("Người dùng không phải là thành viên của nhóm.");
    }

    // Xóa người dùng khỏi nhóm
    await db.query("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, userId]);
};



//===========================THÊM BÀI ĐĂNG LÊN NHÓM=======================
export const addGroupPost = async (groupId, userId, content, media) => {
    if (!groupId || !userId || !content) {
        throw new Error('Vui lòng điền đầy đủ thông tin.');
    }

    const sql = 'INSERT INTO group_posts (group_id, user_id, content, media) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [groupId, userId, content, media]);
    return result.insertId;
};


//Hủy yêu cầu tham gia nhóm
export const cancelJoinRequest = async (groupId, userId) => {
    try {
      const [result] = await db.query(
        "DELETE FROM join_requests WHERE group_id = ? AND user_id = ?",
        [groupId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  };