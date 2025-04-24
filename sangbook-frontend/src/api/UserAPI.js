const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`);
      const data = await response.json();
      return data.users || []; // Trả về danh sách người dùng hoặc mảng rỗng nếu lỗi
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      return [];
    }
  };

  export const getUserById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/user/${id}`);
    return response.json();
  };
  


   
  