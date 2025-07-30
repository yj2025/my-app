import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentCities, setRecentCities] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const apiKey = process.env.REACT_APP_API_KEY;

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          setError('위치 정보를 가져올 수 없습니다.');
          setLoading(false);
        }
      );
    } else {
      setError('브라우저가 위치 서비스를 지원하지 않습니다.');
      setLoading(false);
    }
  };

  // 좌표로 날씨 정보 가져오기
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=kr`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=kr`
        )
      ]);
      
      setWeatherData(weatherResponse.data);
      setForecastData(forecastResponse.data);
      setCurrentLocation({ lat, lon });
      setError('');
      setLoading(false);
    } catch (err) {
      setError('날씨 정보를 가져올 수 없습니다.');
      setWeatherData(null);
      setForecastData(null);
      setLoading(false);
    }
  };

  // 도시명으로 날씨 정보 가져오기
  const fetchWeather = async () => {
    if (!city.trim()) return;
    
    try {
      setLoading(true);
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=kr`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}&lang=kr`
        )
      ]);
      
      setWeatherData(weatherResponse.data);
      setForecastData(forecastResponse.data);
      setError('');
      
      // 최근 검색 도시 추가
      const newCity = weatherResponse.data.name;
      setRecentCities(prev => {
        const filtered = prev.filter(c => c !== newCity);
        return [newCity, ...filtered].slice(0, 5); // 최대 5개
      });
      
      setLoading(false);
    } catch (err) {
      setError('도시를 찾을 수 없습니다. 다시 입력해주세요.');
      setWeatherData(null);
      setForecastData(null);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  const handleRecentCityClick = (cityName) => {
    setCity(cityName);
    setTimeout(() => fetchWeather(), 0);
  };

  // 온도에 따른 색상 클래스
  const getTempColorClass = (temp) => {
    if (temp >= 30) return 'temp-hot';
    if (temp >= 20) return 'temp-warm';
    if (temp >= 10) return 'temp-cool';
    return 'temp-cold';
  };

  // 시간 포맷팅
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 5일 예보 데이터 처리
  const getDailyForecast = () => {
    if (!forecastData) return [];
    
    const daily = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daily[date]) {
        daily[date] = {
          date: new Date(item.dt * 1000),
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      } else {
        daily[date].temp_min = Math.min(daily[date].temp_min, item.main.temp_min);
        daily[date].temp_max = Math.max(daily[date].temp_max, item.main.temp_max);
      }
    });
    
    return Object.values(daily).slice(0, 5);
  };

  useEffect(() => {
    // 초기 로드 시 서울 날씨를 가져오기
    setCity('Seoul');
    fetchWeather();
  }, []);

  return (
    <div className="weather-container">
      <h1>🌤️ 날씨 앱</h1>
      
      <div className="search-section">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="도시 이름을 입력하세요 (예: Seoul, 부산)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !city.trim()}>
              {loading ? '검색중...' : '🔍 검색'}
            </button>
          </div>
        </form>
        
        <button 
          className="location-btn" 
          onClick={getCurrentLocation}
          disabled={loading}
        >
          📍 현재 위치 날씨
        </button>
      </div>

      {/* 최근 검색 도시 */}
      {recentCities.length > 0 && (
        <div className="recent-cities">
          <h3>최근 검색</h3>
          <div className="recent-cities-list">
            {recentCities.map((cityName, index) => (
              <button
                key={index}
                className="recent-city-btn"
                onClick={() => handleRecentCityClick(cityName)}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="loading">날씨 정보를 불러오는 중...</div>}
      {error && <p className="error">❌ {error}</p>}

      {weatherData && (
        <>
          {/* 현재 날씨 */}
          <div className="weather-info">
            <div className="weather-header">
              <h2>
                📍 {weatherData.name}, {weatherData.sys.country}
              </h2>
              <p className="update-time">
                마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
              </p>
            </div>
            
            <div className="current-weather">
              <div className="weather-main">
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                  alt="weather icon"
                  className="weather-icon"
                />
                <div className="temperature">
                  <span className={`temp-value ${getTempColorClass(weatherData.main.temp)}`}>
                    {Math.round(weatherData.main.temp)}°C
                  </span>
                  <p className="weather-desc">{weatherData.weather[0].description}</p>
                </div>
              </div>
              
              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-label">체감온도</span>
                  <span className="detail-value">{Math.round(weatherData.main.feels_like)}°C</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">최고/최저</span>
                  <span className="detail-value">
                    {Math.round(weatherData.main.temp_max)}° / {Math.round(weatherData.main.temp_min)}°
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">습도</span>
                  <span className="detail-value">💧 {weatherData.main.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">풍속</span>
                  <span className="detail-value">💨 {weatherData.wind.speed} m/s</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">기압</span>
                  <span className="detail-value">{weatherData.main.pressure} hPa</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">가시거리</span>
                  <span className="detail-value">{weatherData.visibility ? `${(weatherData.visibility / 1000).toFixed(1)} km` : 'N/A'}</span>
                </div>
                {weatherData.sys.sunrise && weatherData.sys.sunset && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">일출</span>
                      <span className="detail-value">🌅 {formatTime(weatherData.sys.sunrise)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">일몰</span>
                      <span className="detail-value">🌇 {formatTime(weatherData.sys.sunset)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 5일 예보 */}
          {forecastData && (
            <div className="forecast-section">
              <h3>📅 5일 예보</h3>
              <div className="forecast-list">
                {getDailyForecast().map((day, index) => (
                  <div key={index} className="forecast-item">
                    <div className="forecast-date">
                      {index === 0 ? '오늘' : 
                       index === 1 ? '내일' : 
                       day.date.toLocaleDateString('ko-KR', { 
                         month: 'short', 
                         day: 'numeric',
                         weekday: 'short'
                       })}
                    </div>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt="forecast icon"
                      className="forecast-icon"
                    />
                    <div className="forecast-temp">
                      <span className="temp-max">{Math.round(day.temp_max)}°</span>
                      <span className="temp-min">{Math.round(day.temp_min)}°</span>
                    </div>
                    <div className="forecast-desc">{day.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Weather;