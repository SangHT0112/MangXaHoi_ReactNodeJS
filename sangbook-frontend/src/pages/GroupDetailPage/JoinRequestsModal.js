import React from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function JoinRequestsModal({ showRequestsModal, setShowRequestsModal, joinRequests, handleJoinRequestAction }) {
  if (!showRequestsModal) return null;

  return (
    <div className="modal show" onClick={(e) => e.target.className === "modal" && setShowRequestsModal(false)}>
      <div className="modal-inner">
        <div className="modal-header">
          <p>Danh sách yêu cầu tham gia</p>
          <i className="fa-solid fa-xmark" onClick={() => setShowRequestsModal(false)}></i>
        </div>
        <div className="modal-content">
          <ul className="p-0">
            {joinRequests.length > 0 ? (
              joinRequests.map((request) => (
                <li
                  key={request.user_id}
                  className="d-flex justify-content-between align-items-center p-2 border rounded"
                  style={{ minHeight: "50px" }}
                >
                  <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                    <img
                      src={`${API_BASE_URL}/${request.avatar}`}
                      className="img-avt"
                      alt="Avatar"
                      style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                    />
                    <div style={{ maxWidth: "250px" }}>
                      <span className="fw-bold d-block">{request.username}</span>
                      <p className="mb-0 text-muted small" style={{ maxHeight: "80px", overflow: "auto" }}>
                        <span className="fw-bold">Mong muốn: </span> {request.message}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      style={{ height: "30px", width: "30px" }}
                      onClick={() => handleJoinRequestAction(request.id, true)}
                    >
                      ✔
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ height: "30px", width: "30px" }}
                      onClick={() => handleJoinRequestAction(request.id, false)}
                    >
                      ✖
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>Không có yêu cầu nào.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JoinRequestsModal;