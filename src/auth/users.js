import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import xss from 'xss';
import { conditionalUpdate, query } from '../lib/db.js';
import { logger } from '../lib/logger.js';

dotenv.config();

const { BCRYPT_ROUNDS = 10 } = process.env;

export async function createUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, parseInt(BCRYPT_ROUNDS, 10));

  const q = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING *`;
  const values = [xss(username), xss(email), hashedPassword];
  const result = await query(q, values);

  return result.rows[0];
}

export async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';
  try {
    const result = await query(q, [username]);
    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    logger.error('Unable to query user by username', e);
    return null;
  }
  return null;
}

export async function findByEmail(email) {
  const q = 'SELECT * FROM users WHERE email = $1';
  try {
    const result = await query(q, [email]);
    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    logger.error('Unable to query user by email', e);
    return null;
  }
  return null;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';
  try {
    const result = await query(q, [id]);
    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    logger.error('Unable to query user by id', e);
  }
  return null;
}

export async function updateUser(id, password, email) {
  if (!Number.isInteger(Number(id))) {
    return null;
  }

  const fields = [];
  const values = [];
  
  if (password && typeof password === 'string') {
    const hashedPassword = await bcrypt.hash(password, parseInt(BCRYPT_ROUNDS, 10));
    fields.push('password');
    values.push(hashedPassword);
  }
  
  if (email && typeof email === 'string') {
    fields.push('email');
    values.push(xss(email));
  }

  fields.push('updated');
  values.push(new Date());

  const result = await conditionalUpdate('users', id, fields, values);

  if (!result) {
    return null;
  }

  const updatedUser = result.rows[0];
  delete updatedUser.password;
  return updatedUser;
}