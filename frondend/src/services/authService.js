// frontend/src/services/authService.js
import api from '../utils/api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
     // Lưu thông tin user và token vào localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed'; // Custom error message
  }
};

export const logout = () => {
    //Xóa local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Không cần gọi API logout ở backend (nếu bạn không có logic đặc biệt ở đó)
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get profile';
  }
};

export const updateProfile = async (userData) => {
    try{
        const response = await api.put('/auth/profile', userData);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }
    catch(error)
    {
        throw error.response?.data?.message || "Failed to update profile";
    }
}
export const changePassword = async (passwords) => {
    try{
        const response = await api.put('/auth/change-password', passwords);
        return response.data;
    }
    catch(error)
    {
        throw error.response?.data?.message || "Failed to change password";
    }
}

export const register = async (userData) => {
  try {
    // Gọi API backend để đăng ký (ví dụ: POST /auth/register)
    const response = await api.post('/auth/register', userData);
    // Thường thì đăng ký xong không tự động đăng nhập và lưu token
    // nên chỉ trả về dữ liệu hoặc thông báo thành công
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};