const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance for PostgreSQL connection
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'airbnb_clone', 
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'postgres',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: 'postgres',
    logging: console.log, // Set to false to disable SQL query logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;