require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const expressSession = require('express-session');
const flash = require('connect-flash');
const passport = require('passport'); 
require('./config/passport'); // Load Passport configuration
const indexRouter = require('./routes/index');
const userRouter = require('./routes/userRouter');
const clothRouter = require('./routes/clothRouter')
const connectDB = require('./config/mongoose-connection');
const admin = require('firebase-admin');
const app = express();
const cors = require('cors'); // If you're working with CORS
const weatherRoute = require('./routes/weather');
const geminiRoutes = require('./routes/gemini')
const forgotPasswordRoutes = require('./routes/forgotPassword');


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash())
app.use(express.static(path.join(__dirname,'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'dcube',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Initialize Passport.js for OAuth
app.use(passport.initialize());
app.use(passport.session()); 

// Define routes
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/users', forgotPasswordRoutes);
app.use('/clothes', clothRouter);
app.use(weatherRoute);
app.use('/api/gemini', geminiRoutes);




// Static files and view engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');



// Start server and connect to MongoDB
const port = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});
