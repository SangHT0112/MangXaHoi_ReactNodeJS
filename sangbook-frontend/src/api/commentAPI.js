const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getComments = async (postId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/comments/${postId}`);
        return await res.json();
    } catch (error) {
        console.error("Lỗi lấy bình luận:", error);
        return [];
    }
};

export const addComment = async (userId, postId, content) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, post_id: postId, content }),
        });
        return await res.json();
    } catch (error) {
        console.error("Lỗi tạo bình luận:", error);
        return { error: "Lỗi server" };
    }
};
