import React, { useEffect, useState } from "react";
import styles from "../../styles/admin.module.css";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ReactionManagement = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reactions`);
      setPosts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài đăng:", error);
    }
  };

  const deleteReaction = async (post_id, user_name) => {
    if (window.confirm(`Bạn có chắc muốn xóa reaction của ${user_name} không?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/reactions/${post_id}/${user_name}`);
        fetchPosts();
      } catch (error) {
        console.error("Lỗi khi xóa reaction:", error);
      }
    }
  };

  return (
    <div className="listPosts">
      <h2>Quản lý tương tác bài đăng</h2>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.post_id} className={styles.commentGroup}>
            <div className={styles.postHeader}>
              <img src={`${API_BASE_URL}${post.post_avatar}`} alt="Post Avatar" className={styles.avatar} />
              <div>
                <h3>{post.post_author}</h3>
                <p className={styles.postContent}>{post.content}</p>
                {post.image && <img src={`${API_BASE_URL}${post.image}`} alt="Post Image" className={styles.attachmentImg} />}
                {post.video && <video src={`${API_BASE_URL}${post.video}`} controls className={styles.attachmentImg} />}
              </div>
            </div>
            
            {post.reactions.length > 0 ? (
              post.reactions.map((reaction, index) => (
                <div className={styles.commentItem} key={index}>
                  <div className={styles.commentUserInfo}>
                    <img src={`${API_BASE_URL}${reaction.user_avatar}`} alt="User Avatar" className={styles.avatar} />
                    <p className={styles.commentUser}>{reaction.user_name}</p>
                  </div>
                  <p className={styles.commentText}>Đã {reaction.reaction}</p>
                  <button className={styles.btnDanger} onClick={() => deleteReaction(post.post_id, reaction.user_name)}>
                    Xóa
                  </button>
                </div>
              ))
            ) : (
              <p>Không có tương tác nào.</p>
            )}
          </div>
        ))
      ) : (
        <p>Không có bài đăng nào.</p>
      )}
    </div>
  );
};

export default ReactionManagement;
