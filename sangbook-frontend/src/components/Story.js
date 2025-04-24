import React, { useState, useEffect, useRef } from "react";
import { fetchStories, createStory,incrementViews } from "../api/storyAPI";
import "../styles/story.css";
import "../styles/config.css";
import SuccessModal from "./SuccessModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { data } from "autoprefixer";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

dayjs.extend(relativeTime);
dayjs.locale("vi")
const Story = ({ stories, setStories }) => { // Nhận stories & setStories từ props
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [fileName, setFileName] = useState(""); // Thêm state cho fileName

  const [preview, setPreview] = useState("");

  const [songList, setSongList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  const storyListRef = useRef(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [progress, setProgress] = useState(0); //thanh story chạy

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (!selectedStory) return;
  
    setProgress(0); // Reset tiến trình về 0 khi story thay đổi
    const duration = 50000; // 30 giây
    const step = 1000; // Cập nhật mỗi giây
    const increment = (100 * step) / duration; // Tính toán tỉ lệ tăng
  
    const interval = setInterval(() => {
      setProgress((prev) => (prev + increment <= 100 ? prev + increment : 100));
    }, step);
  
    const timer = setTimeout(() => {
      changeStory(1); // Chuyển story sau 30s
    }, duration);
  
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [selectedStory]);
  

  useEffect(() =>{
    fetch(`${API_BASE_URL}/api/songs`)
    .then((res) => res.json())
    .then((data) => {
      if(Array.isArray(data)){
        setSongList(data);
      }else{
        console.log("Du lieu API khong hop le");
      }
    })
    .catch((err) => console.error("Loi tai danh sach bai viet"));
  }, []) //Chỉ chạy 1 lần khi component mount

  const handleSongChange = (e) =>{
    setSelectedSong(e.target.value);
  }

  const scrollLeft = () => {
    if (storyListRef.current) {
      storyListRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (storyListRef.current) {
      storyListRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let currentIndex = 0; // Start at the first slide
    const interval = setInterval(() => {
      if (storyListRef.current && stories.length > 0) {
        // Check if currentIndex is at the end
        if (currentIndex >= stories.length) {
          currentIndex = 0; // Reset to the beginning
          storyListRef.current.scrollTo({ left: 0, behavior: "smooth" }); // Scroll to start
        } else {
          // Scroll to the next story
          storyListRef.current.scrollBy({ left: 200, behavior: "smooth" });
          currentIndex++;
        }
      }
    }, 3000); // Auto-slide interval (e.g., 5 seconds)
  
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [stories]); // Dependency array to re-trigger when stories change
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setFileName(file.name); // Cập nhật fileName
  
    if (file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setVideo(null);
    } else if (file.type.startsWith("video/")) {
      setVideo(file);
      setPreview(URL.createObjectURL(file));
      setImage(null);
    } else {
      alert("Chỉ hỗ trợ hình ảnh, video và âm thanh!");
    }
  };
  

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user_id = user.id;
    if (!user_id) {
      alert("Vui lòng đăng nhập để thêm story!");
      return;
    }
  
    const formData = new FormData();
    formData.append("user_id", user_id);
    if (image) formData.append("image", image);
    if (video) formData.append("video", video);
    if(selectedSong) formData.append("music", selectedSong);
  
    try {
      const newStory = await createStory(formData); 
      console.log("Story mới:", newStory);
  
      // Đảm bảo newStory có avatar & username từ user
      const updatedStory = {
        ...newStory,
        avatar: user.avatar, // Lấy avatar từ localStorage
        username: user.username, // Lấy username từ localStorage
      };
  
      setStories((prevStories) => [{ 
        ...newStory, 
        image: newStory.image ? `${API_BASE_URL}/${newStory.image}` : null, 
        video: newStory.video ? `${API_BASE_URL}/${newStory.video}` : null,
        avatar: newStory.avatar ? `${API_BASE_URL}/${newStory.avatar}` : "default-avatar.png",
      }, ...prevStories]);
      
      setShowModal(false);
      setImage(null);
      setVideo(null);
      setPreview("");
      const updatedStories = await fetchStories();
      setStories(updatedStories);

      setSuccessMessage(newStory.message);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Lỗi khi thêm story:", error);
    }
  };

  //Thay đổi khi nhấn pre next story
  const changeStory = async (direction) => {
    const currentIndex = stories.findIndex(story => story.id === selectedStory.id);
    const newIndex = currentIndex + direction;
  
    if (newIndex >= 0 && newIndex < stories.length) {
      const newStory = stories[newIndex];
      setSelectedStory(newStory);
  
      try {
        await fetch(`${API_BASE_URL}/api/stories/view/${newStory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        });
  
        setStories((prevStories) =>
          prevStories.map((s) =>
            s.id === newStory.id ? { ...s, views: (s.views || 0) + 1 } : s
          )
        );
  
        setSelectedStory((prev) => ({ ...prev, views: (prev.views || 0) + 1 }));
         // Cập nhật nhạc
        if (newStory.music) {
          setSelectedSong(newStory.music);
        } else {
          setSelectedSong(null);
        }
        if(newStory.music){
          const audioElement = document.getElementById("story-audio");
          if(audioElement){
            audioElement.src = `${API_BASE_URL}/${newStory.song_source}`;
            audioElement.play();
          }
        }
      } catch (error) {
        console.error("Lỗi khi tăng lượt xem:", error);
      }
    }
  };
  
  
  const handleStoryClick = async (story) => {
    setSelectedStory(story);
  
    try {
      await fetch(`${API_BASE_URL}/api/stories/view/${story.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
  
      // Cập nhật danh sách stories
      setStories((prevStories) =>
        prevStories.map((s) =>
          s.id === story.id ? { ...s, views: (s.views || 0) + 1 } : s
        )
      );
  
      // Cập nhật story đang xem
      setSelectedStory((prev) => ({ ...prev, views: (prev.views || 0) + 1 }));
    } catch (error) {
      console.error("Lỗi khi tăng lượt xem:", error);
    }
  };
  
  
  

  return (
    <div className="story-container">
      <button className="scroll-btn left" onClick={scrollLeft}>{"<"}</button>
      <div className="story-list" ref={storyListRef}>
        <div className="story-item add-story" onClick={() => setShowModal(true)}>
          <div className="add-story-icon">+</div>
          <p>Thêm story</p>
        </div>

        {stories.map((story) => (
          story ? (
            <div key={story.id} className="story-item" onClick={() => handleStoryClick(story)}>
              {story.video ? (
                <video src={`${API_BASE_URL}/${story.video}`} className="story-thumbnail" muted loop />
              ) : story.image ? (
                <img src={`${API_BASE_URL}/${story.image}`} alt={story.username} className="story-thumbnail" />
              ) : (
                <div className="story-thumbnail">No media available</div>
              )}


              
              <div className="story-info">
                <img
                  src={story.avatar?.startsWith("http") ? story.avatar : `${API_BASE_URL}/${story.avatar || "default-avatar.png"}`}
                  alt={story.username || "Unknown User"}
                  className="story-avatar"
                />
                <p>{story.username || "Unknown User"}</p>
              </div>
            </div>
          ) : null
        ))}

      </div>
      <button className="scroll-btn right" onClick={scrollRight}>{">"}</button>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={(e) => e.target.classList.contains("modal") && setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm Story</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="d-flex align-items-center mb-3">
                    <img src={user.avatar} alt="Avatar" className="rounded-circle me-2" width="40" height="40" />
                    <p className="mb-0">{user.username}</p>
                  </div>

                  <div className="mb-3 border rounded shadow p-3">
                    <label className="form-label fw-bold">Hình ảnh/Video</label>
                    <div className="input-group border-primary rounded">
                      <input
                        type="file"
                        id="fileInput"
                        className="d-none"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                      />
                      <input
                        type="text"
                        className="form-control border-secondary rounded"
                        value={fileName || "Chưa chọn file"}
                        disabled
                      />
                      <label
                        htmlFor="fileInput"
                        className="btn btn-outline-primary border rounded-pill"
                      >
                        <i className="fa-solid fa-upload me-1"></i> Chọn File
                      </label>
                    </div>
                  </div>



                  <div className="mb-3 border rounded shadow p-3">
                    <label className="form-label fw-bold">Chọn bài hát</label>
                    <select
                      className="form-select border-primary rounded"
                      onChange={handleSongChange}
                      value={selectedSong}
                    >
                      <option value="">Chọn bài hát</option>
                      {songList.map((song) => (
                        <option key={song.id} value={song.id}>
                          {song.title} - {song.artist}
                        </option>
                      ))}
                    </select>
                  </div>

                  {preview && (
                    <div className="text-center mb-3">
                      {image ? (
                        <img src={preview} alt="Preview" className="img-fluid rounded" />
                      ) : (
                        <video src={preview} controls className="img-fluid rounded"></video>
                      )}
                    </div>
                  )}

                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">Thêm Story</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


      {selectedStory && (
        <div className="story-modal">
          <button className="story-close" onClick={() => setSelectedStory(null)}>✖</button>
          <button className="story-nav left" onClick={() => changeStory(-1)}>{"<"}</button>
          
          <div className="story-content" onClick={() => setSelectedStory(null)}>

            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <div className=" story-content-header d-flex w-100"> 
                <div className="d-flex mt-3">
                  <img src={`${API_BASE_URL}/${selectedStory.avatar}`} className="img-avt" alt={selectedStory.username} />
                  <div>
                    <p>{selectedStory.username}</p>
                    <span className="post-time">Đã đăng {dayjs(selectedStory.created_at).fromNow()}</span>
                  </div>
                </div>
            </div>
           

            {/* Hiển thị hình ảnh hoặc video của story */}
            {selectedStory.video ? (
              <video src={`${API_BASE_URL}/${selectedStory.video}`} controls autoPlay className="story-media" />
            ) : (
              <img src={`${API_BASE_URL}/${selectedStory.image}`} alt="Story" className="story-media" />
            )}

            {/* Hiển thị nhạc nếu có */}
            {selectedStory.music && (
              <>
                <audio id="story-audio" autoPlay className="story-music d-none" controls>
                  <source src={`${API_BASE_URL}/${selectedStory.song_source}`} type="audio/mp3" />
                  Trình duyệt của bạn không hỗ trợ audio.
                </audio>
               <div className="story-song-info d-flex gap-2">
                {selectedStory.song_image && selectedStory.music? (
                    <img src={`${API_BASE_URL}/${selectedStory.song_image}`} alt="Song cover" className="song-cover" />
                  ): <img src='normal.jpg' alt="Song cover" className="song-cover" />}
                <div>
                  <p className="song-titled"><strong>{selectedStory.song_title}</strong></p>
                  <p className="song-artisted">Nghệ sĩ: {selectedStory.song_artist}</p>
                </div>             
              </div>
              </>

            )}


             

            {/* Hiển thị lượt xem của story */}
            <div className="story-interact">
              <p className="story-views">Lượt xem: {selectedStory.views || 0}</p>
            </div>

            
          </div>

          <button className="story-nav right" onClick={() => changeStory(1)}>{">"}</button>
        </div>
      )}


      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}


    </div>
  );
};

export default Story;
