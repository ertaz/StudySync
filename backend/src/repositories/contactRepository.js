const ContactMessage = require('../models/sql/ContactMessage');

const create = async ({ user_id, name, email, subject, message }) => {
  return await ContactMessage.create({
    user_id,
    name,
    email,
    subject,
    message,
    created_by: user_id,
  });
};

const findAll = async () => {
  return await ContactMessage.findAll({
    order: [['created_at', 'DESC']],
  });
};

const markAsRead = async (id) => {
  const msg = await ContactMessage.findByPk(id);
  if (!msg) throw { status: 404, message: 'Message not found.' };
  msg.is_read = 1;
  await msg.save();
  return msg;
};

module.exports = { create, findAll, markAsRead };