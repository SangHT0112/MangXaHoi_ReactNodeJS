import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/LogSign.css"; // Import CSS
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
  
    let validationErrors = {};
  
    if (!email) {
      validationErrors.email = "Email không được để trống!";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = "Email không hợp lệ!";
    }
  
    if (!password) {
      validationErrors.password = "Mật khẩu không được để trống!";
    } else if (password.length < 6) {
      validationErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    console.log("Gửi dữ liệu:", { email, password }); // Kiểm tra dữ liệu gửi đi
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      console.log("Phản hồi từ server:", response); // Kiểm tra phản hồi
  
      const data = await response.json();
      console.log("Dữ liệu từ server:", data); // Kiểm tra JSON từ backend
  
      if (data.success) {
        setMessage("Đăng nhập thành công!");

        // Lưu thông tin người dùng vào Local Storage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        
        navigate('/');
      } else {
        setMessage(data.message || "Username hoặc mật khẩu không chính xác!");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      setMessage("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };
  

  return (
    <div className="login-container">
      <div className="container">
        <h1>SangBook</h1>
        <form onSubmit={handleLogin}>
          <span className="error">{message}</span>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span id="email_error" className="error">{errors.email}</span>

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span id="password_error" className="error">{errors.password}</span>

          <div className="button_control d-flex gap-3">
            <button type="button" onClick={() => window.location.href = '/register'}>Đăng ký</button>
            <button type="submit">Đăng nhập</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
