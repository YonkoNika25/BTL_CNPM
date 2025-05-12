import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  IconButton,
} from '@mui/material';
import {
  getAllNotifications,
  markAsRead,
  getUnreadNotifications,
} from '../../services/notificationService';
import { formatDateTime } from '../../utils/helpers';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import Loading from '../Loading';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await getAllNotifications();
        setNotifications(response);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await getUnreadNotifications();
        setUnreadCount(response.length);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };
    fetchUnreadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notifications ({unreadCount})
      </Typography>
      <List>
        {notifications.map((notification, index) => (
          <Box key={notification.id}>
            <ListItem
              sx={{
                backgroundColor: notification.isRead ? 'white' : '#f0f0f0',
              }}
            >
              <ListItemText
                primary={notification.content}
                secondary={formatDateTime(notification.createdAt)}
              />
              {!notification.isRead && (
                <IconButton
                  onClick={() => handleMarkAsRead(notification.id)}
                  aria-label="mark as read"
                >
                  <MarkEmailReadIcon />
                </IconButton>
              )}
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default NotificationList;
