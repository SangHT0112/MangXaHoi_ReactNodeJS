import db from "../db.js";

//Tạo nhóm chat
export const createGroupChat = async (groupName, created_by, avatar) => {
    const [result] = await db.query(
        "INSERT INTO group_chats (name, created_by, avatar) VALUES (?, ?, ?)",
        [groupName, created_by, avatar]
    );
    return result.insertId;
};
//Thêm thành viên vào nhóm
export const addMember = async (group_id, user_id) => {
    await db.execute("INSERT INTO group_chat_members (group_id, user_id) values(?,?)",
        [group_id, user_id]
    );
}

//Gửi tin nhắn vào nhốm
export const sendMessage = async (group_id, sender_id, message, media) => {
    console.log("Dữ liệu trước khi lưu:", { group_id, sender_id, message, media });

    if (group_id === undefined || sender_id === undefined || message === undefined) {
        throw new Error("Dữ liệu bị thiếu. Kiểm tra lại tham số đầu vào!");
    }

    // Nếu media là undefined, thay bằng null để tránh lỗi khi thực hiện truy vấn SQL
    media = media ?? null;

    await db.execute(
        "INSERT INTO group_chat_messages (group_id, sender_id, message, media) VALUES (?, ?, ?, ?)",
        [group_id, sender_id, message, media]
    );
};


//Lấy tin nhắn trong nhóm
export const getGroupMessages = async (group_id) => {
    const [rows] = await db.execute("SELECT gm.*, u.username, u.avatar from group_chat_messages gm JOIN users u ON gm.sender_id = u.id where gm.group_id = ? order by gm.sent_at ASC",
        [group_id]
    );
    return rows;
}

//Lấy danh sách người trong nhóm
export const getUserGroups = async (user_id) => {
    const [rows] = await db.execute(
        "SELECT g.* FROM group_chats g JOIN group_chat_members gm ON g.id = gm.group_id WHERE gm.user_id = ?", 
        [user_id]
    );
    return rows;
};

export const deleteUserGroups = async (user_id, group_id) => {
    const [rows] = await db.execute("DELETE FROM group_chat_members WHERE user_id = ? and group_id = ?", [user_id, group_id]);
    return rows;
};