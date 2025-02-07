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
  Box,
  Grid,
  IconButton,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
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
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
      const geoResponse = await axios.get(geoUrl);
      
      if (geoResponse.data.length === 0) {
        throw new Error('City not found');
      }

      const { lat, lon } = geoResponse.data[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const weatherResponse = await axios.get(weatherUrl);
      setWeatherData(weatherResponse.data);

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

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              mb: 4, 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2193b0, #6dd5ed)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <WbSunnyIcon sx={{ fontSize: 40 }} />
            Weather Forecast
          </Typography>

          <Box className="search-container">
            <TextField
              fullWidth
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                className: 'search-input'
              }}
              sx={{ ml: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={fetchWeather}
              disabled={loading}
              className="search-button"
              startIcon={<SearchIcon />}
              sx={{
                background: 'linear-gradient(45deg, #2193b0, #6dd5ed)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1c7a94, #5bc0db)'
                }
              }}
            >
              Search
            </Button>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={useCelsius}
                onChange={() => setUseCelsius(!useCelsius)}
                className="unit-toggle"
              />
            }
            label={useCelsius ? "Celsius" : "Fahrenheit"}
            sx={{ mb: 2 }}
          />

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress sx={{ color: '#2193b0' }} />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {weatherData && (
            <Fade in={true} timeout={500}>
              <Box>
                <Card className="weather-card" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h4" component="h2" gutterBottom>
                      {weatherData.name}, {weatherData.sys.country}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <img
                        src={getWeatherIcon(weatherData.weather[0].icon)}
                        alt={weatherData.weather[0].description}
                        className="weather-icon"
                        style={{ width: 100, height: 100 }}
                      />
                      <Typography variant="h2" component="p" sx={{ ml: 2 }}>
                        {convertTemp(weatherData.main.temp)}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {weatherData.weather[0].description.charAt(0).toUpperCase() + 
                       weatherData.weather[0].description.slice(1)}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Feels like
                        </Typography>
                        <Typography variant="h6">
                          {convertTemp(weatherData.main.feels_like)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Humidity
                        </Typography>
                        <Typography variant="h6">
                          {weatherData.main.humidity}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Wind Speed
                        </Typography>
                        <Typography variant="h6">
                          {weatherData.wind.speed} m/s
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Pressure
                        </Typography>
                        <Typography variant="h6">
                          {weatherData.main.pressure} hPa
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {forecastData && (
                  <>
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          48-Hour Forecast
                        </Typography>
                        <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
                          {forecastData.list.slice(0, 16).map((hour, index) => (
                            <Box
                              key={hour.dt}
                              className="hourly-forecast-item"
                              sx={{
                                minWidth: 120,
                                mr: 2
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                {formatTime(hour.dt)}
                              </Typography>
                              <img
                                src={getWeatherIcon(hour.weather[0].icon)}
                                alt={hour.weather[0].description}
                                className="weather-icon"
                                style={{ width: 50, height: 50 }}
                              />
                              <Typography variant="h6">
                                {convertTemp(hour.main.temp)}
                              </Typography>
                              <Typography variant="body2">
                                {hour.weather[0].main}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>

                    <Card>
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
                                <Box className="daily-forecast-item" sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    {formatDate(day.dt)}
                                  </Typography>
                                  <img
                                    src={getWeatherIcon(day.weather[0].icon)}
                                    alt={day.weather[0].description}
                                    className="weather-icon"
                                    style={{ width: 60, height: 60 }}
                                  />
                                  <Typography variant="h6">
                                    {convertTemp(day.main.temp)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {day.weather[0].main}
                                  </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="primary">
                                      H: {convertTemp(day.main.temp_max)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      L: {convertTemp(day.main.temp_min)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </>
                )}
              </Box>
            </Fade>
          )}
        </Box>
      </Fade>
    </Container>
  );
}

export default App;
