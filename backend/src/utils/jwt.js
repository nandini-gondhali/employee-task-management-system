import jwt from 'jsonwebtoken';

export const signToken = (payload, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || '7d'
    : process.env.JWT_EXPIRES_IN || '8h';

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
