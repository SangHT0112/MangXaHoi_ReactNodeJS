import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function CreateGroupPostModal({ showPostModal, setShowPostModal, groupId, userId, onPostCreated }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      alert("Vui lòng nhập nội dung bài viết!");
      return;
    }

    const formData = new FormData();
    formData.append("group_id", groupId);
    formData.append("user_id", userId);
    formData.append("content", content);
    if (media) {
      formData.append("media", media);
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/groups/${groupId}/post`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) {
        alert("Đăng bài thành công!");
        setContent("");
        setMedia(null);
        setShowPostModal(false);
        onPostCreated(); // Callback để cập nhật danh sách bài viết
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      alert("Có lỗi xảy ra khi đăng bài!");
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      setMedia(file);
    } else {
      alert("Vui lòng chọn file hình ảnh hoặc video!");
    }
  };

  if (!showPostModal) return null;

  return (
    <div className="modal show" onClick={(e) => e.target.className === "modal" && setShowPostModal(false)}>
      <div className="modal-inner">
        <div className="modal-header">
          <span></span>
          <p>Đăng bài lên nhóm</p>
          <i className="fa-solid fa-xmark" onClick={() => setShowPostModal(false)}></i>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Bạn đang nghĩ gì?"
              rows="4"
              style={{ width: "100%", resize: "none", padding: "10px", fontSize: "16px" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              style={{ margin: "10px 0" }}
            />
            {media && <p>File đã chọn: {media.name}</p>}
            <div className="modal-footer">
              <button type="submit" disabled={loading}>
                {loading ? "Đang đăng..." : "Đăng bài"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupPostModal;