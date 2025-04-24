import db from "../db.js";

// Store active calls
const activeCalls = new Map();

export const handleCallOffer = async (req, res) => {
  try {
    const { from, to, offer } = req.body;

    // Store the offer in active calls
    activeCalls.set(`${from}-${to}`, {
      from,
      to,
      offer,
      answer: null
    });

    // Here you would typically send a notification to the recipient
    // using WebSocket or another real-time communication method

    res.json({ success: true, message: "Call offer sent successfully" });
  } catch (error) {
    console.error("Error handling call offer:", error);
    res.status(500).json({ success: false, message: "Error handling call offer" });
  }
};

export const handleCallAnswer = async (req, res) => {
  try {
    const { from, to, answer } = req.body;
    const callKey = `${to}-${from}`;

    if (activeCalls.has(callKey)) {
      const call = activeCalls.get(callKey);
      call.answer = answer;
      activeCalls.set(callKey, call);

      res.json({ success: true, message: "Call answer sent successfully" });
    } else {
      res.status(404).json({ success: false, message: "Call not found" });
    }
  } catch (error) {
    console.error("Error handling call answer:", error);
    res.status(500).json({ success: false, message: "Error handling call answer" });
  }
};

export const getCallStatus = async (req, res) => {
  try {
    const { from, to } = req.params;
    const callKey = `${from}-${to}`;
    const call = activeCalls.get(callKey);

    if (call) {
      res.json({ success: true, call });
    } else {
      res.status(404).json({ success: false, message: "Call not found" });
    }
  } catch (error) {
    console.error("Error getting call status:", error);
    res.status(500).json({ success: false, message: "Error getting call status" });
  }
};

export const endCall = async (req, res) => {
  try {
    const { from, to } = req.body;
    const callKey = `${from}-${to}`;
    
    if (activeCalls.has(callKey)) {
      activeCalls.delete(callKey);
      res.json({ success: true, message: "Call ended successfully" });
    } else {
      res.status(404).json({ success: false, message: "Call not found" });
    }
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({ success: false, message: "Error ending call" });
  }
}; 