const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getPosts = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const response = await fetch(`${API_BASE_URL}/api/posts?user_id=${user.id}`);
  const data = await response.json();
  
  return data.map(post => ({
    ...post,
    user_reaction: post.user_reaction || "like" // Mặc định là "like" nếu không có
  }));
};

export const getPostsByUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/posts/user/${userId}`);
  return response.json();
};



//GROUP POST


