const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');

require('dotenv').config();

const authRoutes            = require('./routes/authRoutes');
const adminRoutes           = require('./routes/adminRoutes');
const categoryRoutes        = require('./routes/categoryRoutes');
const courseRoutes          = require('./routes/courseRoutes');
const enrollmentRoutes      = require('./routes/enrollmentRoutes');
const courseContentRoutes   = require('./routes/courseContentRoutes');
const assignmentRoutes      = require('./routes/assignmentRoutes');
const submissionRoutes      = require('./routes/submissionRoutes');
const assignmentReportRoutes = require('./routes/assignmentReportRoutes');

const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth',                   authRoutes);
app.use('/api/admin',                  adminRoutes);
app.use('/api/categories',             categoryRoutes);
app.use('/api/courses',                courseRoutes);
app.use('/api/enrollments',            enrollmentRoutes);
app.use('/api/course-content',         courseContentRoutes);
app.use('/api/assignments/reports',    assignmentReportRoutes); // ← must come before /api/assignments
app.use('/api/assignments',            assignmentRoutes);
app.use('/api/submissions',            submissionRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

module.exports = app;