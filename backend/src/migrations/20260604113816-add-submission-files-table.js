'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    console.log('>>> STEP 1: adding submitted_at to Submissions');
    await queryInterface.addColumn('Submissions', 'submitted_at', {
      type:         Sequelize.DATE,
      allowNull:    true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    console.log('>>> STEP 2: adding is_late to Submissions');
    await queryInterface.addColumn('Submissions', 'is_late', {
      type:         Sequelize.TINYINT,
      allowNull:    false,
      defaultValue: 0
    });

    console.log('>>> STEP 3: removing FK constraint fk_submissions_file');
    await queryInterface.removeConstraint(
      'Submissions',
      'fk_submissions_file'
    );

    console.log('>>> STEP 4: removing column file_id from Submissions');
    await queryInterface.removeColumn('Submissions', 'file_id');

    console.log('>>> STEP 5: creating table SubmissionFiles');
    await queryInterface.createTable('SubmissionFiles', {

      id: {
        type:          Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
        allowNull:     false
      },

      submission_id: {
        type:      Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Submissions',
          key:   'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      file_id: {
        type:      Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Files',
          key:   'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      created_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }

    });

    console.log('>>> DONE');
  },

  async down(queryInterface, Sequelize) {

    console.log('>>> UNDO STEP 1: dropping SubmissionFiles');
    await queryInterface.dropTable('SubmissionFiles');

    console.log('>>> UNDO STEP 2: adding back file_id to Submissions');
    await queryInterface.addColumn('Submissions', 'file_id', {
      type:      Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Files',
        key:   'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    console.log('>>> UNDO STEP 3: removing is_late');
    await queryInterface.removeColumn('Submissions', 'is_late');

    console.log('>>> UNDO STEP 4: removing submitted_at');
    await queryInterface.removeColumn('Submissions', 'submitted_at');

    console.log('>>> UNDO DONE');
  }
};