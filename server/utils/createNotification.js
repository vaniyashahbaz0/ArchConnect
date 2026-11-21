import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const notifyUser = async (userId, type, message, link) => {
  try {
    const targetUserId = userId && userId._id ? userId._id : userId;

    const notification = await Notification.create({
      user: targetUserId,
      type,
      message,
      link,
    });

    return notification;
  } catch (error) {
    console.error('Failed to notify user:', error.message);
  }
};

export const notifyAdmins = async (type, message, link) => {
  try {
    const admins = await User.find({ role: 'admin' });

    if (!admins.length) {
      return [];
    }

    const notifications = await Promise.all(
      admins.map((admin) =>
        Notification.create({
          user: admin._id,
          type,
          message,
          link,
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Failed to notify admins:', error.message);
  }
};
