// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset } = req.query;
        const notifications = await Notification.getUnreadNotifications(userId, limit, offset);
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllNotifications = async(req, res) => {
    try{
        const userId = req.user.id;
        const {limit, offset} = req.query;
        const notifications = await Notification.getAllNotifications(userId, limit, offset);
        res.json(notifications);
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
}
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.markAsRead(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.markAllAsRead(userId);
        res.json(notifications); // Hoặc trả về message
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createNotification = async(req, res) => {
    try{
        const {user_id, message} = req.body;
        const timestamp = new Date();
        const is_read = false;
        const notificationData = {user_id, message, timestamp, is_read};
        const newNotification = await Notification.create(notificationData);
        res.status(201).json(newNotification);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
}