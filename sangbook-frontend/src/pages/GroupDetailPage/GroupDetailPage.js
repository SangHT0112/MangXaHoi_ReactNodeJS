import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import PostListGroup from "../../components/PostListGroup";
import GroupInfo from "./GroupInfo.js";
import GroupMembers from "./GroupMembers.js";
import JoinRequestModal from "./JoinRequestModal.js";
import JoinRequestsModal from "./JoinRequestsModal";
import GroupNavigation from "./GroupNavigation.js";
import CreateGroupPostModal from "./CreateGroupPostModal.js";
import { getPostsByGroup } from "../../api/groupAPI.js";
import { getGroupById, getMember, requestJoinGroup, getJoinRequests, handleJoinRequest } from "../../api/groupAPI";
import SuccessModal from "../../components/SuccessModal.js";
import "../../styles/group_detail_page.css";
import "../../styles/Posts.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function GroupDetailPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [joinMessage, setJoinMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isJoinRequestSent, setIsJoinRequestSent] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const groupPosts = await getPostsByGroup(id);
      if (groupPosts?.success) {
        setPosts(groupPosts.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Lỗi lấy bài viết trong nhóm:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupData = await getGroupById(id);
        setGroup(groupData.group);
      } catch (error) {
        console.error("Lỗi lấy thông tin nhóm:", error);
      }
    };

    fetchGroupData();
    fetchPosts();
  }, [id]);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      const memberData = await getMember(id);
      if (memberData.success) {
        setMembers(memberData.members);
      }
    };
    fetchGroupMembers();
  }, [id]);

  useEffect(() => {
    const checkIfUserIsMember = () => {
      const userIsMember = members.some((member) => member.id === loggedInUser.id);
      setIsMember(userIsMember);
    };
    checkIfUserIsMember();
  }, [members, loggedInUser.id]);

  const fetchJoinRequests = async () => {
    try {
      const response = await getJoinRequests(id);
      if (response.success) {
        setJoinRequests(response.requests);
        setShowRequestsModal(true);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách yêu cầu:", error);
    }
  };

  const submitJoinRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await requestJoinGroup(id, loggedInUser.id, joinMessage);
      if (response.success) {
        setSuccessMessage(response.message);
        setShowSuccessModal(true);
        setShowModal(false);
        setJoinMessage("");
        setIsJoinRequestSent(true);
        localStorage.setItem(`joinRequestSent-${id}`, "true");
      } else {
        alert("Lỗi gửi yêu cầu!");
      }
    } catch (error) {
      console.error("Lỗi gửi yêu cầu:", error);
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequestAction = async (requestId, isAccepted) => {
    try {
      const response = await handleJoinRequest(requestId, isAccepted);
      if (response.success) {
        alert(`Đã ${isAccepted ? "chấp nhận" : "từ chối"} yêu cầu.`);
        setJoinRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
      } else {
        alert("Lỗi xử lý yêu cầu!");
      }
    } catch (error) {
      console.error("Lỗi xử lý yêu cầu:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/groups/${id}/leave`, { userId: loggedInUser.id });
      if (response.data.success) {
        alert("Bạn đã rời nhóm thành công!");
        setIsMember(false);
        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== loggedInUser.id));
        localStorage.removeItem(`joinRequestSent-${id}`);
      } else {
        alert(response.data.message || "Có lỗi xảy ra khi rời nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi rời nhóm:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handlePostCreated = async () => {
    // Callback để cập nhật danh sách bài viết sau khi đăng bài thành công
    await fetchPosts(); // Gọi lại fetchPosts để cập nhật
  };

  if (!group) return <p>Đang tải...</p>;

  return (
    <div className="group-detail-page">
      <Header user={loggedInUser} />
      <GroupInfo
        group={group}
        members={members}
        loggedInUser={loggedInUser}
        isMember={isMember}
        isJoinRequestSent={isJoinRequestSent}
        setShowModal={setShowModal}
        handleLeaveGroup={handleLeaveGroup}
        fetchJoinRequests={fetchJoinRequests}
      />
      <GroupMembers members={members} loggedInUser={loggedInUser} group={group} navigate={navigate} />
      <GroupNavigation />
      <div className="main">
        <div className="content">
          {isMember && (
            <>
              <button onClick={() => setShowPostModal(true)}>Đăng lên nhóm</button>
              <PostListGroup posts={posts} fetchPosts={fetchPosts} />
            </>
          )}
          {!isMember && <p>Bạn phải tham gia nhóm để xem bài viết.</p>}
        </div>
      </div>

      <JoinRequestModal
        showModal={showModal}
        setShowModal={setShowModal}
        loggedInUser={loggedInUser}
        joinMessage={joinMessage}
        setJoinMessage={setJoinMessage}
        submitJoinRequest={submitJoinRequest}
        loading={loading}
      />
      <JoinRequestsModal
        showRequestsModal={showRequestsModal}
        setShowRequestsModal={setShowRequestsModal}
        joinRequests={joinRequests}
        handleJoinRequestAction={handleJoinRequestAction}
      />
      <CreateGroupPostModal
        showPostModal={showPostModal}
        setShowPostModal={setShowPostModal}
        groupId={id}
        userId={loggedInUser.id}
        onPostCreated={handlePostCreated}
      />

    {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}

    </div>
  );
}

export default GroupDetailPage;