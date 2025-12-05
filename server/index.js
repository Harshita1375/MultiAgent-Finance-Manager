const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

connectDB();

require('./config/passport');

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/agent/expense', require('./routes/expenseAgentRoutes'));
app.use('/api/agent/savings', require('./routes/savingAgentRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));