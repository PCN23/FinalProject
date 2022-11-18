import { Router }  from 'express';
// import {authenticate} from '../middleware/authenticate';
// import {authorize} from '../middleware/authorize';
// import User from '../models/User';
import UserService from '../services/UserService';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

export default Router().post('/', async (req, res, next) => {
    try {
    const user = await UserService.create(req.body);
    res.json(user);
      res.send('hello world from here')
    } catch (error) {
    next(error);
    }
});
