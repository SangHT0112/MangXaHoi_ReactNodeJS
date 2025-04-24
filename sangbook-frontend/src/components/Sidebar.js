import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/sidebar.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
function Sidebar() {
  const [menuItems, setMenuItems] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // Lấy user từ localStorage

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/sidebar`)
      .then(response => setMenuItems(response.data))
      .catch(error => console.error("Lỗi khi lấy menu:", error));
  }, []);

  return (
    <div className="sidebar">
      <Link
        to={`/profile/${user.id}`}
        className="friend-show-profile d-flex gap-2"
        key={user.id}
      >
        <img
          src={user.avatar ? user.avatar : "/default-avatar.jpg"}
          alt="Avatar"
          className="img-avt"
        />
        <span className="post-name mt-3">{user.username}</span>
      </Link>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <a href={item.link}>
              <img src={`${API_BASE_URL}/${item.image}`} alt={item.ten_menu} width="24" height="24" />
              {item.ten_menu}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
