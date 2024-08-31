import axios from 'axios'; //Handeling between frontend and backend

const API = axios.create({ baseURL: 'http://localhost:3000' }); //URL For Backend

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('http://localhost:3000/api_auth/refresh_token', { refreshToken });
          localStorage.setItem('token', data.accessToken);
          API.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          return API(originalRequest);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
export const editPost = async (postId, data) => {
  try {
    const response = await API.put(`/api_Geta3/edit-post/${postId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing post:', error);
    throw error;
  }
};
export const fetchPostsByCarKind = async (carKind) => {
  try {
    const response = await API.get(`/api_Geta3/list/${carKind}`);
    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPostDetails = async (postId) => {
  try {
    const response = await API.get(`/api_Geta3/Geta3-detail/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post details:', error);
    throw error;
  }
};

export const fetchComments = async (postId) => {
  try {
    const response = await API.get(`/api_Geta3/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (postId, commentData) => {
  try {
    const response = await API.post(`/api_Geta3/comments/${postId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const editComment = async (postId, commentId, commentData) => {
  try {
    const response = await API.put(`/api_Geta3/comments/${postId}/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const response = await API.delete(`/api_Geta3/comments/${postId}/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const addFavorite = async (postId) => {
  try {
    const response = await API.post(`/api_Geta3/add-favorite/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFavorite = async (postId) => {
  try {
    const response = await API.post(`/api_Geta3/remove-favorite/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const fetchTopFavorites = async () => {
  try {
    const response = await API.get('/api_Geta3/top-favorites');
    return response.data;
  } catch (error) {
    console.error('Error fetching top favorite posts:', error);
    throw error;
  }
};

export const fetchTopRetailers = async () => {
  try {
    const response = await API.get('/api_Geta3/top-retailers');
    return response.data;
  } catch (error) {
    console.error('Error fetching top retailers:', error);
    throw error;
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    const response = await API.get(`/api_auth/user-posts/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const signup = (formData) => API.post('/api_auth/register', formData);
export const login = async (formData) => {
  try {
    const { data } = await API.post('/api_auth/login', formData);
    
    // Check if the expected fields are present in the response
    if (!data || !data.accessToken || !data.refreshToken || !data.user) {
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data; // Return the data so it can be used elsewhere in the application
  } catch (error) {
    console.error('Login error:', error.message || error);
    throw error;
  }
};

export const logout = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const token = localStorage.getItem('token');
  return API.post('/api_auth/logout', { refreshToken, token });
};

export const searchGeta3 = async (term, carType = '', condition = '', carModel = '') => {
  try {
    const response = await API.get('/api_Geta3/search', {
      params: { searchTerm: term, carKind: carType, condition, carModel }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching Geta3:', error);
    throw error;
  }
};

export const fetchUser = async () => {
  try {
    const response = await API.get('/api_auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};


export const deleteProfile = (userId) => API.delete(`/api_auth/profile/${userId}`);
export const verifyEmail = (data) => API.post(`/api_auth/verify-email`, data);
export const sendPhoneVerification = (data) => API.post(`/api_auth/send-phone-verification`, data);
export const updateUserLocation = (data) => API.post(`/api_auth/update-location`, data);

export const checkEmail = (email) => API.post('/api_auth/check-email', email);
export const resetPassword = (id, token, password) => API.post(`/api_auth/post_reset-password/${id}/${token}`, { password });
export const forgotPassword = (email) => API.post('/api_auth/forgot-password', { Email: email });
export const refresh_token = (formData) => API.post('/api_auth/refresh_token', formData);
export const verifyPhoneNumber = (data) => API.post('/api_auth/verify-phone', data);
export const changePassword = (formData) => API.post('/api_auth/change-password', formData);

export const createGeta3 = (formData) => API.post('/api_Geta3/create', formData);
export const fetchGeta3List = (carKind) => API.get(`/api_Geta3/list/${carKind}`);
export const fetchItemsToApprove = () => API.get('/api_auth/authorize');
export const approveItem = (itemId) => API.post(`/api_auth/admin/acceptance/${itemId}`, { accept: true });
export const unAuthorizeItem = (itemId) => API.post(`/api_auth/admin/acceptance/${itemId}`, { accept: false });

export const coverDownload = (id) => API.get(`/api_Geta3/cover/${id}`, { responseType: 'blob' });

export const deleteGeta3 = async (geta3Id) => {
  try {
    const response = await API.delete(`/api_Geta3/delete-geta3/${geta3Id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting Geta3:', error);
    throw error;
  }
};
