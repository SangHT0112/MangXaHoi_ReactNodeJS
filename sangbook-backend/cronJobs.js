// import db from "./db.js";
// import cron from "node-cron";
// cron.schedule("0 * * * *", async () => { // Chạy mỗi giờ
//   try {
//     await db.query("DELETE FROM stories WHERE TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24");
//     console.log("🗑 Story quá hạn đã bị xóa!");
//   } catch (error) {
//     console.error("❌ Lỗi khi xóa story:", error);
//   }
// });