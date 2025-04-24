import { createGroup,
        addGroupMembers, 
        getUserGroups, 
        getGroupById,
        getGroupMembers,
        getAllGroups,
        sendJoinRequest, 
        getJoinRequests, 
        handleJoinRequest,
        removeMemberFromGroup,
        addGroupPost,
        cancelJoinRequest
     } from "../models/groupModel.js";
import db from "../db.js";
// API tạo nhóm
export const createNewGroup = async (req, res) => {
    try {
        const { name, created_by, members } = req.body;
        if (!name || !created_by || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin nhóm." });
        }

        const avatar = req.file ? `uploads/groups/${req.file.filename}` : null;
        console.log("📌 Dữ liệu nhận được:", { name, created_by, members, avatar });

        const groupId = await createGroup(name, created_by, avatar);
        console.log("✅ Nhóm tạo thành công, ID:", groupId);

        await addGroupMembers(groupId, [...members, created_by]);
        console.log("✅ Thành viên đã được thêm vào nhóm!");

        res.status(201).json({ success: true, message: "Nhóm đã được tạo thành công", groupId, avatar });
    } catch (error) {
        console.error("❌ Lỗi tạo nhóm:", error);
        res.status(500).json({ success: false, message: "Lỗi tạo nhóm.", error: error.message });
    }
};

// API lấy danh sách nhóm của người dùng
export const getGroupsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const groups = await getUserGroups(userId);
        res.json(groups);
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách nhóm:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách nhóm." });
    }
};


// API lấy thông tin chi tiết của nhóm
export const getGroupDetail = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: "Nhóm không tồn tại." });
        }

        res.status(200).json({ success: true, group });
    } catch (error) {
        console.error("❌ Lỗi lấy thông tin nhóm:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy thông tin nhóm." });
    }
};



// lấy thành viên nhómnhóm
export const getMembers = async (req, res) => {
    const { groupId } = req.params;
    
    try {
        const members = await getGroupMembers(groupId);
        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách thành viên", error });
    }
};


//LAY TAT CA HOI NHOM
export const getAllGroupList = async (req, res) => {
    try {
        const groups = await getAllGroups();
        res.status(200).json(groups);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tất cả hội nhóm", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách hội nhóm" });
    }
};

//====================GỬI YÊU CÀUA THAM GIA NHÓM===============//


// Gửi yêu cầu tham gia nhóm
export const requestToJoinGroup = async (req, res) => {
    const { groupId } = req.params;
    const { userId, message } = req.body;

    // Kiểm tra thông tin trước khi gửi yêu cầu
    if (!groupId || !userId || !message) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin yêu cầu tham gia." });
    }

    try {
        const requestId = await sendJoinRequest(groupId, userId, message);
        res.json({ success: true, message: "Đã gửi yêu cầu tham gia nhóm", requestId });
    } catch (error) {
        console.error("Lỗi gửi yêu cầu tham gia nhóm:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};


// Lấy danh sách yêu cầu tham gia nhóm (chỉ dành cho trưởng nhóm)
export const fetchJoinRequests = async (req, res) => {
    const { groupId } = req.params;

    try {
        const requests = await getJoinRequests(groupId);
        res.json({ success: true, requests });
    } catch (error) {
        console.error("Lỗi lấy yêu cầu tham gia nhóm:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// Xử lý yêu cầu tham gia nhóm (chấp nhận hoặc từ chối)
export const processJoinRequest = async (req, res) => {
    const { requestId } = req.params;
    const { isAccepted } = req.body;

    try {
        await handleJoinRequest(requestId, isAccepted);
        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi xử lý yêu cầu tham gia nhóm:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};



// API rời nhóm
export const leaveGroup = async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    try {
        // Xử lý việc xóa thành viên khỏi nhóm
        await removeMemberFromGroup(groupId, userId);

        // Trả về kết quả thành công
        res.json({ success: true, message: "Bạn đã rời nhóm thành công." });
    } catch (error) {
        console.error("Lỗi khi rời nhóm:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const handleCancelJoinRequest = async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
  
    try {
      const success = await cancelJoinRequest(groupId, userId);
      if (success) {
        return res.json({ success: true, message: "Đã hủy yêu cầu tham gia nhóm." });
      }
      return res.status(400).json({ success: false, message: "Không tìm thấy yêu cầu để hủy." });
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu:", error);
      res.status(500).json({ success: false, message: "Có lỗi xảy ra." });
    }
  };







//API Đăng bài lên nhóm
export const createGroupPost = async (req, res) => {
    try {
        const { group_id, user_id, content } = req.body;
        const media = req.file ? req.file.filename : null;

        const postId = await addGroupPost(group_id, user_id, content, media);
        res.status(201).json({ message: 'Đăng bài thành công!', post_id: postId });
    } catch (error) {
        console.error('Lỗi khi đăng bài:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy danh sách bài viết của nhóm
export const getGroupPosts = async (req, res) => {
    try {
      const { groupId } = req.params;
      const sql = `
        SELECT gp.*, u.username, u.avatar 
        FROM group_posts gp 
        JOIN users u ON gp.user_id = u.id 
        WHERE gp.group_id = ? 
        ORDER BY gp.created_at DESC
      `;
      const [posts] = await db.query(sql, [groupId]);
      res.status(200).json({ success: true, posts });
    } catch (error) {
      console.error("Lỗi khi lấy bài viết nhóm:", error);
      res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
  };