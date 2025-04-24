import React, { useRef, useEffect } from "react";

const AutoPlayVideo = ({ src, className }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handlePlay = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch((err) => console.error("Lỗi phát video:", err));
          video.muted = false; // 🔊 Bật âm thanh mặc định
          video.volume = 1.0; // Set âm lượng tối đa
        } else {
          video.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handlePlay, { threshold: 0.5 });
    observer.observe(video);

    return () => observer.unobserve(video);
  }, []);

  return <video ref={videoRef} src={src} className={className} controls />;
};

export default AutoPlayVideo;
