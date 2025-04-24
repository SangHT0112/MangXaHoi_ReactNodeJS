import { FaHeart } from "react-icons/fa";
import { useState, useEffect } from "react";

const SongItem = ({ song, isLiked, toggleLike, setCurrentSong }) => {
  const [likeCount, setLikeCount] = useState(song.likes || 0);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/songs/${song.id}`);
        const data = await response.json();
  
        if (data.likes) {  // Kiểm tra xem API có trả về likes không
          setLikeCount(data.likes); // Cập nhật số lượng like
        }
      } catch (error) {
        console.error("Lỗi khi lấy số lượng like:", error);
      }
    };
  
    fetchLikes();
  }, [song.id]);
  

  const handleLike = async (songId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/songs/like/${songId}`, {
        method: "POST",
      });
      const data = await response.json();
  
      if (data.success) {
        setLikeCount(data.likes); // Cập nhật số lượng like mới từ API
        toggleLike(songId); // Đổi trạng thái like trong SongList
      }
    } catch (error) {
      console.error("Lỗi khi thả tim:", error);
    }
  };

  

  return (
    <div key={song.id} className="song-item" onClick={() => setCurrentSong(song)}>
      <div className="song-item-left d-flex gap-2">
        <img src={song.image ? `${process.env.REACT_APP_API_BASE_URL}/${song.image}` : "/normal.jpg"} alt={song.title} />
        <div className="song-info">
          <div className="song-title">{song.title}</div>
          <div className="song-artist">{song.artist}</div>
        </div>
      </div>
      <div
        className="song-item-right d-flex"
        onClick={(e) => {
          e.stopPropagation(); // Ngăn chặn setCurrentSong khi nhấn icon
          handleLike(song.id); // Gọi hàm tăng like
        }}
      >
        <small>{likeCount}</small> {/* Hiển thị số lượng like */}
        <FaHeart color={isLiked ? "lightcoral" : "white"} />
      </div>
    </div>
  );
};

export default SongItem;
