const chatRepo       = require('../repositories/chatRepository');
const enrollmentRepo = require('../repositories/enrollmentRepository');
const courseRepo     = require('../repositories/courseRepository');
const { verifyAccessToken } = require('../utils/tokenUtils');

module.exports = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: no token'));
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.first_name} ${socket.user.last_name} (${socket.user.role})`);

    socket.join(`user_${socket.user.id}`);

    // ── JOIN ────────────────────────────────────────────────────
    socket.on('chat:join', async ({ courseId }) => {
      try {
        const userId = socket.user.id;
        const role   = socket.user.role;

        if (role === 'professor') {
          socket.emit('chat:error', { message: 'Professors do not have access to the student chat.' });
          return;
        }

        if (role === 'admin') {
          socket.join(`course_${courseId}`);
          socket.emit('chat:joined', { courseId, monitor: true });
          return;
        }

        if (role === 'student') {
          const enrolled = await enrollmentRepo.findByUserAndCourse(userId, courseId);
          if (!enrolled) {
            socket.emit('chat:error', { message: 'You are not enrolled in this course.' });
            return;
          }
          socket.join(`course_${courseId}`);
          socket.emit('chat:joined', { courseId, monitor: false });
          return;
        }

        socket.emit('chat:error', { message: 'Access denied.' });
      } catch {
        socket.emit('chat:error', { message: 'Server error.' });
      }
    });

    // ── SEND ────────────────────────────────────────────────────
    socket.on('chat:send', async ({ courseId, message }) => {
      try {
        if (socket.user.role !== 'student') {
          socket.emit('chat:error', { message: 'Only students can send messages.' });
          return;
        }
        if (!socket.rooms.has(`course_${courseId}`)) {
          socket.emit('chat:error', { message: 'Join the chat room first.' });
          return;
        }
        if (!message || message.trim().length === 0) return;
        if (message.length > 1000) {
          socket.emit('chat:error', { message: 'Message too long.' });
          return;
        }

        const saved = await chatRepo.saveMessage({
          course_id:   courseId,
          sender_id:   socket.user.id,
          sender_name: `${socket.user.first_name} ${socket.user.last_name}`,
          message:     message.trim(),
        });

        io.to(`course_${courseId}`).emit('chat:message', {
          _id:         saved._id,
          course_id:   saved.course_id,
          sender_id:   saved.sender_id,
          sender_name: saved.sender_name,
          message:     saved.message,
          is_edited:   saved.is_edited,
          is_deleted:  saved.is_deleted,
          createdAt:   saved.createdAt,
        });

      } catch {
        socket.emit('chat:error', { message: 'Failed to send message.' });
      }
    });

    // ── EDIT ────────────────────────────────────────────────────
    socket.on('chat:edit', async ({ courseId, messageId, newMessage }) => {
      try {
        if (socket.user.role !== 'student') return;

        const existing = await chatRepo.findMessageById(messageId);
        if (!existing) {
          socket.emit('chat:error', { message: 'Message not found.' });
          return;
        }

        // Only the original sender can edit
        if (existing.sender_id !== socket.user.id) {
          socket.emit('chat:error', { message: 'You can only edit your own messages.' });
          return;
        }

        if (existing.is_deleted) {
          socket.emit('chat:error', { message: 'Cannot edit a deleted message.' });
          return;
        }

        if (!newMessage || newMessage.trim().length === 0) return;
        if (newMessage.length > 1000) {
          socket.emit('chat:error', { message: 'Message too long.' });
          return;
        }

        const updated = await chatRepo.editMessage(messageId, newMessage.trim());

        // Broadcast the edit to everyone in the room
        io.to(`course_${courseId}`).emit('chat:edited', {
          _id:       updated._id,
          message:   updated.message,
          is_edited: updated.is_edited,
          edited_at: updated.edited_at,
        });

      } catch {
        socket.emit('chat:error', { message: 'Failed to edit message.' });
      }
    });

    // ── DELETE ──────────────────────────────────────────────────
    socket.on('chat:delete', async ({ courseId, messageId }) => {
      try {
        if (socket.user.role !== 'student') return;

        const existing = await chatRepo.findMessageById(messageId);
        if (!existing) {
          socket.emit('chat:error', { message: 'Message not found.' });
          return;
        }

        // Only the original sender can delete
        if (existing.sender_id !== socket.user.id) {
          socket.emit('chat:error', { message: 'You can only delete your own messages.' });
          return;
        }

        const updated = await chatRepo.softDeleteMessage(messageId);

        // Broadcast deletion to everyone in the room
        io.to(`course_${courseId}`).emit('chat:deleted', {
          _id:        updated._id,
          message:    updated.message,
          is_deleted: updated.is_deleted,
        });

      } catch {
        socket.emit('chat:error', { message: 'Failed to delete message.' });
      }
    });

    // ── TYPING ──────────────────────────────────────────────────
    socket.on('chat:typing', ({ courseId }) => {
      if (socket.user.role !== 'student') return;
      // Broadcast to everyone in room EXCEPT the sender
      socket.to(`course_${courseId}`).emit('chat:typing', {
        sender_id:   socket.user.id,
        sender_name: `${socket.user.first_name} ${socket.user.last_name}`,
      });
    });

    socket.on('chat:stop_typing', ({ courseId }) => {
      if (socket.user.role !== 'student') return;
      socket.to(`course_${courseId}`).emit('chat:stop_typing', {
        sender_id: socket.user.id,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user?.first_name} ${socket.user?.last_name} (${socket.user?.role})`);
    });
  });

};