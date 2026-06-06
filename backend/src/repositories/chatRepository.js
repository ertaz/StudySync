const ChatMessage = require('../models/nosql/ChatMessage');

const saveMessage = (data) => ChatMessage.create(data);

const getMessagesByCourse = (course_id) =>
  ChatMessage.find({ course_id })
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();

const findMessageById = (id) => ChatMessage.findById(id);

const editMessage = (id, newText) =>
  ChatMessage.findByIdAndUpdate(
    id,
    { message: newText, is_edited: true, edited_at: new Date() },
    { new: true }
  );

const softDeleteMessage = (id) =>
  ChatMessage.findByIdAndUpdate(
    id,
    { is_deleted: true, message: 'This message was deleted.' },
    { new: true }
  );

module.exports = {
  saveMessage,
  getMessagesByCourse,
  findMessageById,
  editMessage,
  softDeleteMessage,
};