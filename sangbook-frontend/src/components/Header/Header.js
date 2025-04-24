import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "../../styles/Header.css";
import { getAcceptedFriends } from "../../api/friendAPI";
import { FaHive } from "react-icons/fa";
import SearchBar from "../SearchBar";
import MainMenu from "./MainMenu";
import Messenger from "../message/Messenger";
import ChatWindow from "../message/ChatWindow";
import Notification from "./Notification";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const socket = io(`${API_BASE_URL}`);

const Header = ({ user }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const user_id = JSON.parse(localStorage.getItem("user")) || {};

  const fetchFriends = async () => {
    try {
      const data = await getAcceptedFriends(user_id.id);
      setFriends(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  const fetchGroups = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/groups`);
    setGroups(response.data);
  };

  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/messages/${user_id.id}/${selectedUser.id}`
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchUsers();
    fetchFriends();
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedUser]);

  const sendMessage = () => {
    if (!selectedUser || message.trim() === "") return;
    const newMessage = {
      send_id: user_id.id,
      receive_id: selectedUser.id,
      content: message,
    };
    socket.emit("sendMessage", newMessage);
    setMessage("");
  };

  return (
    <nav className="navbar">
      <div className="header">
        <div className="block1">
          <a href="/">
            <img className="img-avt" src="logo192.png" alt="Logo" />
          </a>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            users={users}
            groups={groups}
            API_BASE_URL={API_BASE_URL}
          />
        </div>

        <MainMenu />

        <div className="block3">
          <a href="#" className="change-background">
            <FaHive />
          </a>
          <Messenger
            isMessageBoxOpen={isMessageBoxOpen}
            setIsMessageBoxOpen={setIsMessageBoxOpen}
            friends={friends}
            setSelectedUser={setSelectedUser}
            setIsChatOpen={setIsChatOpen}
            API_BASE_URL={API_BASE_URL}
          />
          <ChatWindow
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages} // Thêm prop này
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            user_id={user_id}
            API_BASE_URL={API_BASE_URL}
          />
          <Notification
            isBellOpen={isBellOpen}
            setIsBellOpen={setIsBellOpen}
            userId={user_id.id}
          />
          <a href="/profile" className="avatar-link">
            <img src={user_id.avatar} alt="" className="img-avt" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;