import axios from "axios";

export const registerUser = async (formData) => {
  const form = new FormData();
  form.append("username", formData.username);
  form.append("email", formData.email);
  form.append("password", formData.password);
  form.append("confirm_password", formData.confirmPassword);
  if (formData.avatar) {
    form.append("avatar", formData.avatar);
  }

  try {
    const res = await axios.post("http://localhost:4000/api/auth/register", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, message: res.data.message };
  } catch (err) {
    return { success: false, errors: err.response?.data.errors || {} };
  }
};
