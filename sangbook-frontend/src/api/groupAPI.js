import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const getGroupById = async (groupId) => {
    const response = await axios.get(`${API_BASE_URL}/api/groups/${groupId}`);
    return response.data;
};

export const getMember = async (groupId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/members`);
        return response.data; // Giả sử API trả về danh sách thành viên
    } catch (error) {
        console.error("Lỗi lấy danh sách thành viên:", error);
        return { success: false, message: "Lỗi lấy danh sách thành viên" };
    }
};



export const joinGroup = async (userId, groupId) => {
    await axios.post(`${API_BASE_URL}/api/groups/${groupId}/join`, { userId });
};

export const leaveGroup = async (userId, groupId) => {
    await axios.post(`${API_BASE_URL}/api/groups/${groupId}/leave`, { userId });
};

export const checkMembership = async (userId, groupId) => {
    const response = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/check-membership/${userId}`);
    return response.data;
};




export const requestJoinGroup = async (groupId, userId, message) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/groups/${groupId}/join-request`, {
            userId,
            message
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi gửi yêu cầu tham gia nhóm:", error);
        return { success: false };
    }
};


// Lấy danh sách yêu cầu tham gia nhóm (chỉ dành cho trưởng nhóm)
export const getJoinRequests = async (groupId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/join-requests`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách yêu cầu tham gia nhóm:", error);
      return { success: false, requests: [] };
    }
  };
  
  // Chấp nhận hoặc từ chối yêu cầu tham gia nhóm
  export const handleJoinRequest = async (requestId, isAccepted) => {
    try {
        console.log('requestId:', requestId);  // Kiểm tra giá trị của requestId
        const response = await axios.post(`${API_BASE_URL}/api/groups/join-requests/${requestId}/handle`, { isAccepted });
        return response.data;
    } catch (error) {
        console.error("Lỗi xử lý yêu cầu tham gia nhóm:", error);
        return { success: false };
    }
};



export const getPostsByGroup = async (groupId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/posts`);
        return response.data; // { success: true, posts: [...] }
    } catch (error) {
        console.error("Lỗi khi lấy bài viết nhóm:", error);
        throw error;
    }
};


export const cancelJoinRequest = async (groupId, userId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/groups/${groupId}/cancel-request`, { userId });
        return response.data;
    } catch (error) {
        console.error("Lỗi hủy yêu cầu tham gia:", error);
        return { success: false, message: "Có lỗi xảy ra khi hủy yêu cầu" };
    }
};
