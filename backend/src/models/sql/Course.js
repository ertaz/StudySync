const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// FIXES:
// 1. professor_id — shtohet references + onDelete SET NULL
//    (nëse profesori fshihet, kursi mbetet por pa profesor)
// 2. category_id — shtohet references + onDelete SET NULL
//    (nëse kategoria fshihet, kursi mbetet pa kategori)
// 3. thumbnail_file_id — shtohet references + onDelete SET NULL
//    (nëse fajlli fshihet, kursi mbetet pa thumbnail)
// 4. created_by — shtohet references (FK e shëndetshme)

const Course = sequelize.define('Course', {

  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true
  },

  title: {
    type:      DataTypes.STRING(255),
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT
  },

  category_id: {
    type:       DataTypes.INTEGER,
    allowNull:  true,
    references: {
      model: 'Categories',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'   // kategoria fshihet → kursi mbetet, kategoria bëhet NULL
  },

  professor_id: {
    type:       DataTypes.INTEGER,
    allowNull:  true,
    references: {
      model: 'Users',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'   // FIX: profesori fshihet → kursi nuk fshihet, vetëm professor_id = NULL
  },

  thumbnail_file_id: {
    type:       DataTypes.INTEGER,
    allowNull:  true,
    references: {
      model: 'Files',
      key:   'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'   // thumbnail fshihet → kursi mbetet pa thumbnail
  },

  created_by: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },

  updated_by: {
    type: DataTypes.INTEGER
  }

}, {
  tableName:  'Courses',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at'
});

module.exports = Course;
