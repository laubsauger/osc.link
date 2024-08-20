import fs from 'fs';
import { sequelize, Instance } from './models';

async function insertData() {
  // Load JSON data
  const data = JSON.parse(fs.readFileSync('packages/server/dummy/instances.json', 'utf8'));

  // Sync database
  await sequelize.sync({ force: true });

  // Insert data into tables
  for (const instance of data) {
    await Instance.create({
      id: instance.id,
      name: instance.name,
      description: instance.description,
      settings: instance.settings
    });
  }

  console.log('Data inserted successfully');
}

insertData().catch(err => console.error(err));