// frontend/src/services/notificationService.js

import api from '../utils/api';

export const getAllNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to get notifications';
    }
};
export const getUnreadNotifications = async() => {
    try{
        const response = await api.get('/notifications/unread');
        return response.data;
    }
    catch(error){
        throw error.response?.data?.message || "Failed to get notifications";
    }
}

export const markAsRead = async (id) => {
    try {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to mark as read';
    }
};

export const markAllAsRead = async() => {
    try{
        const response = await api.put('/notifications/read');
        return response.data;
    }
    catch(error)
    {
        throw error.response?.data?.message || "Failed to mark all as read";
    }
}