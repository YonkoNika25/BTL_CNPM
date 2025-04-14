// frontend/src/pages/Notifications/Notifications.js

import React, { useState, useEffect } from 'react';
import * as notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import styles from './Notifications.module.css';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {user} = useAuth();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await notificationService.getAllNotifications(); // Hoặc getUnreadNotifications()
                setNotifications(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            // Cập nhật lại state (đánh dấu notification là đã đọc)
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === id ? { ...notification, is_read: true } : notification
                )
            );

        } catch (error) {
            console.error("Failed to mark as read:", error);
            // Hiển thị thông báo lỗi cho người dùng (nếu cần)
        }
    };
     const handleMarkAllAsRead = async() => {
        try{
            await notificationService.markAllAsRead();
            //Cập nhật lại state
            setNotifications(preNotifications =>
                preNotifications.map(notification => ({
                    ...notification,
                    is_read: true
                }))
                );
        }
        catch(error)
        {
            console.error("Failed to mark all as read", error);
        }
     }
    if (loading) {
        return <div>Loading notifications...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Notifications</h1>
             <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
                Mark All as Read
            </button>
            {notifications.length === 0 ? (
                <p>No notifications.</p>
            ) : (
                <ul className={styles.list}>
                    {notifications.map((notification) => (
                        <li key={notification.id} className={`${styles.item} ${notification.is_read ? styles.read : styles.unread}`}>
                            <p className={styles.message}>{notification.message}</p>
                            <p className={styles.timestamp}>{new Date(notification.timestamp).toLocaleString()}</p>
                             {!notification.is_read && (
                                <button className={styles.markButton} onClick={() => handleMarkAsRead(notification.id)}>
                                    Mark as Read
                                </button>
                            )}

                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default NotificationsPage;