import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import VideoPage from "./pages/VideoPage";
import ProfilePage from "./pages/ProfilePage";
import AddFriendPage from "./pages/AddFriendPage";
import GroupPage from "./pages/GroupPage";
import GroupDetailPage from "./pages/GroupDetailPage/GroupDetailPage.js";
import MusicPage from "./pages/MusicPage.js";
import "./App.css";

//ADMIN
import AdminLayout from "./Admin/components/AdminLayout";
import AdminDashboard from "./Admin/pages/AdminDashboard ";
import PostManagement from "./Admin/pages/PostManagement";
import UserManagement from "./Admin/pages/UserManagement";
import CommentManagement from "./Admin/pages/CommentManagement";
import SidebarManagement from "./Admin/pages/SidebarManagement";
import ReactionManagement from "./Admin/pages/ReactionManagement";




function App() {

  return (
    <Router>
      <Routes>
        {/* Route cho ADMIN */}
        <Route path="/admin" element={<AdminLayout title="DashBoard">   <AdminDashboard/>    </AdminLayout>}/>
        <Route path="/admin/posts" element={<AdminLayout title="Quản lý bài viết"><   PostManagement />  </AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout title="Quản lý tài khoản"><   UserManagement />  </AdminLayout>} />
        <Route path="/admin/comments" element={<AdminLayout title="Quản lý bình luận"><   CommentManagement />  </AdminLayout>} />
        <Route path="/admin/menus" element={<AdminLayout title="Quản lý Menu danh mục"><   SidebarManagement />  </AdminLayout>} />
        <Route path="/admin/reactions" element={<AdminLayout title="Quản lý Menu lượt tương tác"><   ReactionManagement />  </AdminLayout>} />


        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/groups" element={<GroupPage />} />
        <Route path="/videos" element={<VideoPage />} />
        <Route path="/add-friend" element={<AddFriendPage />} />
        <Route path="/profile/:id" element={<ProfilePage/>} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />

        <Route path="/music" element={<MusicPage />} />
 
      </Routes>
    </Router>
  );
}

export default App;
