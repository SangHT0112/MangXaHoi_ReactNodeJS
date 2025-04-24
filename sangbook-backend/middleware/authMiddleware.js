import jwt from "jsonwebtoken";
import db from "../db.js";

export const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kiểm tra user có phải admin không
        const [users] = await db.execute("SELECT role FROM users WHERE id = ?", [decoded.id]);
        if (users.length === 0 || users[0].role !== "admin") {
            return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập!" });
        }

        next();
    } catch (error) {
        res.status(403).json({ success: false, message: "Token không hợp lệ!" });
    }
};
    