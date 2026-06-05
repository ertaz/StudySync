require('dotenv').config();

const fs   = require('fs');
const path = require('path');

// ── Krijo folder-at automatikisht nëse nuk ekzistojnë ────────
[
  'uploads/assignments',
  'uploads/submissions',
  'uploads/thumbnails',
  'uploads/lessons',
  'uploads/imports',      // ← i ri, nevojitet për import CSV/Excel
].forEach((dir) => {
  const full = path.join(__dirname, '..', dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`Created: ${full}`);
  }
});

const app              = require('./app');
const { sequelize }    = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to connect MySQL:', err);
    process.exit(1);
  }
};

startServer();