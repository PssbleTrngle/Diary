import { debug } from './src/logging';

const r = require('dotenv').config({ path: './.env' });

debug('Config Loaded');

module.exports = {
   type: process.env.DB_DIALECT,
   database: process.env.DB_STORAGE ?? process.env.DB_NAME,
   synchronize: true,
   logging: process.env.DB_LOGGING === 'true',
   entities: ['src/models/**/*.ts'],
   migrations: ['src/migration/**/*.ts'],
   subscribers: ['src/subscriber/**/*.ts'],
   seeds: ['src/seeds/**/*.ts'],
   factories: ['src/factories/**/*.ts'],
   cli: {
      entitiesDir: 'src/models',
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber'
   }
};