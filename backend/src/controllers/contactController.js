const contactService = require('../services/contactService');

// POST /api/contact
const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const user_id = req.user.id; // always present, route is protected

    const result = await contactService.sendMessage({ user_id, name, email, subject, message });
    return res.status(201).json({ message: 'Message sent successfully.', data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Server error.' });
  }
};

// GET /api/contact  — admin only
const getAllMessages = async (req, res) => {
  try {
    const messages = await contactService.getAllMessages();
    return res.status(200).json({ messages });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/contact/:id/read  — admin only
const markAsRead = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await contactService.markAsRead(id);
    return res.status(200).json({ message: 'Marked as read.', data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Server error.' });
  }
};

module.exports = { sendMessage, getAllMessages, markAsRead };