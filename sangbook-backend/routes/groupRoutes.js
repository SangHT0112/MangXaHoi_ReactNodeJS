import express from 'express';
import multer from 'multer';
import path from 'path';
import { createNewGroup, 
    getGroupsByUser,
    getGroupDetail,
    getMembers, 
    getAllGroupList,
    requestToJoinGroup, 
    fetchJoinRequests, 
    processJoinRequest,
    leaveGroup,
    createGroupPost,
    getGroupPosts,
    handleCancelJoinRequest
} from '../controllers/groupController.js';

const router = express.Router();

// Cấu hình lưu ảnh nhóm
const storage = multer.diskStorage({
    destination: 'uploads/groups/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Routes
router.get('/', getAllGroupList);
router.post('/create', upload.single('avatar'), createNewGroup);
router.get('/user/:userId', getGroupsByUser);

// Lấy thông tin của group
router.get('/:groupId', getGroupDetail);

// API lấy danh sách thành viên nhóm
router.get('/:groupId/members', getMembers);

// Gửi yêu cầu tham gia nhóm
router.post('/:groupId/join-request', requestToJoinGroup);

// Lấy danh sách yêu cầu tham gia nhóm (chỉ dành cho trưởng nhóm)
router.get('/:groupId/join-requests', fetchJoinRequests);

// Chấp nhận hoặc từ chối yêu cầu tham gia nhóm
router.post('/join-requests/:requestId/handle', processJoinRequest);

// Rời nhóm
router.post('/:groupId/leave', leaveGroup);
//Hủy yêu cầu
router.post("/:groupId/cancel-request", handleCancelJoinRequest);

// Cấu hình Multer để upload hình ảnh & video
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, 'uploads/group_posts/image/');
        } else if (file.mimetype.startsWith('video/')) {
            cb(null, 'uploads/groups_posts/videos/');
        } else {
            cb(new Error('File không hợp lệ'), false);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const postUpload = multer({ storage: postStorage });

// Đăng bài viết lên nhóm (hỗ trợ hình ảnh & video)
router.post('/:groupId/post', postUpload.single('media'), createGroupPost);

router.get('/:groupId/posts', getGroupPosts);


export default router;
