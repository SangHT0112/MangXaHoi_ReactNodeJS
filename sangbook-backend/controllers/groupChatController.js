import { createGroupChat, addMember, sendMessage, getGroupMessages, getUserGroups, deleteUserGroups } from "../models/groupChatModels.js";

//API tạo nhóm
export const createGroupController = async (req, res) => {
    try {
        const { groupName, created_by, members } = req.body;
        if (!groupName || !created_by) {
            return res.status(400).json({ error: "Thiếu thông tin nhóm hoặc người tạo" });
        }

        const avatar = req.file ? `uploads/group_chats/${req.file.filename}` : null;

        const group_id = await createGroupChat(groupName, created_by, avatar);
        await addMember(group_id, created_by);

        if (Array.isArray(members) && members.length > 0){
            for (const member_id of members) {
                if (member_id !== created_by) {
                    await addMember(group_id, member_id);
                }
            }
        }

        const newGroup = {
            id: group_id,
            name: groupName,
            avatar: avatar || null,
            created_by
        };

        res.status(201).json({ message: "Nhóm chat đã được tạo", group: newGroup });
    } catch (error) {
        console.error("Lỗi tạo nhóm:", error);
        res.status(500).json({ error: error.message });
    }
};



// Thêm thành viên vào nhóm
export const addMemberController = async (req, res) => {
    try{
        const {group_id, user_id} = req.body;
        await addMember(group_id, user_id);
        res.json({message: "Đã thêm thành viên vào nhóm",});
    }catch(err){
        res.status(500).json({error: err.message})
    }
};

//Gửi tin nhắn vào nhóm
export const sendMessageController = async (req, res) => {
    try{
        const {group_id, sender_id, message, media} = req.body;
        await sendMessage(group_id, sender_id, message, media);
        res.status(201).json({message: "Tin nhắn đã gửi!"});

    }catch(err){
        res.status(500).json({ error: err.message });

    }
};

// lấy danh sách tin nhắn nhóm
export const getGroupMessagesController = async (req, res) => {
    try {
        const { group_id } = req.params;
        const messages = await getGroupMessages(group_id);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Lấy danh sách thành viên nhóm
export const getUserGroupsController = async (req, res) => {
    try {
        const { user_id } = req.params;
        const groups = await getUserGroups(user_id);
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const deleleUserController = async(req, res) => {
    try{
        const {user_id, group_id} = req.params;
        await deleteUserGroups(user_id, group_id);
        res.json({message: "Rời nhóm thành công"});
    }catch(err){
        res.status(500).json({error: err.message});
    }
}




