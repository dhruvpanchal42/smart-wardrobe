const express = require('express');
// const fetch = require('node-fetch');
const router = express.Router();
require('dotenv').config();

const apiKey = process.env.WEATHER_API_KEY;


// Weather API endpoint
router.post('/api/weather', async (req, res) => {
    const location = req.body.location?.trim();
    

    if (!location) {
        return res.status(400).json({ error: 'Please enter a valid location.' });
    }

    // URL encode the location to handle special characters
    const encodedLocation = encodeURIComponent(location);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        
        if (data.cod !== 200) {
            console.error('Error from OpenWeather API:', data);  // Detailed error log
            return res.status(data.cod).json({ error: data.message });
        }

        // Process weather data as usual
        const temperature = data.main.temp;
        const weatherCondition = data.weather[0].main.toLowerCase();
        const weatherDescription = data.weather[0].description;

        let clothingSuggestion = '';
        if (temperature > 30) clothingSuggestion = 'It\'s very hot! Stay cool with breathable fabrics.';
        else if (temperature > 28) clothingSuggestion = 'It\'s quite hot! Stay hydrated and wear breathable, loose-fitting clothes.';
        else if (temperature > 25) clothingSuggestion = 'It\'s warm outside! Wear light clothing.';
        else if (temperature > 26) clothingSuggestion = 'Warm and humid outside. Opt for lightweight clothes and a hat for sun protection.';
        else if (temperature > 20) clothingSuggestion = 'It\'s moderately warm. T-shirt and comfortable pants.';
        else if (temperature > 17) clothingSuggestion = 'Mild weather. A long-sleeve shirt or light sweater should be enough.';
        else if (temperature > 15) clothingSuggestion = 'The weather is pleasant. A light jacket or sweater is perfect.';
        else if (temperature > 10) clothingSuggestion = 'It\'s chilly. Layer up with a sweater and a light coat.';
        else if (temperature > 5) clothingSuggestion = 'It\'s getting chilly! Wear a warm jacket and a scarf.';
        else if (temperature > 0) clothingSuggestion = 'It\'s cold! Bundle up with a coat, scarf, and gloves.';
        else if (temperature > -5) clothingSuggestion = 'It\'s very cold! Bundle up with a thick coat, gloves, and a hat.';
        else clothingSuggestion = 'It\'s freezing cold! Wear thermal wear, a heavy winter coat, gloves, and a woolly hat.';

        if (weatherCondition.includes('rain')) clothingSuggestion = 'It\'s raining! Wear a raincoat and carry an umbrella.';
        else if (weatherCondition.includes('snow')) clothingSuggestion = 'It\'s snowing! Wear waterproof, warm clothing.';
        else if (weatherCondition.includes('clear')) clothingSuggestion += ' The sky is clear! Enjoy the sunshine.';
        else if (weatherCondition.includes('wind')) clothingSuggestion += ' It\'s windy! Consider wearing a windbreaker or jacket to stay protected.';
        else if (weatherCondition.includes('fog')) clothingSuggestion += ' It\'s foggy! Wear bright or reflective clothing to stay visible.';
        else if (weatherCondition.includes('storm')) clothingSuggestion += ' A storm is coming! Stay indoors or wear protective gear and keep safe.';
        else if (weatherCondition.includes('cloudy')) clothingSuggestion += ' It\'s cloudy outside. A light sweater or jacket is recommended.';
        else if (weatherCondition.includes('thunderstorm')) clothingSuggestion += ' Thunderstorms ahead! Stay indoors and keep safe.';
        else if (weatherCondition.includes('humid')) clothingSuggestion += ' It\'s very humid! Go for moisture-wicking clothes to stay comfortable.';
        else if (weatherCondition.includes('clear') && temperature < 15) clothingSuggestion += ' Clear skies tonight! It might get chilly, so carry a light jacket.';


        return res.json({
            location: data.name,
            temperature,
            weatherDescription,
            clothingSuggestion,
        });

    } catch (error) {
        console.error('Error in fetching weather data:', error); // Log other unexpected errors
        return res.status(500).json({ error: 'Error fetching weather data. Please try again later.' });
    }
});

module.exports = router;
