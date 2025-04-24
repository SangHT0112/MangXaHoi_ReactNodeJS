import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js"; // ✅ Kết nối MySQL
import http from "http";
import { Server } from "socket.io";
import { saveMessage } from "./models/messageModel.js"; // ✅ Lưu tin nhắn vào MySQL
import { sendMessage } from "./models/groupChatModels.js"; // ✅ Lưu tin nhắn nhóm
import axios from "axios"; // 🔥 Bổ sung dòng này

//import AI
import { OpenAI } from "openai";
import fs from "fs";
import multer from "multer";


// 🔥 Import routes
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import commentPostRoutes from "./routes/commentPostRoutes.js";
import reactionPostRoutes from "./routes/reactionPostRoutes.js";
import sidebarRoutes from "./routes/sidebarRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import groupChatRoutes from "./routes/groupChatRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import callRoutes from "./routes/callRoutes.js";
dotenv.config();
const app = express();
const server = http.createServer(app); // Tạo HTTP Server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ✅ Fix lỗi __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Log request để debug
app.use((req, res, next) => {
  console.log(`📩 [${req.method}] ${req.url}`);
  next();
});

// ✅ API Routes
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentPostRoutes);
app.use("/api/reactions", reactionPostRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/group-chats", groupChatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/songs", musicRoutes);
app.use("/api/call", callRoutes);
// ✅ Lưu trữ socket ID của user
let onlineUsers = {}; // Lưu danh sách user online

// ✅ KẾT NỐI WEBSOCKET
io.on("connection", (socket) => {
  console.log("🟢 New WebSocket Connection:", socket.id);

  socket.on("registerUser", (userId) => {
    if (!userId) return;

    if (!onlineUsers[userId]) {
      onlineUsers[userId] = [];
    }

    // Tránh thêm trùng socket ID
    if (!onlineUsers[userId].includes(socket.id)) {
      onlineUsers[userId].push(socket.id);
    }

    console.log("📌 Danh sách user online sau cập nhật:", onlineUsers);
  });

  // Xử lý cuộc gọi video
  socket.on("callOffer", (data) => {
    const { from, to, offer } = data;
    console.log(`📞 Cuộc gọi từ ${from} đến ${to}`);

    // Kiểm tra xem người nhận có online không
    if (onlineUsers[to] && onlineUsers[to].length > 0) {
      // Gửi offer đến tất cả socket của người nhận
      onlineUsers[to].forEach(socketId => {
        io.to(socketId).emit("callOffer", {
          from,
          offer
        });
      });
    } else {
      // Thông báo cho người gọi nếu người nhận offline
      socket.emit("callError", {
        message: "Người dùng không online"
      });
    }
  });

  // Xử lý phản hồi cuộc gọi
  socket.on("callAnswer", (data) => {
    const { to, answer } = data;
    console.log(`📞 Phản hồi cuộc gọi đến ${to}`);

    if (onlineUsers[to] && onlineUsers[to].length > 0) {
      onlineUsers[to].forEach(socketId => {
        io.to(socketId).emit("callAnswer", answer);
      });
    }
  });

  // Xử lý ICE candidates
  socket.on("iceCandidate", (data) => {
    const { to, candidate } = data;
    if (onlineUsers[to] && onlineUsers[to].length > 0) {
      onlineUsers[to].forEach(socketId => {
        io.to(socketId).emit("iceCandidate", candidate);
      });
    }
  });

  // Xử lý từ chối cuộc gọi
  socket.on("rejectCall", (data) => {
    const { to } = data;
    if (onlineUsers[to] && onlineUsers[to].length > 0) {
      onlineUsers[to].forEach(socketId => {
        io.to(socketId).emit("callRejected");
      });
    }
  });

  // Xử lý kết thúc cuộc gọi
  socket.on("endCall", (data) => {
    const { to } = data;
    if (onlineUsers[to] && onlineUsers[to].length > 0) {
      onlineUsers[to].forEach(socketId => {
        io.to(socketId).emit("callEnded");
      });
    }
  });

  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      onlineUsers[userId] = onlineUsers[userId].filter((id) => id !== socket.id);
      if (onlineUsers[userId].length === 0) {
        delete onlineUsers[userId];
      }
    }

    console.log("🔴 User disconnected:", socket.id);
    console.log("📌 Danh sách user online sau cập nhật:", onlineUsers);
  });
  

  socket.on("getOnlineUsers", () => {
    socket.emit("updateUsers", onlineUsers);
  });
  
  

  // ✅ Xử lý gửi tin nhắn cá nhân
  socket.on("sendMessage", async (data) => {
    console.log("📩 Tin nhắn nhận được từ client:", data);
    const { send_id, receive_id, content } = data;

    if (!send_id || !receive_id || !content) {
      console.error("❌ Lỗi: Thiếu dữ liệu tin nhắn", { send_id, receive_id, content });
      return;
    }

    try {
      await saveMessage(send_id, receive_id, content);
      io.emit("receiveMessage", { send_id, receive_id, content, created_at: new Date() });
    } catch (error) {
      console.error("❌ Lỗi khi lưu tin nhắn:", error);
    }
  });

  // ✅ Xử lý gửi tin nhắn nhóm
  socket.on("sendGroupMessage", async (data) => {
    console.log("📩 Tin nhắn nhóm nhận từ client:", data);

    const { username, avatar, group_id, sender_id, message, media } = data;
    if (!group_id || !sender_id || (!message && !media)) {
      console.error("❌ Lỗi: Thiếu dữ liệu tin nhắn nhóm", data);
      return;
    }

    try {
      console.log("✅ Đang lưu tin nhắn vào DB...");
      await sendMessage(group_id, sender_id, message, media);

      console.log("✅ Tin nhắn đã lưu thành công, gửi lại cho nhóm...");
      io.to(`group_${group_id}`).emit("receiveGroupMessage", {
        username,
        avatar,
        group_id,
        sender_id,
        message,
        media,
        sent_at: new Date(),
      });
    } catch (error) {
      console.error("❌ Lỗi khi gửi tin nhắn nhóm:", error);
    }
  });

  // ✅ Tham gia nhóm chat
  socket.on("joinGroup", (group_id) => {
    socket.join(`group_${group_id}`);
    console.log(`✅ Người dùng ${socket.id} đã tham gia nhóm ${group_id}`);
  });

  // ✅ Rời nhóm chat
  socket.on("leaveGroup", (group_id) => {
    socket.leave(`group_${group_id}`);
    console.log(`👋 Người dùng ${socket.id} rời khỏi nhóm ${group_id}`);
  });


  
});

// ✅ Kết nối MySQL
db.getConnection()
  .then(() => console.log("✅ Kết nối MySQL thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MySQL:", err));

// ✅ Khởi động server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});



// // ✅ Cấu hình OpenAI API
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // ✅ Cấu hình Multer để lưu file tạm thời
// const upload = multer({ dest: "uploads/songs/" });

// // ✅ API nhận diện lời bài hát từ audio
// app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
//   console.log("📩 Nhận request tại /api/transcribe:", req.body, req.file);
//   let filePath;
//   const maxRetries = 3;
//   const timeoutMs = 30000; // Timeout 30 giây

//   for (let attempt = 0; attempt < maxRetries; attempt++) {
//     try {
//       if (req.file) {
//         filePath = req.file.path;
//         console.log("📎 Nhận file upload:", filePath);
//       } else if (req.body.url) {
//         const fileUrl = req.body.url.trim();
//         console.log("🔗 URL nhận được:", fileUrl);
//         if (!fileUrl.startsWith("http")) {
//           return res.status(400).json({ error: "URL không hợp lệ" });
//         }

//         const response = await axios({
//           url: fileUrl,
//           responseType: "stream",
//         });
//         filePath = path.join(__dirname, "uploads/songs/", `temp_${Date.now()}.mp3`);
//         const writer = fs.createWriteStream(filePath);
//         response.data.pipe(writer);
//         await new Promise((resolve, reject) => {
//           writer.on("finish", resolve);
//           writer.on("error", reject);
//         });
//         console.log("✅ Đã tải file từ URL:", filePath);

//         const stats = fs.statSync(filePath);
//         console.log("📏 Kích thước file:", stats.size, "bytes");
//         if (stats.size > 25 * 1024 * 1024) {
//           throw new Error("File quá lớn (>25MB), OpenAI không hỗ trợ");
//         }
//       } else {
//         return res.status(400).json({ error: "Thiếu dữ liệu (file hoặc URL)" });
//       }

//       if (!fs.existsSync(filePath)) {
//         throw new Error("File tạm không tồn tại");
//       }
//       const readStream = fs.createReadStream(filePath);
//       readStream.on("error", (err) => {
//         throw new Error(`Lỗi đọc file: ${err.message}`);
//       });

//       console.log(`📤 Gửi file tới OpenAI (lần ${attempt + 1})...`);
//       const transcription = await Promise.race([
//         openai.audio.transcriptions.create({
//           model: "whisper-1",
//           file: readStream,
//           response_format: "json",
//         }),
//         new Promise((_, reject) =>
//           setTimeout(() => reject(new Error("Timeout: OpenAI không phản hồi trong 30 giây")), timeoutMs)
//         ),
//       ]);
//       console.log("🎵 Transcription từ OpenAI:", transcription.text);

//       res.json({ lyrics: transcription.text || "Không nhận diện được lời bài hát" });
//       break;
//     } catch (error) {
//       console.error(`❌ Lỗi xử lý (lần ${attempt + 1}):`, error.message, error.stack);
//       if (attempt < maxRetries - 1) {
//         console.log(`⏳ Thử lại sau 2 giây...`);
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//         continue;
//       }
//       res.status(500).json({ error: "Lỗi xử lý âm thanh", details: error.message });
//     } finally {
//       if (filePath && fs.existsSync(filePath)) {
//         try {
//           fs.unlinkSync(filePath);
//           console.log("🗑️ Đã xóa file tạm:", filePath);
//         } catch (err) {
//           console.error("❌ Lỗi khi xóa file tạm:", err);
//         }
//       }
//     }
//   }
// });
// app.get("/api/test-openai", async (req, res) => {
//   try {
//     const response = await openai.models.list();
//     res.json({ success: true, data: response.data });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
