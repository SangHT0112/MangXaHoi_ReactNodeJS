import React from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function GroupInfo({
  group,
  members,
  loggedInUser,
  isMember,
  isJoinRequestSent,
  setShowModal,
  handleLeaveGroup,
  fetchJoinRequests,
}) {
  const leader = members.find((member) => member.id === group.created_by);

  return (
    <>
      <div className="cover-photo">
        {leader && <img src={`${API_BASE_URL}/${leader.avatar}`} alt="created_by" />}
        <p>Trưởng nhóm</p>
        <p>{group.creator_username}</p>
      </div>
      <div className="profile-info">
        <img className="profile-picture" src={`${API_BASE_URL}/${group.avatar}`} alt="Ảnh nhóm" />
        <div className="user-info">
          <h1>{group.name}</h1>
          <p>{group.description}</p>
          <p>Trưởng nhóm: {group.creator_username}</p>
          <div className="btn-profile d-flex gap-2">
            {!isMember && !isJoinRequestSent ? (
              <button className="btn-add-friend" onClick={() => setShowModal(true)}>
                Tham gia nhóm
              </button>
            ) : isJoinRequestSent ? (
              <button className="btn-add-friend" disabled>
                Đã gửi yêu cầu
              </button>
            ) : (
              <button className="btn-add-friend" disabled>
                Đã tham gia
              </button>
            )}
            {isMember && group.created_by !== loggedInUser.id && (
              <button className="btn-friend" onClick={handleLeaveGroup}>
                Rời nhóm
              </button>
            )}
            {group.created_by === loggedInUser.id && (
              <button className="message-btn" onClick={fetchJoinRequests}>
                Danh sách gửi yêu cầu
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default GroupInfo;