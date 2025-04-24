import React, { useState, useEffect,useRef  } from "react";
import { Link } from "react-router-dom";
import { getAcceptedFriends } from "../api/friendAPI";
import SuccessModal from "./SuccessModal";
import io from "socket.io-client";
import "../styles/list_friend.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const socket = io(`${API_BASE_URL}`);


function scrollToBottom() {
  requestAnimationFrame(() => {
      let chatBox = document.getElementById("message-chat-main");
      if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight;
      }
  });
}

function SidebarRight() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [friends, setFriends] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const user_id = user.id;

  const openGroupChat = (group) => {
    setSelectedGroup(group);
    setIsGroupChatOpen(true);
  };
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  useEffect(() => {
    const fetchFriends = async () => {
      if (user.id) {
        const friendList = await getAcceptedFriends(user.id);
        setFriends(friendList);
      }
    };

    const fetchGroups = async () => {
      if (user.id) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/group-chats/user/${user.id}`);
          const data = await response.json();
          setGroups(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách nhóm:", error);
        }
      }
    };

    fetchFriends();
    fetchGroups();
  }, [user.id]);

  


  const onClose = () => {
    setShowModal(false);
    setGroupName("");
    setSelectedFriends([]);
    setAvatar(null);
    setPreview(null);
  };

  const handleFriendSelect = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file)); // Hiển thị ảnh trước khi upload
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedFriends.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("created_by", user_id);
      if (avatar) formData.append("avatar", avatar);
      selectedFriends.forEach((friend) => formData.append("members[]", friend));

      const response = await fetch(`${API_BASE_URL}/api/group-chats/create`, {
        method: "POST",
        body: formData, // Dùng FormData để gửi file
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setShowSuccessModal(true);

        
        onClose(); // Đóng modal sau khi tạo nhóm thành công


      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      alert("Lỗi khi tạo nhóm!");
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      socket.emit("joinGroup", selectedGroup.id);
      (async () => {
        await fetchMessages(selectedGroup.id);
      })();
    }
  }, [selectedGroup]);
  

  useEffect(() => {
    if (!selectedGroup) return; // Không làm gì nếu chưa chọn nhóm
  
    socket.on("receiveGroupMessage", (message) => {
      if (message.group_id === selectedGroup.id) {
        console.log(message);
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });
  
    return () => {
      socket.off("receiveGroupMessage");
    };
  }, [selectedGroup]); // Chạy lại khi `selectedGroup` thay đổi
  
  

  const fetchMessages = async (groupId) => {
    try {
      scrollToBottom();
      const response = await fetch(`${API_BASE_URL}/api/group-chats/${groupId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn nhóm:", error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    const messageData = {
      username: user.username,
      avatar: user.avatar,
      group_id: selectedGroup.id,
      sender_id: user_id,
      message: newMessage,
    };
    socket.emit("sendGroupMessage", messageData);
    setNewMessage("");
  };


  const handleLeaveGroup = async (groupId) => {
    const confirmLeave = window.confirm("Bạn có chắc muốn rời nhóm này?");
    if (!confirmLeave) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/group-chats/${groupId}/user/${user_id}`, {
        method: "DELETE",
      });
  
      const data = await response.json();
      if (response.ok) {
        setGroups(groups.filter(group => group.id !== groupId)); // Cập nhật danh sách nhóm
        setIsGroupChatOpen(false); // Đóng khung chat nếu đang mở nhóm này
        alert("Bạn đã rời nhóm thành công!");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Lỗi khi rời nhóm:", error);
      alert("Lỗi khi rời nhóm!");
    }
  };
  

  return (
    <div className="SidebarRight">

      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}

      <div className="list-friend">
        <div className="list-friend-header mb-2 d-flex justify-content-between align-items-center">
          <span>Bạn Bè</span>
          <div>
            <i className="fa-solid fa-magnifying-glass"></i>
            <i className="fa-solid fa-ellipsis"></i>
          </div>
        </div>

        <div className="list-friend-content">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <Link
                to={`/profile/${friend.id}`}
                className="friend-show-profile d-flex p-2 gap-2 mb-2"
                key={friend.id}
              >
                <img
                  src={friend.avatar ? `${API_BASE_URL}/${friend.avatar}` : "/default-avatar.jpg"}
                  alt="Avatar"
                  className="img-avt"
                />
                <span className="post-name">{friend.username}</span>
              </Link>
            ))
          ) : (
            <p>Không có bạn bè nào</p>
          )}
        </div>

        <div className="list-friend-footer">
          <span>Nhóm chat</span>
          <div>
            <button onClick={() => setShowModal(true)}>Tạo nhóm chat</button>
          </div>
        </div>
        <div className="chat-list">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group.id}
                className="list-friend-content-item"
                onClick={() => openGroupChat(group)}
              >
                <img src={ group.avatar ? `${API_BASE_URL}/${group.avatar}` : '/group.png'}  alt="" className="img-avt" />
                <span className="post-name">{group.name}</span>
              </div>
            ))
          ) : (
            <p>Không có nhóm nào</p>
          )}
        </div>

      </div>
      {isGroupChatOpen && selectedGroup && (
        <div className="message-chat">
          <div className="message-chat-header p-2">
            <div>
               <img src={selectedGroup.avatar ? `${API_BASE_URL}/${selectedGroup.avatar}` : "/group.png"} alt="Avatar" className="img-avt" />
               <i class="fa-regular fa-square-plus"></i>
            </div>
            <span>{selectedGroup.name}</span>
            <div className="">
              <i className="fa-solid fa-right-from-bracket" onClick={() => handleLeaveGroup(selectedGroup.id)}></i>
              <button onClick={() => setIsGroupChatOpen(false)}>X</button>
            </div>
          </div>

          <div className="message-chat-main" id="message-chat-main">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message-chat-item ${msg.sender_id === user_id ? "message-chat-send" : "message-chat-recieve"}`}
              >
                <div className={`d-flex justify-content-${msg.sender_id === user_id ? "end" : "start"}`}>
                  <img 
                    src={msg.avatar?.startsWith("http") ? msg.avatar : `${API_BASE_URL}/${msg.avatar}`} 
                    alt="Avatar" 
                    className="img-avt" 
                  />
                  <div className="label-chat">
                    <p className={`chat-${msg.sender_id === user_id ? "send" : "recieve"}-name`}>
                      {msg.sender_id === user_id ? "Bạn" : msg.username || "Ẩn danh"}
                    </p>
                    <p className={`chat-${msg.sender_id === user_id ? "send" : "recieve"}-content`}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Thêm dòng này */}
          </div>


          <div className="message-chat-footer">
            <input
              type="text"
              placeholder="Gửi tin nhắn"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Gửi</button>
          </div>
        </div>
      )}

      {/* Modal Tạo Nhóm */}
      {showModal && (
        <div className="modal show">
          <div className="modal-inner">
            <div className="modal-header">
              <p>Tạo Nhóm Chat</p>
              <i className="fa-solid fa-xmark" onClick={onClose}></i>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Nhập tên nhóm"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              {/* Upload avatar */}
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview && <img src={preview} alt="Avatar nhóm" className="preview-avatar" />}

              <div className="friend-list">
                <hr />
                <p>Danh sách bạn bè:</p>
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <label key={friend.id} className="friend-item d-flex gap-2 m-1">
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.id)}
                        onChange={() => handleFriendSelect(friend.id)}
                      />
                      <img
                        src={friend.avatar ? `${API_BASE_URL}/${friend.avatar}` : "/group.png"}
                        alt="Avatar"
                        className="img-avt"
                      />
                      <span>{friend.username}</span>
                    </label>
                  ))
                ) : (
                  <p>Không có bạn bè để thêm vào nhóm</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={onClose}>Đóng</button>
              <button onClick={handleCreateGroup} disabled={!groupName || selectedFriends.length === 0}>
                Tạo Nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SidebarRight;
