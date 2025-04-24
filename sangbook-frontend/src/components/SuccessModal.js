import React, { useEffect } from "react";
import "../styles/successmodal.css"
const SuccessModal = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Tự động đóng sau 3 giây
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content">
        <div className="success-modal-icon">✔</div>
        <p>{message}</p>
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default SuccessModal;
