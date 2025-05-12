// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, getProfile } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');
                if (storedUser && storedToken) {
                    //Nếu lưu trong localstorage thì gọi API để lấy thông tin đầy đủ,
                    //tránh trường hợp user sửa thông tin trong localStorage.
                    const userProfile = await getProfile();
                    setUser(userProfile);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials) => {
        try {
            const data = await apiLogin(credentials);
            setUser(data.user);
            setIsAuthenticated(true);
             navigate('/dashboard'); // Điều hướng sau khi đăng nhập thành công
            return data;
        } catch (error) {
            // Xử lý lỗi ở component (ví dụ: hiển thị thông báo lỗi)
            throw error; // Re-throw để component xử lý
        }
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login'); // Điều hướng sau khi đăng xuất
    };

    const authContextValue = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={authContextValue}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);