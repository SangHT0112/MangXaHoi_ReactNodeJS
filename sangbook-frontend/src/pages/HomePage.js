import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import SidebarRight from "../components/SidebarRight";
import PostInput from "../components/PostInput";
import PostList from "../components/PostList";
import Story from "../components/Story";
import { getPosts } from "../api/postAPI";
import { fetchStories } from "../api/storyAPI"; // Import API lấy stories

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);


   // Lấy danh sách stories
   const fetchAllStories = async () => {
    try {
      const data = await fetchStories();
      setStories((Array.isArray(data) ? data : [])); // Lọc stories trước khi setState
    } catch (error) {
      console.error("Lỗi khi lấy stories:", error);
    }
  };

  // Định nghĩa fetchPosts ở ngoài useEffect
  const fetchPosts = async () => {
    try {
      const data = await getPosts();    //Gọi API để lấy posts
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi lấy bài viết:", error);
    }
  };
  

   // Gọi API khi tải trang
   useEffect(() => {
    fetchAllStories();
    fetchPosts();
  }, []);

  // Hàm xử lý khi có bài viết mới
  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <>
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
          <Story stories={stories} setStories={setStories} />
          <PostInput onNewPost={handleNewPost} />
          <PostList posts={posts} fetchPosts={fetchPosts} />
        </div>
        <SidebarRight />
      </div>
    </>
  );
}

export default HomePage;
