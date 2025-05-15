// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId);
      return user;
    } catch (err) {
      return null;
    }
  }
  return null;
};

module.exports = auth;
