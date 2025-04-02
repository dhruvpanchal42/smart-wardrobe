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
const cameraRoutes = require('./routes/camera');
const esp32Routes = require('./routes/esp32'); // Add ESP32 routes

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(flash())
app.use(express.static(path.join(__dirname,'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Trust first proxy for secure cookies behind reverse proxies
app.set('trust proxy', 1);

// Add this middleware to handle redirects
app.use((req, res, next) => {
    // Get the host from the request
    const host = req.get('host');
    // Set a local variable for views to use
    res.locals.baseUrl = `${req.protocol}://${host}`;
    next();
});

// Initialize Passport.js for OAuth
app.use(passport.initialize());
app.use(passport.session()); 

// Define routes
app.use('/', indexRouter);
app.use('/users', forgotPasswordRoutes);
app.use('/users', userRouter);
app.use('/clothes', clothRouter);
app.use(weatherRoute);
app.use('/api/gemini', geminiRoutes);
app.use('/camera', cameraRoutes);
app.use('/esp32', esp32Routes); // Add ESP32 routes

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
