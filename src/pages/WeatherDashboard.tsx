import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import './WeatherDashboard.css'

interface WeatherData {
  city: string
  country: string
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  condition: string
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code] ?? 'Unknown'
}

async function fetchWeather(cityName: string): Promise<WeatherData> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
  )

  if (!geoRes.ok) {
    throw new Error('Failed to look up city. Please try again.')
  }

  const geoData = await geoRes.json()

  if (!geoData.results?.length) {
    throw new Error(`City "${cityName}" not found. Try another name.`)
  }

  const { name, country, latitude, longitude } = geoData.results[0]

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`,
  )

  if (!weatherRes.ok) {
    throw new Error('Failed to fetch weather data. Please try again.')
  }

  const weatherData = await weatherRes.json()
  const current = weatherData.current

  return {
    city: name,
    country,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    condition: getWeatherDescription(current.weather_code),
  }
}

function WeatherDashboard() {
  const [query, setQuery] = useState('Jakarta')
  const [weather, setWeather] = useState<WeatherData | null>(() => null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadWeather = useCallback(async (city: string) => {
    const trimmed = city.trim()
    if (!trimmed) {
      setError('Please enter a city name.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await fetchWeather(trimmed)
      setWeather(data)
    } catch (err) {
      setWeather(null)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void (async () => {
      await loadWeather('Jakarta')
    })()
    return () => controller.abort()
  }, [loadWeather])

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    loadWeather(query)
  }

  return (
    <div className="weather-page">
      <header className="weather-header">
        <div className="weather-header-top">
          <Link to="/" className="back-link">
            &larr; Back to Portfolio
          </Link>
          <ThemeToggle />
        </div>
        <h1>Weather Dashboard</h1>
      </header>

      <main className="weather-main">
        <p className="weather-intro">
          Search a city to see live weather from{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="weather-api-link"
          >
            Open-Meteo
          </a>
          .
        </p>

        <form className="weather-search" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter city name..."
            aria-label="City name"
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="weather-error">{error}</p>}

        {loading && !weather && (
          <p className="weather-loading">Loading weather data...</p>
        )}

        {weather && (
          <div className="weather-card">
            <p className="weather-city">
              {weather.city}, {weather.country}
            </p>
            <p className="weather-temp">{Math.round(weather.temperature)}°C</p>
            <p className="weather-condition">{weather.condition}</p>
            <ul className="weather-details">
              <li>Humidity: {weather.humidity}%</li>
              <li>Wind: {Math.round(weather.windSpeed)} km/h</li>
              <li>
                Feels like: {Math.round(weather.apparentTemperature)}°C
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}

export default WeatherDashboard
