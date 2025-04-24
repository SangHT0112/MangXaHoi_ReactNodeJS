import express from "express";
import {
  handleCallOffer,
  handleCallAnswer,
  getCallStatus,
  endCall
} from "../controllers/callController.js";

const router = express.Router();

// Handle call offer
router.post("/offer", handleCallOffer);

// Handle call answer
router.post("/answer", handleCallAnswer);

// Get call status
router.get("/status/:from/:to", getCallStatus);

// End call
router.post("/end", endCall);

export default router; 