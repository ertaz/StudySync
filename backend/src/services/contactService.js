const contactRepo = require('../repositories/contactRepository');

const sendMessage = async ({ user_id, name, email, subject, message }) => {
  if (!name || !email || !subject || !message) {
    throw { status: 400, message: 'All fields are required.' };
  }
  return await contactRepo.create({ user_id, name, email, subject, message });
};

const getAllMessages = async () => {
  return await contactRepo.findAll();
};

const markAsRead = async (id) => {
  return await contactRepo.markAsRead(id);
};

module.exports = { sendMessage, getAllMessages, markAsRead };