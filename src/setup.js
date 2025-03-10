import { readFile } from 'node:fs/promises';
import { Database } from './lib/db.client.js';
import { environment } from './lib/environment.js';
import { logger as loggerSingleton } from './lib/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INSERT_FILE = './sql/insert.sql';

/**
 * @param {Database} db 
 * @param {import('./lib/logger.js').Logger} logger 
 * @returns {Promise<boolean>}
 */
async function setupDbFromFiles(db, logger) {
  const dropScript = await readFile(DROP_SCHEMA_FILE, 'utf-8');
  const createScript = await readFile(SCHEMA_FILE, 'utf-8');
  const insertScript = await readFile(INSERT_FILE, 'utf-8');

  if (await db.query(dropScript)) {
    logger.info('Schema dropped.');
  } else {
    logger.info('Schema not dropped, exiting.');
    return false;
  }

  if (await db.query(createScript)) {
    logger.info('Schema created.');
  } else {
    logger.info('Schema not created, exiting.');
    return false;
  }

  if (await db.query(insertScript)) {
    logger.info('Initial data inserted.');
  } else {
    logger.info('Initial data not inserted, exiting.');
    return false;
  }

  return true;
}

async function create() {
  const logger = loggerSingleton;
  const env = environment(process.env, logger);
  if (!env) process.exit(1);
  logger.info('Starting setup');
  const db = new Database(env.connectionString, logger);
  db.open();
  const setupSuccess = await setupDbFromFiles(db, logger);
  if (!setupSuccess) process.exit(1);
  logger.info('Setup complete');
  await db.close();
}

create().catch((err) => {
  console.error('Error running setup', err);
});