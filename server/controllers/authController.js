const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const { User } = require('../models');
const { ADMIN_SIGNUP_CODE, JWT_SECRET } = require('../config/env');

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      role: user.role || 'student',
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const createUserRecord = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({
    name: name.trim(),
    email,
    password: hashedPassword,
    role,
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const role = req.body?.role || 'student';
    const adminSignupCode = req.body?.adminSignupCode;

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Account role must be student or admin.' });
    }
    if (role === 'admin') {
      if (!ADMIN_SIGNUP_CODE) {
        return res.status(503).json({ message: 'Administrator registration is not configured. Contact the server administrator.' });
      }
      const providedCode = typeof adminSignupCode === 'string' ? Buffer.from(adminSignupCode) : Buffer.alloc(0);
      const configuredCode = Buffer.from(ADMIN_SIGNUP_CODE);
      if (
        typeof adminSignupCode !== 'string'
        || providedCode.length !== configuredCode.length
        || !crypto.timingSafeEqual(providedCode, configuredCode)
      ) {
        return res.status(403).json({ message: 'A valid administrator invite code is required.' });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Account registration is temporarily unavailable.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await createUserRecord({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Login is temporarily unavailable.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'student',
    },
  });
};

module.exports = { createUserRecord, registerUser, loginUser, getProfile };
