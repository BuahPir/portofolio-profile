import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WeatherDashboard from './pages/WeatherDashboard'
import TaskManager from './pages/TaskManager'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/weather_dashboard" element={<WeatherDashboard />} />
      <Route path="/task_manager" element={<TaskManager />} />
    </Routes>
  )
}

export default App
