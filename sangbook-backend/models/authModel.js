import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',  // Thay đổi nếu cần
  password: '',  // Thay đổi nếu cần
  database: 'MangXaHoi',  // Thay đổi theo tên cơ sở dữ liệu của bạn
});

pool.getConnection()
  .then(() => console.log("Kết nối đến cơ sở dữ liệu thành công!"))
  .catch(err => console.error("Lỗi kết nối đến cơ sở dữ liệu: ", err));

export const getUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
  return rows[0];  // Trả về người dùng đầu tiên hoặc undefined nếu không tìm thấy
};



//==============ADMIN=============