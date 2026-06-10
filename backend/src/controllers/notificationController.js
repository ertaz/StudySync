const notifRepo = require('../repositories/notificationRepository');

const getAll = async (req, res) => {
  try {
    const notifications = await notifRepo.getByUser(req.user.id);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    await notifRepo.markAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await notifRepo.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, markRead, markAllRead };