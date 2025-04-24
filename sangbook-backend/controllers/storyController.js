import { getAllStories, createStory, deleteStory, getStoriesByUserId } from "../models/storyModel.js";
import db from "../db.js";
// Lấy tất cả stories
export const getStories = async (req, res) => {
  try {
    const stories = await getAllStories();
    res.json(stories);
  } catch (error) {
    console.error("Lỗi khi lấy stories:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
};

export const getUserStories = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Thiếu userId!" });
  }

  try {
    const stories = await getStoriesByUserId(userId);
    res.status(200).json({ stories });
  } catch (error) {
    console.error("Lỗi khi lấy stories của người dùng:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
};

// Tạo story mới
export const createNewStory = async (req, res) => {
    console.log("Dữ liệu nhận được từ frontend:", req.body, req.files);
    const { user_id } = req.body;
    const image = req.files?.image ? req.files.image[0] : null; // Lấy file ảnh
    const video = req.files?.video ? req.files.video[0] : null; // Lấy file video
    const music = req.body.music || null; // Lấy nhạc từ body (không phải toàn bộ req.body)

  
    if (!user_id) return res.status(400).json({ error: "Thiếu user_id!" });
  
    try {
      const newStory = await createStory(user_id, image, video, music);
  
      // Kiểm tra dữ liệu trả về
      if (!newStory || !newStory.username || !newStory.avatar) {
        throw new Error("Dữ liệu trả về không hợp lệ!");
      }
  
      // Trả về story mới với đầy đủ thông tin
      res.status(201).json({ message: "Story đã được đăng!", story: newStory });
      console.log("Du lieu tra ve frontend:",newStory);
    } catch (error) {
      console.error("Lỗi khi đăng story:", error);
      res.status(500).json({ error: error.message || "Lỗi server!" });
    }
  };

// Xóa story
export const removeStory = async (req, res) => {
  const story_id = req.params.id;

  if (!story_id) return res.status(400).json({ error: "Thiếu story_id!" });

  try {
    const result = await deleteStory(story_id);
    if (!result.success) return res.status(403).json({ error: result.message });

    res.json({ message: result.message });
  } catch (error) {
    console.error("Lỗi khi xóa story:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
};


//Tăng lượt view khi xem
export const increaseViewCount = async (req, res) => {
  try {
    const { storyId } = req.params;

    // Kiểm tra story có tồn tại không
    const [[story]] = await db.query("SELECT views FROM stories WHERE id = ?", [storyId]);
    if (!story) return res.status(404).json({ error: "Story không tồn tại!" });

    // Tăng lượt xem
    await db.query("UPDATE stories SET views = views + 1 WHERE id = ?", [storyId]);

    // Lấy lại dữ liệu mới
    const [[updatedStory]] = await db.query("SELECT * FROM stories WHERE id = ?", [storyId]);

    res.status(200).json({ message: "Lượt xem đã cập nhật", story: updatedStory });
  } catch (error) {
    console.error("Lỗi cập nhật lượt xem:", error);
    res.status(500).json({ error: "Lỗi cập nhật lượt xem!" });
  }
};
