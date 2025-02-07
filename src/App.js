import React, { useState, useEffect } from 'react';
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
  Box,
  Grid,
  Divider
} from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useCelsius, setUseCelsius] = useState(true);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    if (!API_KEY) {
      setError('API key is not configured properly');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, get coordinates from city name
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
      const geoResponse = await axios.get(geoUrl);
      
      if (geoResponse.data.length === 0) {
        throw new Error('City not found');
      }

      const { lat, lon } = geoResponse.data[0];

      // Get current weather
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const weatherResponse = await axios.get(weatherUrl);
      setWeatherData(weatherResponse.data);

      // Get forecast data (includes hourly and daily)
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const forecastResponse = await axios.get(forecastUrl);
      setForecastData(forecastResponse.data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch weather data');
      setWeatherData(null);
      setForecastData(null);
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

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        <>
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

          {forecastData && (
            <>
              {/* Hourly Forecast */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    48-Hour Forecast
                  </Typography>
                  <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
                    {forecastData.list.slice(0, 16).map((hour, index) => (
                      <Box
                        key={hour.dt}
                        sx={{
                          minWidth: 100,
                          textAlign: 'center',
                          mr: 2,
                          borderRight: index !== 15 ? '1px solid #eee' : 'none',
                          pr: 2
                        }}
                      >
                        <Typography variant="body2">
                          {formatTime(hour.dt)}
                        </Typography>
                        <Typography variant="h6">
                          {convertTemp(hour.main.temp)}
                        </Typography>
                        <img
                          src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                          alt={hour.weather[0].description}
                        />
                        <Typography variant="body2">
                          {hour.weather[0].main}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* 5-Day Forecast */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    5-Day Forecast
                  </Typography>
                  <Grid container spacing={2}>
                    {forecastData.list
                      .filter((item, index) => index % 8 === 0)
                      .slice(0, 5)
                      .map((day) => (
                        <Grid item xs={12} sm={6} md={2.4} key={day.dt}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 2,
                              border: '1px solid #eee',
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="subtitle1">
                              {formatDate(day.dt)}
                            </Typography>
                            <img
                              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                              alt={day.weather[0].description}
                            />
                            <Typography variant="h6">
                              {convertTemp(day.main.temp)}
                            </Typography>
                            <Typography variant="body2">
                              {day.weather[0].main}
                            </Typography>
                            <Typography variant="body2">
                              H: {convertTemp(day.main.temp_max)}
                            </Typography>
                            <Typography variant="body2">
                              L: {convertTemp(day.main.temp_min)}
                            </Typography>
                          </Box>
                        </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default App;
