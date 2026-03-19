const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const postService = {
  // Create a new post
  createPost: async (content, tags, image, token) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, tags, image }),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  // Get the social feed
  getFeed: async (page = 1, limit = 20) => {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch feed');
    return response.json();
  },

  // Like / unlike a post
  likePost: async (postId, token) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to like post');
    return response.json();
  },

  // Comment on a post
  commentOnPost: async (postId, text, token) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to comment');
    return response.json();
  },

  // Share a post
  sharePost: async (postId, token) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to share post');
    return response.json();
  },

  // Delete a post
  deletePost: async (postId, token) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },
};

export default postService;
