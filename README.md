# Ahmad Nadil — Portfolio

A personal portfolio website built with **React**, **TypeScript**, and **Vite**. Features a clean, responsive design with dark/light mode support.

## 🚀 Live Features

### 🏠 Home / Portfolio
- Hero section with introduction and call-to-action
- About Me section with avatar
- Skills showcase with tag badges
- Project cards with links to live demos
- Contact section with social links (GitHub, LinkedIn, X)
- Sticky navigation header

### 🌦️ Weather Dashboard
- Live weather data from [Open-Meteo API](https://open-meteo.com/)
- City search with geocoding
- Displays temperature, humidity, wind speed, and "feels like"
- Weather condition descriptions from WMO codes

### 📋 Task Manager
- Kanban board with 3 columns: **To Do**, **In Progress**, **Done**
- **Drag & drop** tasks between columns (HTML5 Drag and Drop API)
- **Add / Edit / Delete** tasks with a modal form
- **Link field** — attach URLs (e.g. Figma, GitHub) displayed as clickable badges
- **Priority badges** — Low (green), Medium (amber), High (red)
- **Stats bar** — live task counts across all columns
- **LocalStorage persistence** — tasks survive page refreshes

### 🌙 Dark / Light Mode
- Toggle available on every page (sun/moon pill button)
- Respects system preference on first visit
- Persists choice in `localStorage`
- No flash of wrong theme on load (inline init script)
- Social icons adapt color via `currentColor`

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vite.dev/) | Build tool & dev server |
| [React Router](https://reactrouter.com/) | Client-side routing |
| CSS Custom Properties | Theming & design tokens |

## 📁 Project Structure

```
src/
├── components/
│   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   └── ThemeToggle.css
├── pages/
│   ├── Home.tsx              # Portfolio landing page
│   ├── WeatherDashboard.tsx  # Weather app
│   ├── WeatherDashboard.css
│   ├── TaskManager.tsx       # Kanban task board
│   └── TaskManager.css
├── assets/                   # SVG icons & images
├── App.tsx                   # Router setup
├── App.css                   # Portfolio page styles
├── index.css                 # Global styles & theme tokens
└── main.tsx                  # Entry point
```

## 🏁 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Routes

| Route | Page |
|---|---|
| `/` | Portfolio home |
| `/weather_dashboard` | Weather Dashboard |
| `/task_manager` | Task Manager |

## 📄 License

This project is for personal/educational use.
