import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/addfriendpage.css";
import FriendRequest from "../components/FriendRequest";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import SidebarRight from "../components/SidebarRight";
import { sendFriendRequest, checkFriendStatus } from "../api/friendAPI";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddFriendPage = () => {
  const user_id = JSON.parse(localStorage.getItem("user")) || {};
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({}); // Lưu trạng thái bạn bè cho từng user

  const fetchSuggestedFriends = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/friends/suggested/${user_id.id}`);
      const friends = response.data.suggestedFriends || [];
      setSuggestedFriends(friends);

      // Kiểm tra trạng thái bạn bè cho từng người dùng gợi ý
      const statusPromises = friends.map((friend) =>
        checkFriendStatus(user_id.id, friend.id)
      );
      const statuses = await Promise.all(statusPromises);
      const statusMap = friends.reduce((acc, friend, index) => {
        acc[friend.id] = statuses[index].status || "none";
        return acc;
      }, {});
      setFriendStatuses(statusMap);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gợi ý kết bạn:", error);
    }
  };

  useEffect(() => {
    fetchSuggestedFriends();
  }, []);

  const handleSendRequest = async (receiverId) => {
    try {
      const response = await sendFriendRequest(user_id.id, receiverId);
      if (response.success) {
        setFriendStatuses((prev) => ({
          ...prev,
          [receiverId]: "sent", // Trạng thái "sent" để hiển thị "Đã gửi kết bạn"
        }));
        // Không xóa người dùng khỏi danh sách gợi ý, chỉ cập nhật trạng thái nút
      }
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
          <div className="add-friend-page">
            <h2>Lời mời kết bạn</h2>
            <FriendRequest userId={user_id.id} />

            <h2>Gợi ý kết bạn</h2>
            <div className="suggested-friend-list">
              {suggestedFriends.length > 0 ? (
                suggestedFriends.map((user) => (
                  <div key={user.id} className="suggested-friend-item">
                    <img
                      src={`${API_BASE_URL}/${user.avatar}`}
                      alt="Avatar"
                      className="img-avt"
                    />
                    <span>{user.username}</span>
                    <div className="btn-profile d-flex gap-2">
                      {friendStatuses[user.id] === "none" && (
                        <button
                          className="btn-add-friend"
                          onClick={() => handleSendRequest(user.id)}
                        >
                          Thêm bạn bè
                        </button>
                      )}
                      {friendStatuses[user.id] === "sent" && (
                        <button className="btn-sent" disabled>
                          Đã gửi kết bạn
                        </button>
                      )}
                      {friendStatuses[user.id] === "pending" && (
                        <button className="btn-pending" disabled>
                          Đang chờ xác nhận
                        </button>
                      )}
                      {friendStatuses[user.id] === "accepted" && (
                        <button className="btn-friend" disabled>
                          Bạn bè
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có gợi ý kết bạn</p>
              )}
            </div>
          </div>
        </div>
        <SidebarRight />
      </div>
    </>
  );
};

export default AddFriendPage;