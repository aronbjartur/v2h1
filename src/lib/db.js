
import pg from 'pg';
import { toPositiveNumberOrDefault } from './toPositiveNumberOrDefault.js';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// þetta er sýnilausn úr hopverkefni2 árið 22, þetta er user hlutinn

const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;
const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

/**
 * Execute a query on the database.
 *
 * @param {string} q Query string
 * @param {Array} values Parameterized values
 * @returns {Promise<any>} Query result or null if error
 */
export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }
  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('unable to query', e);
    return null;
  } finally {
    client.release();
  }
}

export async function deleteQuery(_query, values = []) {
  const result = await query(_query, values);
  return result ? result.rowCount : 0;
}

export async function singleQuery(_query, values = []) {
  const result = await query(_query, values);
  if (result && result.rows && result.rows.length === 1) {
    return result.rows[0];
  }
  return null;
}

export async function pagedQuery(
  sqlQuery,
  values = [],
  { offset = 0, limit = 10 } = {}
) {
  const sqlLimit = values.length + 1;
  const sqlOffset = values.length + 2;
  const q = `${sqlQuery} LIMIT $${sqlLimit} OFFSET $${sqlOffset}`;

  const limitAsNumber = toPositiveNumberOrDefault(limit, 10);
  const offsetAsNumber = toPositiveNumberOrDefault(offset, 0);

  const combinedValues = values.concat([limitAsNumber, offsetAsNumber]);

  const result = await query(q, combinedValues);

  if (!result) {
    return null;
  }

  return {
    limit: limitAsNumber,
    offset: offsetAsNumber,
    items: result.rows,
  };
}

export async function end() {
  await pool.end();
}

export async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i) =>
      typeof i === 'string' ||
      typeof i === 'number' ||
      i instanceof Date
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);
  const result = await query(q, queryValues);
  return result;
}

// sýnilausn verkefni 2, þetta er transactions partur

/**
 * Class for transaction-related operations.
 */
export class TransactionDatabase {
  /**
   * Retrieve all transactions for a given user.
   *
   * @param {number} userId
   * @returns {Promise<Array<Object>>} Array of transaction objects.
   */
  async getTransactions(userId) {
    const q = `
      SELECT id, user_id, transaction_type, category, amount, date, description 
      FROM transactions 
      WHERE user_id = $1 
      ORDER BY date DESC
    `;
    const result = await query(q, [userId]);
    if (result && result.rows) {
      return result.rows;
    }
    return [];
  }

  /**
   * Create a new transaction for a user.
   *
   * @param {number} userId 
   * @param {string} transaction_type - 'income' or 'deposit'
   * @param {string} category - e.g., for income: 'gift', 'job', 'other'; for deposit: 'food', 'car', 'rent', 'other'
   * @param {number} amount 
   * @param {string} date - ISO8601 date string
   * @param {string} description 
   * @returns {Promise<Object|null>} The new transaction or null if failed.
   */
  async createTransaction(userId, transaction_type, category, amount, date, description) {
    const q = `
      INSERT INTO transactions (user_id, transaction_type, category, amount, date, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, transaction_type, category, amount, date, description
    `;
    const values = [userId, transaction_type, category, amount, date, description];
    const result = await query(q, values);
    if (result && result.rows.length === 1) {
      return result.rows[0];
    }
    return null;
  }
}

// Singleton instance for TransactionDatabase
let tdb = null;

/**
 * Returns a singleton instance of TransactionDatabase.
 *
 * @returns {TransactionDatabase | null}
 */
export function getFinanceDatabase() {
  if (tdb) {
    return tdb;
  }
  tdb = new TransactionDatabase();
  return tdb;
}