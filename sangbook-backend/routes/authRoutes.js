import express from "express";
import { register, login, getUser, getUserById, logout, getAllUsers, deleteUser, updateUser } from "../controllers/authController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
import upload from "../middleware/upload.js";

//Route dành cho Người dùng
router.post("/register", upload.single("avatar"), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', getUser);
router.get("/user/:id", getUserById);


// Routes dành cho admin
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUser);



// API upload avatar

router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Không có file nào được tải lên!' });
    }

    // Trả về URL của file vừa upload
    const fileUrl = `http://localhost:4000/uploads/avatars/${req.file.filename}`;
    res.json({ fileUrl });
});
export default router;
