import React from "react";

function JoinRequestModal({
  showModal,
  setShowModal,
  loggedInUser,
  joinMessage,
  setJoinMessage,
  submitJoinRequest,
  loading,
}) {
  if (!showModal) return null;

  return (
    <div className="modal show" onClick={(e) => e.target.className === "modal" && setShowModal(false)}>
      <div className="modal-inner">
        <div className="modal-header">
          <span></span>
          <p>Gửi yêu cầu tham gia nhóm</p>
          <i className="fa-solid fa-xmark" onClick={() => setShowModal(false)}></i>
        </div>
        <div className="modal-content">
          <form onSubmit={submitJoinRequest}>
            <div className="modal-info">
              <img src={loggedInUser.avatar} alt="Avatar" className="img-avt" />
              <p>{loggedInUser.username}</p>
            </div>
            <textarea
              placeholder={`${loggedInUser.username} ơi, Bạn tham gia nhóm vì điều gì?`}
              rows="4"
              style={{ width: "100%", resize: "none", padding: "10px", fontSize: "16px" }}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              required
            />
            <div className="modal-footer">
              <button type="submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinRequestModal;