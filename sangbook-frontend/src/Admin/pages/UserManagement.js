import React, { useEffect, useState } from "react";
import styles from "../../styles/admin.module.css"; 
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("email");

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xóa người dùng
  const deleteUser = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/auth/admin/users/${id}`);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
      }
    }
  };

  // Sắp xếp danh sách
  const handleSort = (type) => {
    let newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortBy(type);
    setSortOrder(newSortOrder);

    const sortedUsers = [...users].sort((a, b) => {
      if (type === "email") {
        return newSortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
      }
      return newSortOrder === "asc" ? a.id - b.id : b.id - a.id;
    });

    setUsers(sortedUsers);
  };

  return (
    <div className="">
      {/* Bộ lọc & sắp xếp */}
      <div className="mb-3 d-flex gap-2 "> 
        <button onClick={() => handleSort("id")}>
          Sắp xếp theo ID {sortBy === "id" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
        </button>  
        <button onClick={() => handleSort("email")}>
          Sắp xếp theo Email {sortBy === "email" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
        </button>  
      </div>

      {/* Hiển thị danh sách người dùng */}
      <div className={styles.contentColName}>
        <p className={styles.columnId}>Id</p>
        <p className={styles.columnEmail}>Email</p>
        <p className={styles.columnAvatar}>Avatar</p>
        <p className={styles.columnEmail}>Username</p>
        <p className={styles.columnAction}>Hành động</p>
      </div>

      {users.length > 0 ? (
        users.map((user) => (
          <div className={styles.contentItem} key={user.id}>
            <p className={styles.columnId}>{user.id}</p>
            <p className={styles.columnEmail}>{user.email}</p>
            <div className={styles.columnAvatar}>
              <img src={user.avatar ? `${API_BASE_URL}/${user.avatar}` : "/default-avatar.png"} 
                   alt="Avatar" className={styles.imgAvt} />
            </div>
            <p className={styles.columnEmail}>{user.username}</p>
            <div className={styles.columnAction}>
              <button className={styles.btnDanger} onClick={() => deleteUser(user.id)}>
                Xóa Người Dùng
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Không có người dùng nào.</p>
      )}
    </div>
  );
};

export default UserManagement;
