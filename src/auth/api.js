import express from 'express';
import jwt from 'jsonwebtoken';
import { catchErrors } from '../lib/catchErrors.js';
import { logger } from '../lib/logger.js';
import { validationCheck } from '../validation/helpers.js';
import {
  usernameValidator,
  emailValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  usernameAndPaswordValidValidator,
  emailDoesNotExistValidator,
  atLeastOneBodyValueValidator
} from '../validation/validators.js';
import { jwtOptions, requireAdmin, tokenOptions } from './passport.js';
import { createUser, findById, findByUsername, updateUser, comparePasswords } from './users.js';

export const router = express.Router();

async function registerRoute(req, res) {
  const { username, email, password = '' } = req.body;
  const user = await createUser(username, email, password);
  if (!user) {
    return res.status(400).json({ error: 'Unable to register user.' });
  }
  delete user.password;
  return res.status(201).json(user);
}

async function loginRoute(req, res) {
  const { username, password } = req.body;
  const user = await findByUsername(username);
  if (!user) {
    logger.error('Unable to find user', username);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await comparePasswords(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  delete user.password;
  return res.json({
    user,
    token,
    expiresIn: tokenOptions.expiresIn,
  });
}

async function currentUserRoute(req, res) {
  const { user: { id } = {} } = req;
  const user = await findById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  delete user.password;
  return res.json(user);
}

async function updateCurrentUserRoute(req, res) {
  const { id } = req.user;
  const user = await findById(id);
  if (!user) {
    logger.error('Unable to update user by id', id);
    return res.status(500).json(null);
  }
  const { password, email } = req.body;
  const result = await updateUser(id, password, email);
  if (!result) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  return res.status(200).json(result);
}

router.post(
  '/users/register',
  usernameValidator,
  emailValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  emailDoesNotExistValidator,
  validationCheck, 
  catchErrors(registerRoute)
);


router.post(
  '/users/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  catchErrors(loginRoute)
);

router.get('/users/me', requireAdmin, catchErrors(currentUserRoute));


router.patch(
  '/users/me',
  requireAdmin,
  emailValidator,
  passwordValidator,
  emailDoesNotExistValidator,
  atLeastOneBodyValueValidator(['email', 'password']),
  validationCheck,
  catchErrors(updateCurrentUserRoute)
);