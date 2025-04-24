import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Thêm useLocation
import axios from "axios";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import SidebarRight from "../components/SidebarRight";
import "../styles/music.css";
import "../styles/modal.css";
import MusicPlayer from "../components/Music/MusicPlayer";
import SongList from "../components/Music/SongList";
import SuccessModal from "../components/SuccessModal";
import LyricsComponent from "../components/Music/Lyrics"; // Import LyricsComponent

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function MusicPage() {
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [source, setSource] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lyric, setLyric] = useState("");
  const [currentTime, setCurrentTime] = useState(0); // Thêm state để lưu currentTime

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const location = useLocation(); // Thêm useLocation
  const isMusicPage = location.pathname === "/music"; // Kiểm tra đường dẫn
  const [searchValue, setSearchValue] = useState("vietnam");
  const [isThemeSelected, setIsThemeSelected] = useState(false);

  const [newMusic, SetNewMusic] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/songs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlaylist(
            data.map((song) => ({
              id: song.id,
              title: song.title,
              artist: song.artist,
              image: song.image,
              src: song.source,
            }))
          );
        } else {
          console.error("Dữ liệu API không hợp lệ:", data);
        }
      })
      .catch((err) => console.error("Lỗi tải danh sách bài hát:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source) {
      alert("Vui lòng chọn một bài hát MP3!");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("song", source);
    if (image) formData.append("image", image);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/songs`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        const newSong = response.data;
        setSuccessMessage("Bài hát đã được đăng!");
        setShowSuccessModal(true);
        setPlaylist((prev) => [...prev,
          {
            id:newSong.id,
            title:newSong.title,
            artist:newSong.artist,
            image:newSong.image,
            source:newSong.source
          }
        ]);
        setShowModal(false);
        setTitle("");
        setArtist("");
        setSource(null);
        setImage(null);
        setPreview(null);
      } else {
        console.error("Lỗi khi đăng bài hát:", response.statusText);
      }
    } catch (err) {
      console.error("Lỗi gửi yêu cầu:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
        setImage(file);
      } else if (file.type === "audio/mpeg") {
        setSource(file);
      } else {
        alert("Định dạng file không hợp lệ! Chỉ chấp nhận MP3 hoặc hình ảnh.");
      }
    }
  };

  return (
    <>
      <Header />
        <div className={`main ${isMusicPage ? "music-mode" : ""}`}>
        <Sidebar />
        <div className="content content-music">
          <div className="music-header">
            <h2 className="music-header-title">Trang nghe nhạc</h2>
            <div className="music-header-option d-flex gap-4">
              <div>
               <button onClick={() => setShowModal(true)} style={{backgroundColor: "#9B4DE0"}}>Đăng bài hát</button>
              </div>
              <div className="d-flex">
                <input type="text"
                placeholder="Nhập chủ đề video..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="mt-2"
                ></input>
                <button onClick={() =>setIsThemeSelected(true)} style={{backgroundColor: "#9B4DE0"}}>Chọn chủ đề</button>
            </div>
          </div>
          </div>
          
          {/* Hiển thị lyrics tại đây */}
          <LyricsComponent lrcText={lyric} currentTime={currentTime} searchValue={searchValue}  />
          <SongList playlist={playlist} likedSongs={likedSongs} setCurrentSong={setCurrentSong} />
          

          {currentSong && (
            <MusicPlayer
              song={currentSong}
              playlist={playlist}
              setCurrentSong={setCurrentSong}
              setLyric={setLyric}
              setCurrentTime={setCurrentTime} // Truyền callback để nhận currentTime
            />
          )}

          {showModal && (
            <div className="modal show">
              <div className="modal-inner">
                <div className="modal-header">
                  <p>Đăng bài hát</p>
                  <i className="fa-solid fa-xmark" onClick={() => setShowModal(false)}></i>
                </div>
                <div className="modal-content">
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input type="text" placeholder="Tên bài hát" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <input type="text" placeholder="Tên nghệ sĩ" value={artist} onChange={(e) => setArtist(e.target.value)} required />
                    <div className="d-flex">
                      <p>File nhạc</p>
                      <input type="file" accept="audio/mpeg" onChange={handleFileChange} required />
                    </div>
                    <div className="d-flex">
                      <p>Hình ảnh</p>
                      <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <button type="submit">Đăng bài</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
        <SidebarRight />
      </div>

      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}
    </>
  );
}

export default MusicPage;