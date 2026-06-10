const notifRepo = require('../repositories/notificationRepository');

let _io = null;

// Called once in server.js to inject io
const init = (io) => { _io = io; };

/**
 * Send a notification to one user.
 * @param {number} userId
 * @param {string} type      - e.g. 'enrollment', 'new_lesson', 'announcement'
 * @param {string} title
 * @param {string} message
 */
const send = async (userId, type, title, message) => {
  // 1. Save to MySQL
  const notif = await notifRepo.create({ user_id: userId, type, title, message });

  // 2. Emit in real-time if user is connected
  if (_io) {
    _io.to(`user_${userId}`).emit('notification:new', {
      id:         notif.id,
      type:       notif.type,
      title:      notif.title,
      message:    notif.message,
      is_read:    notif.is_read,
      created_at: notif.created_at,
    });
  }

  return notif;
};

module.exports = { init, send };