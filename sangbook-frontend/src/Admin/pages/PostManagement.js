import React, { useEffect, useState } from "react";
import styles from "../../styles/admin.module.css"; 
import axios from "axios";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

dayjs.extend(relativeTime);
dayjs.locale("vi");


const PostManagement = () => {
  
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" (mới nhất) | "asc" (cũ nhất)
  const [sortBy, setSortBy] = useState("date"); // "date" | "email"
  const [filter, setFilter] = useState("all"); // "all" | "image" | "video"

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Lấy danh sách bài viết
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/posts?user_id=${user.id}`);
      setPosts(response.data);
      setFilteredPosts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy bài viết:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Xóa bài viết
  const deletePost = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/posts/${id}?user_id=${user.id}`);

        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
        setFilteredPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
      }
    }
  };

  // ✅ Hàm sắp xếp bài viết
  const handleSort = (type) => {
    let newSortOrder = sortOrder;
    
    if (sortBy === type) {
      // Nếu nhấn cùng loại sắp xếp thì đảo ngược
      newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    } else {
      // Nếu chọn loại sắp xếp mới, đặt mặc định là "desc"
      setSortBy(type);
      newSortOrder = "desc";
    }
    
    setSortOrder(newSortOrder);

    const sortedPosts = [...filteredPosts].sort((a, b) => {
      if (type === "date") {
        return newSortOrder === "desc" ? b.id - a.id : a.id - b.id;
      } else if (type === "email") {
        return newSortOrder === "desc" ? b.email.localeCompare(a.email) : a.email.localeCompare(b.email);
      }
      return 0;
    });

    setFilteredPosts(sortedPosts);
  };

  // ✅ Hàm lọc bài viết
  const handleFilter = (type) => {
    setFilter(type);
    
    if (type === "image") {
      setFilteredPosts(posts.filter((post) => post.image));
    } else if (type === "video") {
      setFilteredPosts(posts.filter((post) => post.video));
    } else {
      setFilteredPosts(posts);
    }
  };

  return (
    <div className="">
      {/* Bộ lọc & sắp xếp */}
      <div className="mb-3 d-flex gap-2 "> 
        <button onClick={() => handleSort("date")}>
          Sắp xếp theo ngày {sortBy === "date" && (sortOrder === "desc" ? "⬇️" : "⬆️")}
        </button>  
        <button onClick={() => handleSort("email")}>
          Sắp xếp theo người đăng {sortBy === "email" && (sortOrder === "desc" ? "⬇️" : "⬆️")}
        </button>  
        <button onClick={() => handleFilter("image")}>Danh sách đăng ảnh</button>
        <button onClick={() => handleFilter("video")}>Danh sách đăng video</button>
        <button onClick={() => handleFilter("all")}>Tất cả</button>
      </div>

      {/* Hiển thị danh sách bài viết */}
      <div className={styles.contentColName}>
        <p className={styles.columnEmail}>Email</p>
        <p className={styles.columnAvatar}>Avatar</p>
        <p className={styles.columnContent}>Nội dung</p>
        <p className={styles.columnAttachment}>Đính kèm</p>
        <p className={styles.columnAttachment}>Ngày đăng</p>
        <p className={styles.columnDelete}>Xóa</p>
      </div>

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <div className={styles.contentItem} key={post.id}>
            <p className={styles.columnEmail}>{post.email}</p>
            <div className={styles.columnAvatar}>
              <img src={`${API_BASE_URL}/${post.avatar}`} alt="Avatar" className={styles.imgAvt} />
            </div>
            <p className={styles.columnContent}>{post.content}</p>
            <div className={styles.columnAttachment}>
              {post.image ? (
                <img src={`${API_BASE_URL}/${post.image}`} alt="Hình ảnh" className={styles.attachmentImg} />
              ) : post.video ? (
                <video width="100" height="100" controls>
                  <source src={`${API_BASE_URL}/${post.video}`} type="video/mp4" />
                  Trình duyệt không hỗ trợ video.
                </video>
              ) : (
                <span>Không có</span>
              )}
            </div>

            <p className={styles.columnDate}>{dayjs(post.created_at).fromNow()}</p>

            <div className={styles.columnDelete}>
              <button className={styles.btnDanger} onClick={() => deletePost(post.id)}>
                Xóa Bài Đăng
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Không có bài viết nào.</p>
      )}
    </div>
  );
};

export default PostManagement;
