import express from "express";
import { 
    sendFriendRequest, 
    checkFriendStatus, 
    acceptFriendRequest,
    declineFriendRequest,
    getFriendRequests,
    getAcceptedFriends,
    getSuggestedFriends
 } from "../controllers/friendController.js";

const router = express.Router();

router.post("/send-request", sendFriendRequest);
router.get("/check-status/:user1/:user2", checkFriendStatus);
router.post("/accept-request", acceptFriendRequest);
router.get("/friend-requests/:receive_id", getFriendRequests);  // Lấy danh sách lời mời kết bạn
router.get("/suggested/:userId", getSuggestedFriends);
router.post("/accept", acceptFriendRequest);
router.post("/decline", declineFriendRequest);
//Lấy danh sách bạn bè
router.get("/accepted/:userId", getAcceptedFriends);
export default router;
