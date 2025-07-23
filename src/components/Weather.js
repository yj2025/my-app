import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  const apiKey = process.env.REACT_APP_API_KEY;

  const fetchWeather = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      setError('도시를 찾을 수 없습니다. 다시 입력해주세요.');
      setWeatherData(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city) {
      fetchWeather();
    }
  };

  useEffect(() => {
    // 초기 로드 시 예시 도시 (예: 서울) 날씨를 가져오기
    setCity('Seoul');
    fetchWeather();
  }, []);

  return (
    <div className="weather-container">
      <h1>날씨 앱</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="도시 이름을 입력하세요 (예: Seoul)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">날씨 확인</button>
      </form>

      {error && <p className="error">{error}</p>}

      {weatherData && (
        <div className="weather-info">
          <h2>
            {weatherData.name}, {weatherData.sys.country}
          </h2>
          <p>온도: {Math.round(weatherData.main.temp)}°C</p>
          <p>날씨: {weatherData.weather[0].description}</p>
          <p>습도: {weatherData.main.humidity}%</p>
          <p>풍속: {weatherData.wind.speed} m/s</p>
          <img
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
        </div>
      )}
    </div>
  );
};

export default Weather;