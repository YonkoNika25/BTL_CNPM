// frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Thay đổi nếu backend chạy ở port khác
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (thêm token vào header Authorization)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (xử lý lỗi chung) - TÙY CHỌN
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if(error.response)
        {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            // error.response.data
            // error.response.status
            // error.response.headers
            if(error.response.status === 401) // Unauthorized
            {
                // Xử lý khi hết hạn token hoặc không có quyền
                // Ví dụ: Xóa local storage, chuyển hướng về trang login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login'; // Chuyển hướng (cách đơn giản)
            }
        }
        else if(error.request)
        {
             // The request was made but no response was received
             // error.request
        }
        else{
            // Something happened in setting up the request that triggered an Error
        }
        return Promise.reject(error);
    }
)

export default api;