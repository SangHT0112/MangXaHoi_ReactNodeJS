import React from "react";
import FriendRequest from "../FriendRequest";
import { FaBell } from "react-icons/fa";

const Notification = ({ isBellOpen, setIsBellOpen, userId }) => {
  return (
    <a className="btn-bell" onClick={() => setIsBellOpen(!isBellOpen)}>
      <FaBell />
      {isBellOpen && (
        <div className="friend-request d-flex">
          {<FriendRequest userId={userId} />}
        </div>
      )}
    </a>
  );
};

export default Notification;