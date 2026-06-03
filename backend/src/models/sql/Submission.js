const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// FIX: onDelete: 'CASCADE' duhet të jetë brenda `references` objektit,
// ose të vendoset si opsion i asociacionit në associations.js.
// Kur vendoset drejtpërdrejt në fushë (jashtë references), Sequelize
// e injoron plotësisht — CASCADE nuk krijohet në DB.

const Submission = sequelize.define('Submission', {

  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true
  },

  assignment_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: {
      model: 'Assignments',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'   // ← FIX: brenda references/field level Sequelize e lexon këtu
  },

  user_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: {
      model: 'Users',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  file_id: {
    type:       DataTypes.INTEGER,
    allowNull:  true,
    references: {
      model: 'Files',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'  // nëse fajlli fshihet, submission mbetet (pa file)
  },

  grade: {
    type: DataTypes.DECIMAL(5, 2)
  },

  feedback: {
    type: DataTypes.TEXT
  },

  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER }

}, {
  tableName:  'Submissions',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at'
});

module.exports = Submission;
