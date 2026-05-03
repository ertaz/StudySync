/**
 * Admin Seeder
 */

require('dotenv').config();
const bcrypt     = require('bcryptjs');
const sequelize  = require('../config/db');

// Import models so Sequelize knows the associations
const User     = require('../models/sql/User');
const Role     = require('../models/sql/Role');
const UserRole = require('../models/sql/UserRole');

// Set up associations needed for the seed
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@studysync.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_FIRST    = process.env.ADMIN_FIRST    || 'Super';
const ADMIN_LAST     = process.env.ADMIN_LAST     || 'Admin';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅  MySQL connected.');

    // 1. Check if admin already exists
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log('⚠️   Admin already exists. Skipping seed.');
      process.exit(0);
    }

    // 2. Hash password
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // 3. Create admin user
    const admin = await User.create({
      first_name:    ADMIN_FIRST,
      last_name:     ADMIN_LAST,
      email:         ADMIN_EMAIL,
      password_hash,
      is_active:     1,
    });

    // 4. Update created_by to own ID
    await User.update(
      { created_by: admin.id, updated_by: admin.id },
      { where: { id: admin.id } }
    );

    // 5. Find admin role and assign it
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      console.error('❌  Admin role not found. Make sure you ran schema.sql first.');
      process.exit(1);
    }

    await UserRole.create({ user_id: admin.id, role_id: adminRole.id });

    console.log('✅  Admin account created successfully!');
    console.log(`    Email:    ${ADMIN_EMAIL}`);
    console.log(`    Password: ${ADMIN_PASSWORD}`);
    console.log('    ⚠️  Change these credentials after first login!');
    process.exit(0);

  } catch (err) {
    console.error('❌  Seeder failed:', err.message);
    process.exit(1);
  }
};

seed();