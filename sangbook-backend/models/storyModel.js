import db from "../db.js";
import path from "path";
import fs from "fs";

// Lấy tất cả story
// Lấy tất cả story bao gồm thông tin bài hát
export const getAllStories = async () => {
  const [rows] = await db.query(
    `SELECT stories.*, 
            users.username, 
            users.avatar, 
            songs.title AS song_title, 
            songs.artist AS song_artist, 
            songs.image AS song_image, 
            songs.source AS song_source
     FROM stories 
     JOIN users ON stories.user_id = users.id
     LEFT JOIN songs ON stories.music = songs.id  -- Đảm bảo music là id của bài hát
     ORDER BY stories.created_at DESC`
  );
  return rows;
};

export const getStoriesByUserId = async (user_id) => {
  const [rows] = await db.query(
    `SELECT stories.*, 
            users.username, 
            users.avatar, 
            songs.title AS song_title, 
            songs.artist AS song_artist, 
            songs.image AS song_image, 
            songs.source AS song_source
     FROM stories 
     JOIN users ON stories.user_id = users.id
     LEFT JOIN songs ON stories.music = songs.id
     WHERE stories.user_id = ? -- Lọc theo user_id
     ORDER BY stories.created_at DESC`,
    [user_id]
  );
  return rows;
};

// Tạo story mới
export const createStory = async (user_id, image, video, music) => {
  const query = "INSERT INTO stories (user_id, image, video, music) VALUES (?, ?, ?, ?)";

  // Chuyển đường dẫn về định dạng chuẩn "/"
  const imagePath = image ? image.path.replace(/\\/g, "/") : null; 
  const videoPath = video ? video.path.replace(/\\/g, "/") : null; 

  const values = [user_id, imagePath, videoPath, music];

  try {
    // Thực hiện truy vấn để thêm story mới
    const [result] = await db.query(query, values);

    // Truy vấn thông tin người dùng từ bảng users
    const [userRows] = await db.query("SELECT username, avatar FROM users WHERE id = ?", [user_id]);
    
    // Kiểm tra user có tồn tại không
    if (userRows.length === 0) {
      throw new Error("User không tồn tại!");
    }

    const { username, avatar } = userRows[0];

    // Truy vấn thông tin bài hát từ bảng songs theo user_id
    const [songRows] = await db.query("SELECT title, artist, source, image FROM songs WHERE user_id = ?", [user_id]);
    
    // Kiểm tra nếu bài hát có tồn tại
    if (songRows.length > 0) {
      const { title, artist, source, image: songImage } = songRows[0];
      
      // Thêm thông tin bài hát vào story
      return {
        id: result.insertId,
        user_id,
        image: imagePath,
        video: videoPath,
        username,
        avatar,
        music, // Đường dẫn nhạc
        song: { title, artist, source, image: songImage } // Thông tin bài hát
      };
    }

    // Nếu không có bài hát, chỉ trả về thông tin cơ bản
    return {
      id: result.insertId,
      user_id,
      image: imagePath,
      video: videoPath,
      username,
      avatar,
      music // Đường dẫn nhạc
    };

  } catch (error) {
    throw error;
  }
};



// Xóa story
export const deleteStory = async (story_id) => {
  const [rows] = await db.query("SELECT image, video FROM stories WHERE id = ?", [story_id]);

  if (rows.length === 0) {
    return { success: false, message: "Story không tồn tại!" };
  }

  const { image, video } = rows[0];
  await db.query("DELETE FROM stories WHERE id = ?", [story_id]);

  if (image) fs.unlinkSync(path.join("uploads/stories", path.basename(image)));
  if (video) fs.unlinkSync(path.join("uploads/videos", path.basename(video)));

  return { success: true, message: "Story đã bị xóa!" };
};
