// src/swagger.js

const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'StudySync API',
      version: '1.0.0',
      description: 'API documentation for StudySync backend',
    },

    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    path.join(__dirname, './routes/authRoutes.js'),
    path.join(__dirname, './routes/adminRoutes.js'),
    path.join(__dirname, './routes/categoryRoutes.js'),
    path.join(__dirname, './routes/courseRoutes.js'),
    path.join(__dirname, './routes/enrollmentRoutes.js'),
    path.join(__dirname, './routes/courseContentRoutes.js'),
    path.join(__dirname, './routes/assignmentRoutes.js'),
    path.join(__dirname, './routes/submissionRoutes.js'),
  ],
};

module.exports = swaggerJsdoc(options);