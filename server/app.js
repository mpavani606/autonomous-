const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { CLIENT_URL } = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const corsOrigins = new Set([CLIENT_URL]);
if (process.env.NODE_ENV !== 'production') {
  corsOrigins.add('http://localhost:5173');
  corsOrigins.add('http://127.0.0.1:5173');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
