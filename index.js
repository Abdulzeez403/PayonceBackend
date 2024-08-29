require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const connectDB = require("./configs/db")
const session = require("express-session")
const {errorHandler} = require('./middlewares/error')
const limiter = require('./middlewares/rateLimiter')


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());

// Express session
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
//MiddleWares
app.use(limiter);
app.use(errorHandler);




// Routes
app.use('/api/pay',require('./routes/paymentRoute'));
app.use('/api/auth', require('./routes/userRoute'));

connectDB();
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
