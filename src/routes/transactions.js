import express from 'express';
import { validationResult } from 'express-validator';
import { getFinanceDatabase } from '../lib/db.js';
import { catchErrors } from '../lib/handlers.js';
import {
  createTransactionValidationMiddleware,
  sanitizationMiddleware,
  xssSanitizationMiddleware,
} from '../lib/validation.js';

export const router = express.Router();

/**
 * GET /
 * Render the transactions list for the logged-in user.
 */
async function indexRoute(req, res) {
  let message = '';
  if (
    'messages' in req.session &&
    req.session.messages &&
    Array.isArray(req.session.messages)
  ) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  const transactions = await getFinanceDatabase()?.getTransactions(req.user.id);
  res.render('index', {
    title: 'Heimilisfjárskráning',
    transactions,
    message,
  });
}


async function newTransactionFormRoute(req, res) {
  res.render('transaction-form', { title: 'Bæta við færslu', data: {} });
}


async function validationCheckMiddleware(req, res, next) {
  const { transaction_type, category, amount, date, description } = req.body;
  const data = { transaction_type, category, amount, date, description };
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('transaction-form', {
      title: 'Bæta við færslu',
      data,
      errors: validation.array(),
    });
  }
  return next();
}


async function createTransactionRoute(req, res) {
  const { transaction_type, category, amount, date, description } = req.body;
  const data = { transaction_type, category, amount, date, description };

  const created = await getFinanceDatabase()?.createTransaction(
    req.user.id,
    transaction_type,
    category,
    amount,
    date,
    description
  );

  if (!created) {
    req.session.messages = ['Ekki tókst að bæta við færslu.'];
  } else {
    req.session.messages = ['Færslu bætt við.'];
  }

  return res.redirect('/');
}

// Routes
router.get('/', catchErrors(indexRoute));
router.get('/transactions/new', catchErrors(newTransactionFormRoute));
router.post(
  '/transactions/new',
  createTransactionValidationMiddleware(),
  xssSanitizationMiddleware(),
  catchErrors(validationCheckMiddleware),
  sanitizationMiddleware(),
  catchErrors(createTransactionRoute)
);
