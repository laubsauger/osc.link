import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

// Determine the environment
const env = process.env.NODE_ENV || 'development';

// Load configuration
const configPath = path.resolve(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))[env];

// Initialize Sequelize with the configuration
const sequelize = new Sequelize({
  dialect: config.dialect,
  storage: config.storage,
  ...(config.username && config.password ? {
    username: config.username,
    password: config.password,
    database: config.database,
  } : {}),
});

export default sequelize;
