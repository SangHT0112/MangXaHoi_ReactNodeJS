import React from "react";
import "../styles/modal.css";

function Modal({ show, onClose, title, children }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span></span>
          <p>{title}</p>
          <i className="fa-solid fa-xmark" onClick={onClose}></i>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;