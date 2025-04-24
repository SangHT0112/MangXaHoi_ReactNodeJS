import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import SidebarRight from "../components/SidebarRight";
import PostList from "../components/PostList";
import { getPosts } from "../api/postAPI";

function VideoPage() {
  const [posts, setPosts] = useState([]);

  // Định nghĩa fetchPosts bên ngoài useEffect
  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      // Lọc bài viết có video (video không được null hoặc rỗng)
      const videoPosts = Array.isArray(data) ? data.filter(post => post.video) : [];
      setPosts(videoPosts);
    } catch (error) {
      console.error("Lỗi khi lấy bài viết:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
          <PostList posts={posts} fetchPosts={fetchPosts} />  {/* Hiển thị bài viết có video */}
        </div>
        <SidebarRight />
      </div>
    </>
  );
}

export default VideoPage;
