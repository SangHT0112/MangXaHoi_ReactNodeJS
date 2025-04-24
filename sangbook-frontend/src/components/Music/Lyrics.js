import { useState, useEffect, useRef } from "react";
// import { mediaList } from "../../api/musicData";   //ẩn nếu dùng API
const LyricsComponent = ({ lrcText, currentTime, searchValue, isThemeSelected }) => {
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [currentLine, setCurrentLine] = useState("");
  const [currentLineChars, setCurrentLineChars] = useState([]);
  const [currentLineStartTime, setCurrentLineStartTime] = useState(0);
  const [mediaList, setMediaList] = useState([]);    //ẩn nếu dùng APIAPI
  const [currentMedia, setCurrentMedia] = useState({ type: "image", src: "" });

  const [backgroundImage, setBackgroundImage] = useState(
    "music/bgmusic1.jpg"
  ); // Đặt hình nền ban đầu

  const lyricsRef = useRef(null);
  const API_KEY = "PgXBXXO5voIKI1NWCI1cC0ZU1WpbnZqryn66XTsyM8xx6up5xfl5Hh1v"; // Thay bằng API key của bạn
  const API_URL_MEDIA = `https://api.pexels.com/videos/search?query=${searchValue}&per_page=10`;

  // Hàm phân tích cú pháp file .lrc
  const parseLRC = (lrcText) => {
    if (!lrcText || typeof lrcText !== "string") return [];

    const lines = lrcText.split("\n");
    const parsed = [];

    lines.forEach((line) => {
      const timestampMatches = line.match(/\[(\d+):(\d+\.\d+)\]/g);
      const text = line.replace(/\[(\d+):(\d+\.\d+)\]/g, "").trim();

      if (!timestampMatches || !text) return;

      timestampMatches.forEach((timestamp) => {
        const match = timestamp.match(/\[(\d+):(\d+\.\d+)\]/);
        if (!match) return;

        const minutes = parseInt(match[1]);
        const seconds = parseFloat(match[2]);
        const time = minutes * 60 + seconds;

        parsed.push({ time, text });
      });
    });

    return parsed.sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    const lyrics = parseLRC(lrcText);
    setParsedLyrics(lyrics);
  }, [lrcText]);

  // Slide hình
  // useEffect(() => {
  //   let currentIndex = 0;
  //   let videoElement = null;
  
  //   const playNextMedia = () => {
  //     const newMedia = mediaList[currentIndex];
  
  //     // Xóa video cũ nếu có
  //     if (videoElement) {
  //       videoElement.pause();
  //       videoElement.remove();
  //       videoElement = null;
  //     }
  
  //     if (newMedia.type === "image") {
  //       const newBackgroundImage = `${process.env.PUBLIC_URL}/${newMedia.src}`;
  //       const img = new Image();
  //       img.src = newBackgroundImage;
  //       img.onload = () => {
  //         setCurrentMedia(newMedia);
  //         setBackgroundImage(`url(${newBackgroundImage})`);
  //       };
  //     } else if (newMedia.type === "video") {
  //       videoElement = document.createElement("video");
  //       videoElement.src = `${process.env.PUBLIC_URL}/${newMedia.src}`;
  //       videoElement.className = "background-video";
  //       videoElement.muted = true;
  //       videoElement.autoplay = true;
  //       videoElement.loop = false;
  
  //       videoElement.onloadeddata = () => {
  //         setCurrentMedia(newMedia);
  //         document.querySelector(".lyrics-container").appendChild(videoElement);
  //       };
  
  //       // Không chuyển media ngay khi video kết thúc, để interval xử lý
  //       videoElement.onended = () => {
  //         // Có thể để trống hoặc xử lý thêm nếu cần
  //       };
  //     }
  
  //     currentIndex = (currentIndex + 1) % mediaList.length;
  //   };
  
  //   // Khởi động media đầu tiên
  //   playNextMedia();
  
  //   // Chuyển media mỗi 10 giây
  //   const interval = setInterval(() => {
  //     playNextMedia();
  //   }, 10000);
  
  //   // Dọn dẹp khi component unmount
  //   return () => {
  //     clearInterval(interval);
  //     if (videoElement) {
  //       videoElement.pause();
  //       videoElement.remove();
  //     }
  //   };
  // }, [mediaList]);


  //Gọi API Pexels để lấy danh sách video
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://api.pexels.com/videos/search?query=${searchValue}&per_page=10`,
          {
            headers: { Authorization: API_KEY }
          }
        );
        const data = await response.json();
        const videos = data.videos.map(video => ({
          type: "video",
          src: video.video_files[0]?.link
        }));
        setMediaList(videos);
        if (videos.length > 0) setCurrentMedia(videos[0]); // Chọn video đầu tiên
      } catch (error) {
        console.error("Lỗi khi lấy video từ Pexels:", error);
      }
    };
  
    fetchVideos();
  }, [searchValue]); // Thêm searchValue vào dependency list
  

  // Slide video từ API
  useEffect(() => {
    if (mediaList.length === 0) return;
  
    let currentIndex = 0;
    let videoElement = null;
  
    const playNextVideo = () => {
      const newMedia = mediaList[currentIndex];
  
      // Nếu có video cũ, xóa nó khỏi DOM
      if (videoElement) {
        videoElement.pause();
        videoElement.remove();
      }
  
      // Tạo phần tử video mới
      videoElement = document.createElement("video");
      videoElement.src = newMedia.src;
      videoElement.className = "background-video";
      videoElement.muted = true;
      videoElement.autoplay = true;
      videoElement.loop = false;
  
      // Khi video tải xong, thêm vào DOM
      videoElement.onloadeddata = () => {
        document.querySelector(".lyrics-container").appendChild(videoElement);
        setCurrentMedia(newMedia); // Cập nhật media hiện tại
      };
  
      // Tăng index để chuyển sang video tiếp theo
      currentIndex = (currentIndex + 1) % mediaList.length;
    };
  
    // Khởi động video đầu tiên
    playNextVideo();
  
    // Thiết lập interval để chuyển video mỗi 10 giây
    const interval = setInterval(() => {
      playNextVideo();
    }, 10000); // 10 giây = 10000ms
  
    // Dọn dẹp khi component unmount
    return () => {
      clearInterval(interval);
      if (videoElement) {
        videoElement.pause();
        videoElement.remove();
      }
    };
  }, [mediaList]);
  


  useEffect(() => {
    if (parsedLyrics.length === 0) {
      setCurrentLine("Không có lời bài hát.");
      setCurrentLineChars([]);
      setCurrentLineStartTime(0);
      return;
    }

    const current = parsedLyrics.find((line, index) => {
      const nextTime = parsedLyrics[index + 1]?.time || Infinity;
      return currentTime >= line.time && currentTime < nextTime;
    });

    const newLine = current ? current.text : "";
    setCurrentLine(newLine);
    setCurrentLineStartTime(current ? current.time : 0);

    if (newLine) {
      const chars = newLine.split("").map((char, index) => ({
        char,
        index,
      }));
      setCurrentLineChars(chars);
    } else {
      setCurrentLineChars([]);
    }
  }, [currentTime, parsedLyrics]);


  return (
    <div
    className="lyrics-container"
    ref={lyricsRef}
    style={{
      backgroundImage: currentMedia.type === "image" ? `url(${process.env.PUBLIC_URL}/${currentMedia.src})` : "none",
    }}
  >
    {currentMedia.type === "video" && (
      <video
        className="background-video"
        src={`${process.env.PUBLIC_URL}/${currentMedia.src}`}
        autoPlay
        loop
        muted
      />
    )}
      {parsedLyrics.length > 0 ? (
        <div className="lyrics-full">
          <p className="lyric-line active">
            {currentLine.split("").map((char, charIndex) => (
              <span
                key={`${currentLine}-${charIndex}`}
                className="lyric-char"
              >
                {char}
              </span>
            ))}
          </p>
        </div>
      ) : (
        <p style={{color:'white'}}>Không có lời bài hát.</p>
      )}
    </div>
  );
  
};

export default LyricsComponent;
