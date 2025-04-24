import React, { useState } from "react";
import SuccessModal from "./SuccessModal";
import "../styles/Posts.css";
import "../styles/modal.css";
import "../styles/config.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


function PostInput({ onNewPost }) {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setVideo(null);
      setVideoPreview("");
    } else if (file.type.startsWith("video/")) {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setImage(null);
      setPreview("");
    } else {
      alert("Chỉ hỗ trợ hình ảnh và video!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user_id = user.id;

    if (!user_id) {
      alert("Vui lòng đăng nhập để đăng bài!");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }
    if (video) {
      formData.append("video", video);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();   //json gồm success và post

        setSuccessMessage(newPost.message);
        setShowSuccessModal(true);

        onNewPost(newPost.post);     // Gọi handleNewPost(newPost.post) từ HomePage.js
        setShowModal(false);
        setContent("");
        setImage(null);
        setPreview("");
        setVideo(null);
        setVideoPreview("");
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi bài:", error);
    }
  };

  return (
    <div className="post">
      <div className="post-text">
        <a href="/">
          <img src={user.avatar} alt="Avatar" />
        </a>
        <input
          type="text"
          placeholder={`${user.username} ơi, Bạn đang nghĩ gì thế?`}
          onClick={() => setShowModal(true)}
          readOnly
        />
      </div>
      <br />
      <div className="post-types">
        <div className="post-types-item">
          <i className="fa-solid fa-video" style={{ color: "#E84258" }}></i>
          <span> Video </span>
        </div>
        <div className="post-types-item">
          <i className="fa-regular fa-image" style={{ color: "rgb(69, 162, 30)" }}></i>
          <span> Hình Ảnh </span>
        </div>
        <div className="post-types-item">
          <i className="fa-regular fa-face-laugh" style={{ color: "rgb(187, 179, 21)" }}></i>
          <span> Cảm xúc/hoạt động </span>
        </div>
      </div>

      {showModal && (
        <div className={`modal ${showModal ? "show" : ""}`} onClick={(e) => e.target.className === "modal" && setShowModal(false)}>
          <div className="modal-inner">
            <div className="modal-header">
              <span></span>
              <p>Đăng bài viết</p>
              <i className="fa-solid fa-xmark" onClick={() => setShowModal(false)}></i>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="modal-info">
                  <img src={user.avatar} alt="Avatar" className="img-avt" />
                  <p>{user.username}</p>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`${user.username} ơi, Bạn đang nghĩ gì?`}
                  rows="4"
                  style={{ width: "100%", resize: "none", padding: "10px", fontSize: "16px" }}
                  required
                />
                <div className="d-flex align-items-center">
                  <div className="post-types-item mt-2">
                    <i className="fa-regular fa-image" style={{ color: "rgb(69, 162, 30)" }}></i>
                    <span>Hình Ảnh/Video:</span>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
                  </div>
                </div>
                <div className="d-flex justify-content-center mt-2">
                  {preview && <img src={preview} alt="Ảnh đã chọn" className="preview-img" />}
                  {videoPreview && (
                    <video controls className="preview-video">
                      <source src={videoPreview} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="submit">Đăng bài</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}

    </div>
  );
}

export default PostInput;
