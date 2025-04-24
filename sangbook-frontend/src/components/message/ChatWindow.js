import React, { useEffect, useState } from "react";
import "../../styles/message.css";
import axios from "axios";
import VideoCall from "./VideoCall";

const reactionsList = [
  { type: "like", icon: "fa-thumbs-up", color: "#1877F2" },
  { type: "love", icon: "fa-heart", color: "#F94069" },
  { type: "haha", icon: "fa-face-laugh-squint", color: "rgb(247, 177, 37)" },
  { type: "sad", icon: "fa-face-sad-tear", color: "rgb(247, 177, 37)" },
  { type: "angry", icon: "fa-face-angry", color: "rgb(233, 113, 15)" },
];

const ReactionList = ({ onReact }) => {
  return (
    <div className="message-list-react">
      {reactionsList.map((reaction) => (
        <i
          key={reaction.type}
          className={`fa-solid ${reaction.icon}`}
          style={{ color: reaction.color }}
          onClick={() => onReact(reaction.type)}
        />
      ))}
    </div>
  );
};

const ChatWindow = ({
  isChatOpen,
  setIsChatOpen,
  selectedUser,
  messages,
  setMessages,
  message,
  setMessage,
  sendMessage,
  user_id,
  API_BASE_URL,
}) => {
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      let chatBox = document.getElementById("message-chat-main");
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  };

  const handleRevokeMessage = async (messageId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/messages/${messageId}/revoke`, {
        userId: user_id.id,
      });

      if (response.data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, content: "Tin nhắn đã thu hồi" } : msg
          )
        );
        setSelectedMessageId(null);
      } else {
        alert(response.data.message || "Không thể thu hồi tin nhắn");
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
      alert("Có lỗi xảy ra khi thu hồi tin nhắn");
    }
  };

  const handleReactMessage = async (messageId, reactionType) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/messages/${messageId}/reaction`, {
        userId: user_id.id,
        reaction: reactionType,
      });

      if (response.data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: [{ user_id: user_id.id, reaction: reactionType }],
                }
              : msg
          )
        );
        setSelectedMessageId(null);
      } else {
        alert(response.data.message || "Không thể thả cảm xúc");
      }
    } catch (error) {
      console.error("Lỗi khi thả cảm xúc:", error);
      alert("Có lỗi xảy ra khi thả cảm xúc");
    }
  };

  if (!isChatOpen || !selectedUser) return null;

  return (
    <>
      <div className="message-chat">
        <div className="message-chat-header p-2">
          <div className="message-chat-info-recieve">
            <img
              src={selectedUser.avatar ? `${API_BASE_URL}/${selectedUser.avatar}` : "/group.png"}
              alt="Avatar"
              className="img-avt"
            />
            <span className="chat-header-recieve-name">{selectedUser.username}</span>
          </div>
          <div className="d-flex gap-3">
            <div className="icon-call" onClick={() => setIsVideoCallOpen(true)}>
              <i className="fa-solid fa-video"></i>
            </div>
            <div className="icon-close" onClick={() => setIsChatOpen(false)}>
              X
            </div>
          </div>
        </div>

        <div id="message-chat-main" className="message-chat-main">
          {messages
            .filter(
              (msg) =>
                (msg.send_id === user_id.id && msg.receive_id === selectedUser.id) ||
                (msg.send_id === selectedUser.id && msg.receive_id === user_id.id)
            )
            .map((msg, index) => (
              <div
                key={index}
                className={`message-chat-item ${
                  msg.send_id === user_id.id ? "message-chat-send" : "message-chat-recieve"
                }`}
                onClick={() => setSelectedMessageId(msg.id === selectedMessageId ? null : msg.id)}
              >
                <div
                  className={`d-flex justify-content-${
                    msg.send_id === user_id.id ? "end" : "start"
                  }`}
                >
                  <img
                    src={
                      msg.send_id === user_id.id
                        ? user_id.avatar.startsWith("http")
                          ? user_id.avatar
                          : `${API_BASE_URL}/${user_id.avatar}`
                        : selectedUser.avatar.startsWith("http")
                        ? selectedUser.avatar
                        : `${API_BASE_URL}/${selectedUser.avatar}`
                    }
                    alt="Avatar"
                    className="img-avt"
                  />
                  <div className="label-chat">
                    <p
                      className={`chat-${
                        msg.send_id === user_id.id ? "send" : "recieve"
                      }-name`}
                    >
                      {msg.send_id === user_id.id ? "Bạn" : selectedUser.username}
                    </p>
                    <p
                      className={`chat-${
                        msg.send_id === user_id.id ? "send" : "recieve"
                      }-content ${msg.content === "Tin nhắn đã thu hồi" ? "revoked" : ""}`}
                    >
                      {msg.content}
                    </p>
                    {/* Hiển thị biểu tượng cảm xúc */}
                    {msg.reactions?.length > 0 && (
                      <span className="message-react">
                        {msg.reactions.map((r, index) => {
                          const reactionData = reactionsList.find(
                            (reac) => reac.type === r.reaction
                          );
                          return reactionData ? (
                            <i
                              key={index}
                              className={`fa-solid ${reactionData.icon}`}
                              style={{ color: reactionData.color }}
                            />
                          ) : null;
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {selectedMessageId === msg.id && (
                  <div
                    className={`message-options-${
                      msg.send_id === user_id.id ? "send" : "recieve"
                    }`}
                  >
                    {msg.send_id === user_id.id && (
                      <button
                        className="btn-revoke"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevokeMessage(msg.id);
                        }}
                      >
                        Thu hồi
                      </button>
                    )}
                    <button className="btn-react">Thả cảm xúc</button>
                    <ReactionList
                      onReact={(reaction) => handleReactMessage(msg.id, reaction)}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="message-chat-footer">
          <input
            type="text"
            placeholder="Gửi tin nhắn"
            className="input-message-send"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim() !== "") {
                sendMessage();
              }}}
          />
          <button className="btn-message-send" onClick={sendMessage}>
            Gửi
          </button>
        </div>
      </div>

      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        selectedUser={selectedUser}
        currentUser={user_id}
        API_BASE_URL={API_BASE_URL}
      />
    </>
  );
};

export default ChatWindow;