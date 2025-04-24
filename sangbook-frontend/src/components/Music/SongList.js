import { useState, useEffect } from "react";
import SongItem from "./SongItem";

const SongList = ({ playlist, likedSongs, setCurrentSong }) => {
  const [likedSongsState, setLikedSongsState] = useState(likedSongs);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/songs/liked`);
        const data = await response.json();
  
        if (data.success) {
          setLikedSongsState(data.likedSongs); // Cập nhật likedSongsState từ API
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài hát đã like:", error);
      }
    };
  
    fetchLikedSongs(); // Gọi API khi component mount
  }, []);
  
  

  // Hàm toggleLike để gọi API và cập nhật likedSongs
  const toggleLike = async (songId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/songs/like/${songId}`,
        { method: "POST" }
      );
      const data = await response.json();
  
      if (data.success) {
        setLikedSongsState((prevLikedSongs) => {
          if (prevLikedSongs.includes(songId)) {
            return prevLikedSongs.filter((id) => id !== songId); // Nếu đã like thì xóa
          } else {
            return [...prevLikedSongs, songId]; // Nếu chưa like thì thêm vào
          }
        });
      }
    } catch (error) {
      console.error("Lỗi khi thả tim:", error);
    }
  };
  


  return (
    <div className="playlist">
      {playlist.length > 0 ? (
        playlist.map((song) => (
          <SongItem
            key={song.id}
            song={song}
            isLiked={likedSongsState.includes(song.id)} // Kiểm tra nếu bài hát đã được like
            toggleLike={toggleLike}
            setCurrentSong={setCurrentSong}
          />
        ))
      ) : (
        <p>Không có bài hát nào.</p>
      )}
    </div>
  );
};

export default SongList;
