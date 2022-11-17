/*******************************************************************************
 * All general routes are handled in this file - all routes agnostic of the API
 * itself. This includes global middleware, general handlers (like 404 and error
 * handling) as well as static asset hosting.
 *
 * For routes for your API, see routes.ts.
 ******************************************************************************/

import dotenv from 'dotenv'
import express from 'express'
import path from 'node:path'
import routes from './routes.js'
import errorHandler from './middleware/error.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(process.env.API_PREFIX || '', routes())
// Ordinarily we'd use __dirname as a base directory, but issues that arise from
// https://github.com/kulshekhar/ts-jest/issues/1174 cause problems with not
// being able to use import.meta.url (our module equivalent of __dirname). Our
// settings are covered according to the various guides. Using $PWD (what
// process.cwd() returns) may not be safe in all occasions, but should be good
// enough since we control the deployment context.
const publicDir = path.join(process.cwd(), 'public')
app.use(express.static(publicDir))
app.use(errorHandler)

// Sending our index.html to the client on a 404 is required to make HTML5
// routes. HTML5 routes are the routes using the paths instead of the
// fake paths after the anchor (#) in the URL.
app.all('*', (req, res) => {
  res.status(404).sendFile(path.join(publicDir, 'index.html'))
})

export default app
const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const User = require('../models/User');
const UserService = require('../services/UserService');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  })
  .post('/sessions', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const sessionToken = await UserService.signIn({ email, password });

      res
        .cookie(process.env.COOKIE_NAME, sessionToken, {
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Signed in successfully!' });
    } catch (error) {
      next(error);
    }
  })
  // TODO: This route should only be accessible to signed in users
  .get('/me', authenticate, (req, res) => {
    res.json(req.user);
    
  })
  // TODO: This route should only be accessible to the admin user
  .get('/', authenticate, authorize, async (req, res, next) => {
    try {
      const users = await User.getAll();
      res.send(users);
    } catch (error) {
      next(error);
    }
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });
