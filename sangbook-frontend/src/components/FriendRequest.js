import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FriendRequest = ({ userId }) => {
  const [friendRequests, setFriendRequests] = useState([]);

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/friends/friend-requests/${userId}`);
      setFriendRequests(response.data.friendRequests || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lời mời kết bạn:", error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/friends/accept`, { request_id: requestId });
      setFriendRequests(friendRequests.filter((req) => req.request_id !== requestId));
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/friends/decline`, { request_id: requestId });
      setFriendRequests(friendRequests.filter((req) => req.request_id !== requestId));
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời:", error);
    }
  };

  return (
    <>
      {friendRequests.length > 0 ? (
        friendRequests.map((request) => (
          <div key={request.id} className="friend-request-item">
            <img src={`${API_BASE_URL}/${request.avatar}`} className="img-avt" alt="Avatar" />
            <span>{request.username}</span>
            <div className="d-flex gap-2">
              <button className="btn-accept-friend" onClick={() => acceptFriendRequest(request.request_id)}>
                Chấp nhận
              </button>
              <button className="btn-decline-friend" onClick={() => declineFriendRequest(request.request_id)}>
                Hủy
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Không có lời mời kết bạn</p>
      )}
    </>
  );
};

export default FriendRequest;
