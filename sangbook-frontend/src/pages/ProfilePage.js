import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header/Header";
import PostList from "../components/PostList";
import { getPostsByUser } from "../api/postAPI";
import { getUserById } from "../api/UserAPI";
import { getAcceptedFriends } from "../api/friendAPI";
import { sendFriendRequest, checkFriendStatus } from "../api/friendAPI";
import "../styles/profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendStatus, setFriendStatus] = useState("none");
  const [selectedUser, setSelectedUser] = useState(null); // Người dùng được chọn
  const [isChatOpen, setIsChatOpen] = useState(false); // Đặt useState ở đây
  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {}; // Lấy ID user hiện tại từ localStorage
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
      const fetchFriends = async () => {
        if (id) {
          const friendList = await getAcceptedFriends(id);
          setFriends(friendList);
        }
      };
      fetchFriends();
  }, [id]);


  // Hàm mở chat
  const handleOpenChat = () => {
    setSelectedUser(user); // Chọn người dùng cần nhắn tin
    setIsChatOpen(true); // Mở giao diện chat
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserById(id);
        setUser(userData.user);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const userPosts = await getPostsByUser(id);
        if (userPosts?.success) {
          setPosts(userPosts.posts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Lỗi lấy bài viết của người dùng:", error);
        setPosts([]);
      }
    };

    const fetchFriendStatus = async () => {
      try {
        const response = await checkFriendStatus(loggedInUser.id, id);
        if (response.success) {
          setFriendStatus(response.status);
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái bạn bè:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/messages/${loggedInUser.id}/${id}`);  // Sử dụng loggedInUser.id thay vì user_id
        setMessages(response.data.messages); // Cập nhật danh sách tin nhắn
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
      }
    };


    fetchMessages(); 
    fetchUserData();
    fetchUserPosts();
    fetchFriendStatus();
  }, [id]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMessage = {
      send_id: loggedInUser.id, // Sử dụng loggedInUser.id thay vì user_id.id
      receive_id: id,
      content: message,
    };
    try {
      await axios.post(`${API_BASE_URL}/api/messages/send`, newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]); // Thêm tin nhắn vào danh sách
      setMessage(''); // Reset input message
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };


  const handleSendRequest = async () => {
    try {
      const response = await sendFriendRequest(loggedInUser.id, id);
      if (response.success) {
        setFriendStatus("pending");
      }
    } catch (error) {
      console.error("Lỗi gửi kết bạn:", error);
    }
  };

  if (!user) return <p>Đang tải...</p>;

  return (
    <>
      <Header user={loggedInUser} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} selectedUser={selectedUser} />
      <div className="cover-photo"></div>
      <div className="profile-info">
        <img className="profile-picture" src={`${API_BASE_URL}/${user.avatar}`} alt="Ảnh đại diện" />
        <div className="user-info">
          <h1>{user.username}</h1>
          <p>419 người bạn - 1 bạn chung</p>
          <div className="btn-profile d-flex gap-2">
            {friendStatus === "none" && (
              <button className="btn-add-friend" onClick={handleSendRequest}>
                Thêm bạn bè
              </button>
            )}
            {friendStatus === "pending" && <button className="btn-pending">Đang chờ xác nhận</button>}
            {friendStatus === "accepted" && <button className="btn-friend">Bạn bè</button>}
            <button className="message-btn" onClick={handleOpenChat}>Nhắn tin</button> {/* Mở chat */}
          </div>
        </div>
      </div>

      <nav className="profile-nav">
        <a href="#" className="active">Bài viết</a>
        <a href="#">Giới thiệu</a>
        <a href="#">Bạn bè</a>
        <a href="#">Ảnh</a>
        <a href="#">Video</a>
      </nav>

      <div className="main">
        <div className="mt-2">
          <h3>Bạn bè ({friends.length})</h3>
          <div className="profile-list-friend">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div key={friend.id} className="profile-list-friend-item" onClick={() => navigate(`/profile/${friend.id}`)}>
                  <img src={`${API_BASE_URL}/${friend.avatar}`} alt={friend.username} />
                  <p>{friend.username}</p>
                </div>
              ))
            ) : (
              <p>Chưa có bạn bè nào</p>
            )}
          </div>
        </div>
      

        <div className="content">
          <PostList posts={posts} />
        </div>
      </div>

      {/* Giao diện Chat */}
      {isChatOpen && selectedUser && (
        <div className="message-chat">
          <div className="message-chat-header p-2">
            <div className="message-chat-info-recieve">
              <img src={`${API_BASE_URL}/${selectedUser.avatar}`} alt="Avatar" className="img-avt" />
              <span className="chat-header-recieve-name">{selectedUser.username}</span>
            </div>
            <div className="d-flex gap-3">
              <div className="icon-call">
                <i className="fa-solid fa-video"></i>
              </div>
              <div className="icon-close" onClick={() => setIsChatOpen(false)}>X</div>
            </div>
          </div>

          <div id="message-chat-main" className="message-chat-main">
            {/* Hiển thị tin nhắn ở đây */}
          </div>

          <div className="message-chat-footer">
                <input
                  type="text"
                  placeholder="Gửi tin nhắn"
                  className="input-message-send"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="btn-message-send" onClick={sendMessage}>Gửi</button>
            </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;
