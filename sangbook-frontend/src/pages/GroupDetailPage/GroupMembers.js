import React from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function GroupMembers({ members, loggedInUser, group, navigate }) {
  return (
    <div className="group-members">
      <h2>Thành viên ({members.length})</h2>
      <ul>
        {members.map((member) => (
          <li key={member.id} onClick={() => navigate(`/profile/${member.id}`)}>
            <img src={`${API_BASE_URL}/${member.avatar}`} className="img-avt" alt="Avatar" />
            <span>
              {member.id === loggedInUser.id ? "Bạn" : member.username}
              {member.username === group.creator_username ? " (Trưởng nhóm)" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupMembers;