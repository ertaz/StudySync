require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
const fs = require('fs');

['uploads/assignments', 'uploads/submissions'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log('MySQL connected successfully.');

    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}`
      );

      console.log(
        `Swagger docs: http://localhost:${PORT}/api/docs`
      );
    });
  } catch (err) {
    console.error('Failed to connect MySQL:', err);
    process.exit(1);
  }
};

startServer();