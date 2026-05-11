// src/models/sql/associations.js
const Course   = require('./Course');
const Category = require('./Category');
const File     = require('./File');

Course.belongsTo(Category, { foreignKey: 'category_id',       as: 'category'  });
Category.hasMany(Course,   { foreignKey: 'category_id',       as: 'courses'   });

Course.belongsTo(File,     { foreignKey: 'thumbnail_file_id', as: 'thumbnail' });
File.hasOne(Course,        { foreignKey: 'thumbnail_file_id', as: 'course'    });
