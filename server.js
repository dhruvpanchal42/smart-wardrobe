const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const app = express();
const http = require('http').createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Store last received ESP32 data
let lastData = {
    test: 'Waiting for data...',
    counter: 0,
    wifi_strength: 0,
    lastUpdate: 'Never'
};

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { messages: req.flash(), email: '' });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { sensorData: lastData });
});

// ESP32 data endpoints
app.post('/esp32data', (req, res) => {
    lastData = {
        ...req.body,
        lastUpdate: new Date().toLocaleTimeString()
    };
    console.log('Received data:', lastData);
    res.sendStatus(200);
});

app.get('/esp32data', (req, res) => {
    res.json(lastData);
});

// User routes
app.use('/users', require('./routes/users'));

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main application: http://localhost:${PORT}`);
}); 