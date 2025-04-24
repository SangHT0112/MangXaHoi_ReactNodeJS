import React, { useState, useEffect } from "react";
import CommentSection from "./CommentSection";
import ReactionSection from "./ReactionSection";
import AutoPlayVideo from "./AutoPlayVideo";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


dayjs.extend(relativeTime);
dayjs.locale("vi");

function PostList({ posts = [], fetchPosts }) {
  const [showComments, setShowComments] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [reactionsData, setReactionsData] = useState({});
  const [showReactions, setShowReactions] = useState({});
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const reactions = {
    like: { icon: "👍", text: "Chọn", color: "#606770" },
    love: { icon: "❤️", text: "Yêu thích", color: "red" },
    haha: { icon: "😂", text: "Haha", color: "#ffcc00" },
    wow: { icon: "😲", text: "Wow", color: "#ffcc00" },
    sad: { icon: "😢", text: "Buồn", color: "#ffcc00" },
    angry: { icon: "😡", text: "Phẫn nộ", color: "orange" },
  };

  // Cập nhật userReactions khi posts thay đổi
  useEffect(() => {
    const reactions = posts.reduce((acc, post) => {
      acc[post.id] = post.user_reaction || null;
      return acc;
    }, {});
    setUserReactions(reactions);
  }, [posts]);

  // Lấy danh sách reactions cho từng bài đăng
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const reactionsResponses = await Promise.all(
          posts.map((post) =>
            fetch(`${API_BASE_URL}/api/reactions/${post.id}`)
              .then((response) => response.json())
              .then((data) => ({ postId: post.id, reactions: data }))
          )
        );

        const reactionsObj = reactionsResponses.reduce((acc, { postId, reactions }) => {
          acc[postId] = reactions;
          return acc;
        }, {});

        setReactionsData(reactionsObj);
      } catch (error) {
        console.error("Lỗi khi tải reactions:", error);
      }
    };

    fetchReactions();
  }, [posts]);

  const toggleComment = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleReaction = async (postId, reactionType = "like") => {
    try {
      const currentReaction = userReactions[postId];
      const newReaction = currentReaction === reactionType ? null : reactionType;

      setUserReactions((prev) => ({ ...prev, [postId]: newReaction }));

      await fetch(`${API_BASE_URL}/api/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, user_id: user.id, reaction: newReaction }),
      });

      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi gửi reaction:", error);
    }
  };

  const toggleReactions = (postId) => {
    setShowReactions((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="post-list">
      {posts.map((post) => {
        const userReaction = userReactions[post.id] || "normal"; // Mặc định là 'normal' nếu chưa có reaction
        const postReactions = reactionsData[post.id] || [];

        return (
          <div className="post" key={post.id}>
            <div className="post-header">
              <a href="/">
                <img src={`${API_BASE_URL}/${post.avatar}`} alt="" className="img-avt" />
              </a>
              <div className="post-info">
                <span className="post-name">
                  {post.username}{" "}
                  <i className="fa-solid fa-circle-check" style={{ color: "rgb(14, 89, 210)" }}></i>
                </span>
                <span className="post-time">{dayjs(post.created_at).fromNow()} · <i className="fa-solid fa-earth-americas"></i></span>
              </div>
              <i className="fa-solid fa-close"></i>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
              {post.image && <img src={`${API_BASE_URL}/${post.image}`} alt="Hình ảnh bài đăng" />}
              {post.video && <AutoPlayVideo src={`${API_BASE_URL}/${post.video}`} className="post-video" />}
            </div>

            <div className="post-footer">
              <div className="post-reaction-quantity" onClick={() => toggleReactions(post.id)}>
                <span>{post.like_count || 0}</span>
                <i className="fa-solid fa-thumbs-up" style={{ color: "#0866ff" }}></i>
              </div>

              {showReactions[post.id] && (
                <div className="post-reaction-list">
                  {postReactions.length > 0 ? (
                    postReactions.map((reaction, index) => {
                      const reactionInfo = reactions[reaction.reaction] || {};
                      return (
                        <div key={index} className="post-reaction-list-item">
                          <a href="/">
                            <img src={`${API_BASE_URL}/${reaction.avatar}`} alt="" className="img-avt" />
                          </a>
                          <i className="fa-solid" style={{ color: reactionInfo.color }}>
                            {reactionInfo.icon}
                          </i>
                          <span className="post-name">{reaction.username}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p>Chưa có tương tác nào</p>
                  )}
                </div>
              )}

              <div className="post-comments">
                <span>{post.comment_count || 0} <i className="fa-solid fa-comment"></i></span>
              </div>
            </div>

            <div className="post-btn">
              <ReactionSection
                postId={post.id}
                userReaction={userReactions[post.id] || null}
                onReact={handleReaction}
              />

              <div className="post-btn-item">
                <button className="btn-comment" onClick={() => toggleComment(post.id)}>
                  <i className="fa-solid fa-comment"></i> Bình luận
                </button>
              </div>
              <div className="post-btn-item">
                <button>
                  <i className="fa-solid fa-share"></i> Chia sẻ
                </button>
              </div>
            </div>

            {showComments[post.id] && <CommentSection postId={post.id} user={user} />}
          </div>
        );
      })}
    </div>
  );
}

export default PostList;
