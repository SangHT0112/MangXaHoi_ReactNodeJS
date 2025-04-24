import React, { useEffect, useState } from "react";
import styles from "../../styles/admin.module.css";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

dayjs.extend(relativeTime);
dayjs.locale("vi");

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [groupedComments, setGroupedComments] = useState({});

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/comments`);
      setComments(response.data);
      groupComments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bình luận:", error);
    }
  };

  const groupComments = (comments) => {
    const grouped = {};
    comments.forEach((comment) => {
      if (!grouped[comment.post_id]) {
        grouped[comment.post_id] = {
          postTitle: comment.post_title,
          postContent: comment.post_content,
          postAuthor: comment.post_author,
          postAvatar: comment.post_avatar,
          comments: [],
        };
      }
      grouped[comment.post_id].comments.push(comment);
    });
    setGroupedComments(grouped);
  };

  const deleteComment = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/comments/${id}`);
        fetchComments();
      } catch (error) {
        console.error("Lỗi khi xóa bình luận:", error);
      }
    }
  };

  return (
    <div className="listComments">
      <h2>Quản lý bình luận</h2>
      {Object.keys(groupedComments).length > 0 ? (
        Object.entries(groupedComments).map(([postId, post]) => (
          <div key={postId} className={styles.commentGroup}>
            <div className={styles.postHeader}>
              <img src={`${API_BASE_URL}/${post.postAvatar}`} alt="Post Avatar" className={styles.avatar} />
              <div>
                <h3>{post.postTitle}</h3>
                <p><strong>Đăng bởi:</strong> {post.postAuthor}</p>
                <p className={styles.postContent}>{post.postContent}</p>
              </div>
            </div>
            {post.comments.map((comment) => (
                
              <div className={styles.commentItem} key={comment.comment_id}>
                <div className={styles.commentUserInfo}>
                  <img src={`${API_BASE_URL}/${comment.comment_avatar}`} alt="User Avatar" className={styles.avatar} />
                  <p className={styles.commentUser}>{comment.comment_author}</p>
                </div>
                <p className={styles.commentText}>{comment.content}</p>
                <p className={styles.commentDate}>{dayjs(comment.created_at).fromNow()}</p>
                <button className={styles.btnDanger} onClick={() => deleteComment(comment.comment_id)}>
                  Xóa
                </button>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>Không có bình luận nào.</p>
      )}
    </div>
  );
};

export default CommentManagement;
