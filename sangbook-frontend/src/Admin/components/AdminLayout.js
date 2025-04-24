import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/admin.module.css"; // ✅ Import đúng cách

const AdminLayout = ({ title, children }) => {
  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.info}>
          <Link to="/">
            <img src="logo192.png" alt="Logo" className="img-avt"/>
          </Link>
          <h2>Trang Quản Lý</h2>
        </div>
        <ul>
          <li><Link to="/admin/menus"><i className="fa-solid fa-bars"></i> Quản lý menu</Link></li>
          <li><Link to="/admin/users"><i className="fa-solid fa-users"></i> Quản lý người dùng</Link></li>
          <li><Link to="/admin/posts"><i className="fa-solid fa-newspaper"></i> Quản lý bài viết</Link></li>
          <li><Link to="/admin/comments"><i className="fa-solid fa-comments"></i> Quản lý bình luận</Link></li>
          <li><Link to="/admin/reactions"><i className="fa-solid fa-heart"></i> Quản lý tương tác</Link></li>
        </ul>
      </div>

      {/* Nội dung chính */}
      <div className={styles.adminContent}>
        <h1 className={styles.adminTitle}>{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
