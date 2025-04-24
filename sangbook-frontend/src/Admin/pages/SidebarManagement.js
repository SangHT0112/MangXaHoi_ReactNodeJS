import React, { useEffect, useState } from "react";
import styles from "../../styles/admin.module.css";
import "../../styles/modal.css";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;  // Sử dụng biến môi trường

const SidebarManagement = () => {
  const [menus, setMenus] = useState([]);
  const [newMenu, setNewMenu] = useState({ ten_menu: "", image: null });
  const [preview, setPreview] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const API_URL = `${API_BASE_URL}/api/sidebar`;  // Sử dụng API_BASE_URL thay vì URL cố định

  // Lấy danh sách menu
  const fetchMenus = async () => {
    try {
      const response = await axios.get(API_URL);
      console.log("Dữ liệu menu:", response.data); // Debug API response
      setMenus(response.data || []); // Đảm bảo response.data luôn là mảng
    } catch (error) {
      console.error("Lỗi khi lấy danh sách menu:", error);
      setMenus([]); // Nếu lỗi, set mảng rỗng để tránh lỗi .length
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Xử lý chọn ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setNewMenu({ ...newMenu, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      alert("Chỉ hỗ trợ hình ảnh!");
    }
  };

  // Thêm menu mới
  const addMenu = async () => {
    if (!newMenu.ten_menu || !newMenu.image) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
  
    const formData = new FormData();
    formData.append("ten_menu", newMenu.ten_menu);
    formData.append("image", newMenu.image);
  
    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.item) {
        const newItem = {
          ...response.data.item,
          image: `${API_BASE_URL}/${response.data.item.image}`, // Dùng API_BASE_URL
        };
        setMenus([...menus, newItem]);
      }
  
      setNewMenu({ ten_menu: "", image: null });
      setPreview("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Lỗi khi thêm menu:", error);
    }
  };

  const deleteMenu = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa menu này?")) return;
  
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMenus(menus.filter((menu) => menu.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa menu:", error);
      alert("Không thể xóa menu!");
    }
  };
  
  return (
    <div className="listBtn">
      <button className={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
        Thêm Menu
      </button>

      {/* Modal Thêm Menu */}
      {showAddModal && (
        <div className="modal show" onClick={(e) => e.target.classList.contains("modal") && setShowAddModal(false)}>
          <div className="modal-inner">
            <div className="modal-header">
              <p>Thêm Menu</p>
              <i className="fa-solid fa-xmark" onClick={() => setShowAddModal(false)}></i>
            </div>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Tên menu"
                value={newMenu.ten_menu}
                onChange={(e) => setNewMenu({ ...newMenu, ten_menu: e.target.value })}
              />
              <div className="file-upload">
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              {preview && <img src={preview} alt="Ảnh xem trước" className="preview-img" />}
              <div className="modal-footer">
                <button className={styles.btnSuccess} onClick={addMenu}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách menu */}
      <div className={styles.contentColName}>
        <p className={styles.columnId}>ID</p>
        <p className={styles.columnEmail}>Tên Menu</p>
        <p className={styles.columnAttachment}>Hình ảnh</p>
        <p className={styles.columnDelete}>Hành động</p>
      </div>

      {menus.length > 0 ? (
        menus.map((menu) => (
          <div className={styles.contentItem} key={menu.id}>
            <p className={styles.columnId}>{menu.id}</p>
            <p className={styles.columnEmail}>{menu.ten_menu}</p>
            <div className={styles.columnAttachment}>
              <img src={menu.image.startsWith("http") ? menu.image : `${API_BASE_URL}/${menu.image}`} alt="Hình ảnh menu" className={styles.imgAvt} />
            </div>
            <div className={styles.columnDelete}>
              <button className={styles.btnDanger} onClick={() => deleteMenu(menu.id)}>Xóa</button>
            </div>
          </div>
        ))
      ) : (
        <p>Không có menu nào.</p>
      )}
    </div>
  );
};

export default SidebarManagement;
