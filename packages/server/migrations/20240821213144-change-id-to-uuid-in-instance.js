'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add a temporary UUID column
    await queryInterface.addColumn('Instances', 'temp_uuid', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: uuidv4,
    });

    // Step 2: Populate the temp UUID column with UUIDs for existing records
    const instances = await queryInterface.sequelize.query(
      'SELECT id FROM "Instances";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const instance of instances) {
      await queryInterface.bulkUpdate(
        'Instances',
        { temp_uuid: uuidv4() },
        { id: instance.id }
      );
    }

    // Step 3: Change the primary key from `id` (INTEGER) to `temp_uuid` (STRING)
    await queryInterface.removeColumn('Instances', 'id');
    await queryInterface.renameColumn('Instances', 'temp_uuid', 'id');

    // Step 4: Set the new `id` column as the primary key
    await queryInterface.changeColumn('Instances', 'id', {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes if needed
    await queryInterface.addColumn('Instances', 'temp_id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    });

    const instances = await queryInterface.sequelize.query(
      'SELECT id FROM "Instances";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    let autoIncrementValue = 1;
    for (const instance of instances) {
      await queryInterface.bulkUpdate(
        'Instances',
        { temp_id: autoIncrementValue++ },
        { id: instance.id }
      );
    }

    await queryInterface.removeColumn('Instances', 'id');
    await queryInterface.renameColumn('Instances', 'temp_id', 'id');
    await queryInterface.changeColumn('Instances', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    });
  },
};
