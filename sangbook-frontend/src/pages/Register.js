import { useState } from "react";
import axios from "axios";
import "../styles/LogSign.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
  
    const formDataObj = new FormData();
    formDataObj.append("username", formData.username);
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);
    if (formData.avatar) {
      formDataObj.append("avatar", formData.avatar);
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" }
      });
  
      setMessage(response.data.message);
    } catch (err) {
      setErrors(err.response?.data?.error || "Đăng ký thất bại!");
    }
  };
  

  return (
    <div className="login-container">
      <div className="container">
        <div className="form-wrapper">
          <h1>Đăng ký SangBook</h1>
          {message && <p className="success">{message}</p>}
          <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" onChange={handleChange} />
            {errors.username && <p className="error">{errors.username}</p>}

            <input type="email" name="email" placeholder="Email" onChange={handleChange} />
            {errors.email && <p className="error">{errors.email}</p>}

            <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
            {errors.avatar && <p className="error">{errors.avatar}</p>}

            <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} />
            {errors.password && <p className="error">{errors.password}</p>}

            <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" onChange={handleChange} />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            <div>
              <button type="button" onClick={() => window.location.href = '/login'}>Đăng Nhập</button>
              <button type="submit">Đăng ký</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}