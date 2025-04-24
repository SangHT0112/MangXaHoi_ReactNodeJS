import React, { useState } from "react";
import "../styles/list_reaction_posts.css"; // Import file CSS

const reactions = {
  like: { icon: "👍", text: "Chọn", color: "#606770" },
  love: { icon: "❤️", text: "Yêu thích", color: "red" },
  haha: { icon: "😂", text: "Haha", color: "#ffcc00" },
  wow: { icon: "😲", text: "Wow", color: "#ffcc00" },
  sad: { icon: "😢", text: "Buồn", color: "#ffcc00" },
  angry: { icon: "😡", text: "Phẫn nộ", color: "orange" },
};

function ReactionSection({ postId, userReaction, onReact }) {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="post-btn-item"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)} // Ẩn reactions ngay lập tức khi không rê chuột
    >
      {showReactions && (
        <div
          className="post-reactions-like"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)} // Ẩn reactions ngay khi không rê chuột vào
        >
          {/* Vùng đệm giữ menu không bị mất khi rê chuột từ trên xuống */}
          <div className="reaction-buffer"></div>

          {Object.keys(reactions).map((key) => (
            <span
              key={key}
              className="reaction-icon"
              style={{ color: reactions[key].color }}
              onClick={() => onReact(postId, key)}
            >
              {reactions[key].icon}
            </span>
          ))}
        </div>
      )}

      <button
        className="btn-like"
        onClick={() => onReact(postId, userReaction === "like" ? null : "like")}
      >
        <span
          style={{
            color: userReaction ? reactions[userReaction]?.color : reactions["like"]?.color, // Đổi màu theo cảm xúc đã chọn
            transition: "color 0.3s", // Thêm hiệu ứng chuyển màu mượt mà
          }}
        >
          {userReaction ? reactions[userReaction]?.icon : reactions["like"]?.icon}
        </span>

        <span
          style={{
            color: userReaction ? reactions[userReaction]?.color : reactions["like"]?.color, // Đổi màu theo cảm xúc đã chọn
            transition: "color 0.3s", // Thêm hiệu ứng chuyển màu mượt mà
          }}
        >
          {userReaction ? reactions[userReaction]?.text : "Thích"}
        </span>
      </button>
    </div>
  );
}

export default ReactionSection;
