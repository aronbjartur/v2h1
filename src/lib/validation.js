// Þetta er eitthvað rugl frá gbt, gamla var úr sýnilausn fyrir verkefni 2 og tengdist þessu ekki neitt og þurfti að breytta þessu alveg
import { body } from 'express-validator';
import xss from 'xss';

/**
 * Middleware to validate a new transaction.
 */
export function createTransactionValidationMiddleware() {
  return [
    body('transaction_type')
      .isString()
      .withMessage('Gerð færslu verður að vera strengur')
      .isIn(['income', 'deposit'])
      .withMessage("Gerð færslu verður að vera annaðhvort 'income' eða 'deposit'"),
    body('category')
      .isString()
      .withMessage('Flokkur verður að vera strengur')
      .custom((value, { req }) => {
        const type = req.body.transaction_type;
        if (!type) {
          throw new Error('Gerð færslu verður að vera skilgreind til að sanna flokk');
        }
        if (type === 'income') {
          const allowedIncomeCategories = ['gift', 'job', 'other'];
          if (!allowedIncomeCategories.includes(value)) {
            throw new Error(
              `Fyrir income færslur verður flokkur að vera einn af: ${allowedIncomeCategories.join(', ')}`
            );
          }
        } else if (type === 'deposit') {
          const allowedDepositCategories = ['food', 'car', 'rent', 'other'];
          if (!allowedDepositCategories.includes(value)) {
            throw new Error(
              `Fyrir deposit færslur verður flokkur að vera einn af: ${allowedDepositCategories.join(', ')}`
            );
          }
        }
        return true;
      }),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Upphæð verður að vera tala stærri en 0'),
    body('date')
      .isISO8601()
      .withMessage('Dagsetning verður að vera ISO8601 dagsetning'),
    body('description')
      .optional()
      .isString()
      .withMessage('Lýsing verður að vera strengur'),
  ];
}

/**
 * Middleware for XSS sanitization.
 */
export function xssSanitizationMiddleware() {
  return [
    body('transaction_type').customSanitizer((v) => xss(v)),
    body('category').customSanitizer((v) => xss(v)),
    body('amount').customSanitizer((v) => xss(v)),
    body('date').customSanitizer((v) => xss(v)),
    body('description').customSanitizer((v) => xss(v)),
  ];
}

/**
 * Middleware for further sanitization: trimming and escaping input.
 */
export function sanitizationMiddleware() {
  return [
    body('transaction_type').trim().escape(),
    body('category').trim().escape(),
    // For amount, converting to float is preferred:
    body('amount').toFloat(),
    body('date').trim().escape(),
    body('description').trim().escape(),
  ];
}