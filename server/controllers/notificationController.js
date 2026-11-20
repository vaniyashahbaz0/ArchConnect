import Notification from '../models/Notification.js';

const isValidId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(notifications);
};

export const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({ count });
};

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ message: 'All notifications marked as read' });
};

export const markAsRead = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }

  notification.isRead = true;
  await notification.save();

  res.json(notification);
};
