'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(
      'Assignments',
      'section_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );

    await queryInterface.addConstraint(
      'Assignments',
      {
        fields: ['section_id'],
        type: 'foreign key',
        name: 'fk_assignments_section',
        references: {
          table: 'CourseSections',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    );
  },

  async down(queryInterface) {

    await queryInterface.removeConstraint(
      'Assignments',
      'fk_assignments_section'
    );

    await queryInterface.removeColumn(
      'Assignments',
      'section_id'
    );
  }
};