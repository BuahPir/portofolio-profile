import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WeatherDashboard from './pages/WeatherDashboard'
import ProjectDashboard from './pages/ProjectDashboard'
import TaskManager from './pages/TaskManager'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/weather_dashboard" element={<WeatherDashboard />} />
      <Route path="/task_manager" element={<ProjectDashboard />} />
      <Route path="/task_manager/:projectId" element={<TaskManager />} />
    </Routes>
  )
}

export default App
