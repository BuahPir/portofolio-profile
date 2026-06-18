import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WeatherDashboard from './pages/WeatherDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/weather_dashboard" element={<WeatherDashboard />} />
    </Routes>
  )
}

export default App
