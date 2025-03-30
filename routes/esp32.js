const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');

let lastData = null;
let lastUpdateTimestamp = 0;
const CONNECTION_TIMEOUT = 5000; // 5 seconds timeout

// Function to check if ESP32 is connected
function isESP32Connected() {
    return lastData !== null && (Date.now() - lastUpdateTimestamp) < CONNECTION_TIMEOUT;
}

// ESP32 monitor page
router.get('/monitor', isLoggedIn, (req, res) => {
    res.render('esp32-monitor', { 
        sensorData: isESP32Connected() ? lastData : {
            test: 'No data available',
            counter: 'N/A',
            wifi_strength: 'N/A',
            lastUpdate: 'Never'
        }
    });
});

// API endpoint for ESP32 data
router.post('/data', (req, res) => {
    lastData = {
        ...req.body,
        lastUpdate: new Date().toLocaleTimeString()
    };
    lastUpdateTimestamp = Date.now();
   
    res.sendStatus(200);
});

// Get last ESP32 data
router.get('/data', (req, res) => {
    if (!isESP32Connected()) {
        return res.status(503).json({
            error: 'ESP32 disconnected',
            lastUpdateTimestamp: lastUpdateTimestamp
        });
    }
    res.json(lastData);
});

module.exports = router; 