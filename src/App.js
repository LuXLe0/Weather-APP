import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Switch,
  FormControlLabel,
  Box
} from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useCelsius, setUseCelsius] = useState(true);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const convertTemp = (temp) => {
    if (!useCelsius) {
      return ((temp * 9/5) + 32).toFixed(1) + '°F';
    }
    return temp.toFixed(1) + '°C';
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Weather App
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
        />
        <Button 
          variant="contained" 
          onClick={fetchWeather}
          disabled={loading}
        >
          Search
        </Button>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={useCelsius}
            onChange={() => setUseCelsius(!useCelsius)}
          />
        }
        label={useCelsius ? "Celsius" : "Fahrenheit"}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {weatherData && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h5" component="h2">
              {weatherData.name}, {weatherData.sys.country}
            </Typography>
            <Typography variant="h3" component="p" sx={{ my: 2 }}>
              {convertTemp(weatherData.main.temp)}
            </Typography>
            <Typography variant="subtitle1">
              Feels like: {convertTemp(weatherData.main.feels_like)}
            </Typography>
            <Typography variant="body1">
              {weatherData.weather[0].description.charAt(0).toUpperCase() + 
               weatherData.weather[0].description.slice(1)}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Humidity: {weatherData.main.humidity}%
              </Typography>
              <Typography variant="body2">
                Wind Speed: {weatherData.wind.speed} m/s
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default App;
