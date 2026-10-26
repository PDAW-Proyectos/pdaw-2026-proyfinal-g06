const express = require('express');
const session = require('express-session');
const path = require('path');
const { randomBytes } = require('crypto');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/api/auth', authRoutes);

module.exports = app;