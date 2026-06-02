const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Submission = sequelize.define('Submission',{

  id:{
    type:DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true
  },

  assignment_id:{
    type:DataTypes.INTEGER,
    allowNull:false
  },

  user_id:{
    type:DataTypes.INTEGER,
    allowNull:false
  },

  file_id:{
    type:DataTypes.INTEGER
  },

  grade:{
    type:DataTypes.DECIMAL(5,2)
  },

  feedback:{
    type:DataTypes.TEXT
  },

  created_by:DataTypes.INTEGER,
  updated_by:DataTypes.INTEGER

},{
  tableName:'Submissions',
  timestamps:true,
  createdAt:'created_at',
  updatedAt:'updated_at'
});

module.exports = Submission;