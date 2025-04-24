import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/addfriendpage.css";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import SidebarRight from "../components/SidebarRight";
import { getAcceptedFriends } from "../api/friendAPI";
import SuccessModal from "../components/SuccessModal";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GroupPage = () => {
  
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [friends, setFriends] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [groups, setGroups] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  useEffect(() => {
    const fetchFriends = async () => {
      if (user.id) {
        const friendList = await getAcceptedFriends(user.id);
        setFriends(friendList);
      }
    };
    fetchFriends();
  }, [user.id]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (user.id) {
        try {
          console.log("📩 Gọi API lấy danh sách nhóm:", `${API_BASE_URL}/api/groups/user/${user.id}`);
          const response = await axios.get(`${API_BASE_URL}/api/groups/user/${user.id}`);
          console.log("✅ Kết quả từ API:    ", response.data);
          setGroups(response.data);
        } catch (error) {
          console.error("❌ Lỗi khi lấy danh sách nhóm:", error);
        }
      }
    };
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
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedFriends.length === 0) return;
    try {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("created_by", user.id);
      if (avatar) formData.append("avatar", avatar);
      selectedFriends.forEach((friend) => formData.append("members[]", friend));
  
      const response = await axios.post(`${API_BASE_URL}/api/groups/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data.success);
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000); // Tự động tắt modal sau 3 giây
        const updatedGroups = await axios.get(`${API_BASE_URL}/api/groups/user/${user.id}`);
        setGroups(updatedGroups.data);
        setTimeout(() => onClose(), 0); // Đóng modal sau khi alert xong
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      alert("Lỗi khi tạo nhóm!");
    }
  };
  
  

  return (
    <>
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
          <h1>Quản lý nhóm</h1>
          <button onClick={() => setShowModal(true)}>Tạo nhóm mới</button>

          <div className="group">
            <div className="d-flex justify-content-center-items-center mb-3">
              <h2>Danh sách nhóm</h2>
            </div>

            <div className="list-group">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <Link to={`/groups/${group.id}`} key={group.id} className="list-group-item d-flex align-items-center w-100">
                    <img src={`${API_BASE_URL}/${group.avatar}`} alt="Avatar nhóm" className="rounded-circle me-3" width="50" height="50" />
                    <h5 className="mb-0">{group.name}</h5>
                  </Link>
                ))
              ) : (
                <p className="text-muted">Bạn chưa tham gia nhóm nào.</p>
              )}
            </div>

          </div>

          {showModal && (
            <div className="modal show">
              <div className="modal-inner">
                <div className="modal-header">
                  <p>Tạo Nhóm</p>
                  <i className="fa-solid fa-xmark" onClick={onClose}></i>
                </div>
                <div className="modal-content">
                  <input type="text" placeholder="Nhập tên nhóm" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  
                  {preview && <img src={preview} alt="Avatar nhóm" className="preview-avatar" />}

                  <div className="friend-list">
                    <hr />
                    <p>Danh sách bạn bè:</p>
                    {friends.length > 0 ? (
                      friends.map((friend) => (
                        <label key={friend.id} className="friend-item d-flex gap-2 m-1">
                          <input type="checkbox" checked={selectedFriends.includes(friend.id)} onChange={() => handleFriendSelect(friend.id)} />
                          <img src={friend.avatar ? `${API_BASE_URL}/${friend.avatar}` : "/default-avatar.jpg"} alt="Avatar" className="img-avt" />
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
        <SidebarRight />
      </div>

      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}

    </>
  );
};

export default GroupPage;
