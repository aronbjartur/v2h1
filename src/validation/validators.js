import { body, param, query } from 'express-validator';
import { comparePasswords, findByEmail, findByUsername } from '../auth/users.js';
import { logger } from '../lib/logger.js';
import { resourceExists } from './helpers.js';

/**
 * Collection of validators based on express-validator
 */

// þetta er sýnilausn árið 22, varla breytt, eiginlega bara eytt
export const pagingQuerystringValidator = [
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('query parameter "offset" must be an int, 0 or larger'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('query parameter "limit" must be an int, larger than 0'),
];

export function validateResourceExists(fetchResource, paramName = 'id') {
  return [
    param(paramName)
      .custom(resourceExists(fetchResource))
      .withMessage('not found'),
  ];
}

export function validateResourceNotExists(fetchResource) {
  return [
    param('id')
      .not()
      .custom(resourceExists(fetchResource))
      .withMessage('already exists'),
  ];
}

// Authentication validators
export const usernameValidator = body('username')
  .isLength({ min: 1, max: 256 })
  .withMessage('username is required, max 256 characters');

const isPatchingAllowAsOptional = (value, { req }) => {
  return !!value || req.method !== 'PATCH';
};

export const emailValidator = body('email')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 256 })
  .isEmail()
  .withMessage('email is required, max 256 characters');

export const passwordValidator = body('password')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 10, max: 256 })
  .withMessage('password is required, min 10 characters, max 256 characters');

export const emailDoesNotExistValidator = body('email').custom(
  async (email) => {
    const user = await findByEmail(email);
    if (user) {
      return Promise.reject(new Error('email already exists'));
    }
    return Promise.resolve();
  }
);

export const usernameDoesNotExistValidator = body('username').custom(
  async (username) => {
    const user = await findByUsername(username);
    if (user) {
      return Promise.reject(new Error('username already exists'));
    }
    return Promise.resolve();
  }
);

export const usernameAndPaswordValidValidator = body('username').custom(
  async (username, { req: { body: reqBody } = {} }) => {
    const { password } = reqBody;
    if (!username || !password) {
      return Promise.reject(new Error('skip'));
    }
    let valid = false;
    try {
      const user = await findByUsername(username);
      valid = await comparePasswords(password, user.password);
    } catch (e) {
      logger.info(`invalid login attempt for ${username}`);
    }
    if (!valid) {
      return Promise.reject(new Error('username or password incorrect'));
    }
    return Promise.resolve();
  }
);

export const adminValidator = body('admin')
  .exists()
  .withMessage('admin is required')
  .isBoolean()
  .withMessage('admin must be a boolean')
  .bail()
  .custom(async (admin, { req: { user, params } = {} }) => {
    const userToChange = parseInt(params.id, 10);
    if (!Number.isInteger(userToChange) || userToChange === user.id) {
      return Promise.reject(new Error('admin cannot change self'));
    }
    return Promise.resolve();
  });

export const descriptionValidator = body('description')
  .if(isPatchingAllowAsOptional)
  .isString()
  .withMessage('description must be a string');

// At least one body value validator
export function atLeastOneBodyValueValidator(fields) {
  return body().custom(async (value, { req }) => {
    const { body: reqBody } = req;
    let valid = false;
    for (const field of fields) {
      if (reqBody[field] != null) {
        valid = true;
        break;
      }
    }
    if (!valid) {
      return Promise.reject(
        new Error(`require at least one value of: ${fields.join(', ')}`)
      );
    }
    return Promise.resolve();
  });
}

// Transaction hlutinnn, þetta er copilot/gbt
export const transactionTypeValidator = body('transaction_type')
  .isIn(['income', 'deposit'])
  .withMessage('transaction type must be either "income" or "deposit"');

export const transactionCategoryValidator = body('category').custom(
  async (value, { req }) => {
    const type = req.body.transaction_type;
    if (!type) {
      return Promise.reject(new Error('transaction type is required to validate category'));
    }
    if (type === 'income') {
      const allowedIncomeCategories = ['gift', 'job', 'other'];
      if (!allowedIncomeCategories.includes(value)) {
        return Promise.reject(
          new Error(
            `For income transactions, category must be one of: ${allowedIncomeCategories.join(', ')}`
          )
        );
      }
    } else if (type === 'deposit') {
      const allowedDepositCategories = ['food', 'car', 'rent', 'other'];
      if (!allowedDepositCategories.includes(value)) {
        return Promise.reject(
          new Error(
            `For deposit transactions, category must be one of: ${allowedDepositCategories.join(', ')}`
          )
        );
      }
    } else {
      return Promise.reject(new Error('Invalid transaction type provided'));
    }
    return Promise.resolve();
  }
);

export const amountValidator = body('amount')
  .isFloat({ gt: 0 })
  .withMessage('verður að vera meira en 0');

export const dateValidator = body('date')
  .isISO8601()
  .withMessage('veldu ISO8601 dagsetningu');

export const transactionDescriptionValidator = body('description')
  .optional({ nullable: true, checkFalsy: true })
  .isString()
  .withMessage('description must be a string');