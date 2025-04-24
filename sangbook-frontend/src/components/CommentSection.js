import React, {useState, useEffect} from "react";
import { getComments, addComment } from "../api/commentAPI";
import "../styles/list_comments.css";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // Plugin để hiển thị "vừa đăng", "2 giờ trước"
import "dayjs/locale/vi"; // Import ngôn ngữ tiếng Việt
dayjs.extend(relativeTime);
dayjs.locale("vi"); // Đặt ngôn ngữ là tiếng Việt

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const CommentSection  = ({postId, user}) =>{
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    
    useEffect(() => {
        fetchComments();
    }, [postId]); // Tự động load lại nếu postId thay đổi
    

    const fetchComments = async () =>{
        const data = await getComments(postId);     //commentAPI.js
        setComments(data);
    }

    const handleAddComment = async () => {
        if (newComment.trim() === "") return;
    
        const res = await addComment(user.id, postId, newComment);
        if (res.commentId) {
            // Cập nhật state ngay lập tức thay vì gọi fetchComments()
            setComments(prevComments => [
                { id: res.commentId, 
                    username: user.username, 
                    avatar: user.avatar, 
                    content: newComment,
                    created_at: new Date().toISOString() // Thời gian hiện tại
                 },
                ...prevComments
            ]);
        }
        setNewComment("");
    };
    

    return (
        <div className="comment-section">
            <div className="comment-input">
            <input
                type="text"
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Gửi</button>
            </div>
    
            <div className="post-comments">
            {comments.length > 0 ? (
                comments.map((comment, index) => (
                    <div key={comment.id || index} className="comment-item d-flex mt-3">
                        <img src={comment.avatar.startsWith("http") ? comment.avatar : `${API_BASE_URL}/${comment.avatar}`}  //Xử lý lỗi bị lặp http://
                        alt="avatar" className="img-avt" />
                        <div>
                            <div className="comment-content">
                                <strong>{comment.username}</strong>  <br></br>
                                <span>{comment.content}</span>
                                <div className="comment-time"> {dayjs(comment.created_at).fromNow()}</div>  
                            </div>
                            
                        </div>
                    </div>
                ))
            ) : (
                <p>Chưa có bình luận nào</p>
            )}

            </div>
        </div>
        );
};

export default CommentSection;

