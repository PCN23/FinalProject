import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
    try {
    const cookie = req.cookies && req.cookies[process.env.COOKIE_NAME];
    if (!cookie) throw new Error('You must be signed in to continue');
    const user = jwt.verify(cookie, process.env.JWT_SECRET);
    req.user = user;
    next();
    } catch (e) {
    e.message = 'You must be signed in to continue';
    e.status = 401;
    next(e);
    }
  };