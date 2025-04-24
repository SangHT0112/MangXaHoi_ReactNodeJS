import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const sendFriendRequest = async (send_id, receive_id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/friends/send-request`, { send_id, receive_id });
    return response.data;
  } catch (error) {
    console.error("Lỗi gửi kết bạn:", error);
    return { success: false };
  }
};

export const checkFriendStatus = async (user1, user2) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/friends/check-status/${user1}/${user2}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái bạn bè:", error);
    return { success: false };
  }
};


export const getAcceptedFriends = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/friends/accepted/${userId}`);
        return response.data.friends;
    } catch (error) {
        console.error("Lỗi lấy danh sách bạn bè:", error);
        return [];
    }
};

export const getAcceptedFriend2 = async (userId) => {
  const respone = await axios.get(`${API_BASE_URL}/api/friends/accepted/${userId}`);
  return respone.data.friends;
}
