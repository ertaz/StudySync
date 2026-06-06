const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    course_id:   { type: Number, required: true, index: true },
    sender_id:   { type: Number, required: true },
    sender_name: { type: String, required: true },
    message:     { type: String, required: true, maxlength: 1000 },
    is_deleted:  { type: Boolean, default: false },
    is_edited:   { type: Boolean, default: false },
    edited_at:   { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);