require('dotenv').config();

const fs = require('fs');
const path = require('path');

// ── Krijo folder-at automatikisht nëse nuk ekzistojnë ────────
[
  'uploads/assignments',
  'uploads/submissions',
  'uploads/thumbnails',
  'uploads/lessons',
  'uploads/imports', // ← i ri, nevojitet për import CSV/Excel
].forEach((dir) => {
  const full = path.join(__dirname, '..', dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`Created: ${full}`);
  }
});

const app = require('./app');
const { sequelize } = require('./models');

const seedPermissions = require('./utils/seedPermissions');

const http = require('http');
const { Server } = require('socket.io');

const connectMongoDB = require('./config/mongodb');
const chatSocket = require('./sockets/chatSocket');

const notificationService = require('./utils/notificationService');
const notificationRoutes  = require('./routes/notificationRoutes');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // MySQL connection
    await sequelize.authenticate();
    console.log('MySQL connected successfully.');

    await seedPermissions();

    // MongoDB connection
    await connectMongoDB();
    console.log('MongoDB connected successfully.');

    // Create HTTP server
    const server = http.createServer(app);

    // Socket.IO
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    // Chat socket handlers
    chatSocket(io);
    notificationService.init(io);
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();