import React from "react";
import { FaHome, FaUsers, FaYoutube, FaStore, FaUserPlus, FaMusic } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const location = useLocation();
    const navigate = useNavigate();
  
  return (
    <div className="block2">
      <a onClick={()=> navigate("/")} className={location.pathname === "/" ? "active" : ""}>
        <FaHome />
      </a>

      <a
        onClick={() => navigate("/add-friend")}
        className={location.pathname === "/add-friend" ? "active" : ""}
      >
        <FaUserPlus />
      </a>
      
      <a
        onClick={() => navigate("/videos")}
        className={location.pathname === "/videos" ? "active" : ""}
      >
        <FaYoutube />
      </a>
      <a
        onClick={() => navigate("/music")}
        className={location.pathname === "/music" ? "active" : ""}
      >
        <FaMusic />
      </a>

      <a
        onClick={() => navigate("/groups")}
        className={location.pathname === "/groups" ? "active" : ""}
      >
        <FaUsers />
      </a>
      
    </div>
  );
};

export default MainMenu;