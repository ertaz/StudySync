const { Notification } = require('../models');

const create = (data) => Notification.create(data);

const getByUser = (user_id) =>
  Notification.findAll({
    where: { user_id },
    order: [['created_at', 'DESC']],
    limit: 30,
  });

const markAsRead = (id, user_id) =>
  Notification.update({ is_read: true }, { where: { id, user_id } });

const markAllAsRead = (user_id) =>
  Notification.update({ is_read: true }, { where: { user_id, is_read: false } });

const getUnreadCount = (user_id) =>
  Notification.count({ where: { user_id, is_read: false } });

module.exports = { create, getByUser, markAsRead, markAllAsRead, getUnreadCount };