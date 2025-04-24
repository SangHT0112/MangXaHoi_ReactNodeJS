import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { IoMdSkipBackward, IoMdSkipForward } from "react-icons/io";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MusicPlayer = ({ song, playlist, setCurrentSong, setLyric, setCurrentTime }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setLocalCurrentTime] = useState("0:00");
  const [trackLength, setTrackLength] = useState("0:00");
  const [lrcText, setLrcText] = useState(""); // Giữ lại để fetch .lrc
  const audioRef = useRef(new Audio());

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const fetchLyric = async (songId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/songs/lyrics/${songId}`);
      if (!res.ok) throw new Error("Không thể tải file .lrc");
      const data = await res.json();
      const processedText = data.lyrics.replace(/\\r\\n/g, "\n");
      setLrcText(processedText); // Lưu nội dung .lrc đã xử lý
      setLyric(processedText);   // Cập nhật lyric cho MusicPage
    } catch (error) {
      console.error("❌ Lỗi tải lyric:", error.message);
      setLrcText("Không tìm thấy lời bài hát.");
      setLyric("Không tìm thấy lời bài hát.");
    }
  };

  useEffect(() => {
    if (!song || !song.src) return;

    const songUrl = `${API_BASE_URL}/${song.src}`;
    audioRef.current.pause();
    audioRef.current.src = songUrl;
    audioRef.current.load();

    const handleTimeUpdate = () => {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
      setLocalCurrentTime(formatTime(current));
      setCurrentTime(current); // Gửi currentTime lên MusicPage
    };

    audioRef.current.addEventListener("loadedmetadata", () => {
      setTrackLength(formatTime(audioRef.current.duration));
    });
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("ended", playNext);

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    }

    setProgress(0);
    setLocalCurrentTime("0:00");

    if (song.id) {
      fetchLyric(song.id);
    } else {
      setLrcText("");
    }

    return () => {
      audioRef.current.pause();
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.removeEventListener("ended", playNext);
    };
  }, [song, setCurrentTime]);

  const togglePlay = () => {
    if (!audioRef.current.src) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current.duration) return;
    const seekBar = e.currentTarget;
    const clickX = e.clientX - seekBar.getBoundingClientRect().left;
    const newTime = (clickX / seekBar.offsetWidth) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
  };

  const playNext = () => {
    const currentIndex = playlist.findIndex((s) => s.id === song.id);
    setCurrentSong(playlist[(currentIndex + 1) % playlist.length]);
  };

  const playPrev = () => {
    const currentIndex = playlist.findIndex((s) => s.id === song.id);
    setCurrentSong(playlist[(currentIndex - 1 + playlist.length) % playlist.length]);
  };

  return (
    <div id="player-container">
      <div id="player-bg-artwork"></div>
      <div id="player-bg-layer"></div>
      <div id="player">
        <div id="player-track" className={isPlaying ? "active" : ""}>
          <div id="album-name">{song.title}</div>
          <div id="track-name">{song.artist}</div>
          <div id="track-time">
            <div id="current-time">{currentTime}</div>
            <div id="track-length">{trackLength}</div>
          </div>
          <div id="seek-bar-container" onClick={handleSeek}>
            <div id="s-hover"></div>
            <div id="seek-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div id="player-content">
          <div id="album-art" className={isPlaying ? "active" : ""}>
            <img
              src={song.image ? `${API_BASE_URL}/${song.image}` : "/normal.jpg"}
              alt={song.title}
              className="active"
            />
          </div>
          <div id="player-controls">
            <div className="control">
              <div className="button" onClick={playPrev}>
                <IoMdSkipBackward />
              </div>
            </div>
            <div className="control">
              <div className="button" onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </div>
            </div>
            <div className="control">
              <div className="button" onClick={playNext}>
                <IoMdSkipForward />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;