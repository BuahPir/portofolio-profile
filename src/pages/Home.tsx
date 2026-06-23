import { Link } from 'react-router-dom'
import '../App.css'
import ThemeToggle from '../components/ThemeToggle'

const skills = [
  'HTML & CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Git',
  'Laravel',
  'Python',
  'Flask',
]

const projects = [
  {
    title: 'Weather Dashboard',
    description:
      'A responsive weather app that shows live forecasts using a public API.',
    tags: ['React', 'API', 'CSS'],
    link: '/weather_dashboard',
  },
  {
    title: 'Task Manager',
    description:
      'A multi-project drag-and-drop task board with a Supabase PostgreSQL backend.',
    tags: ['TypeScript', 'React', 'Supabase'],
    link: '/task_manager',
  },
  {
    title: 'Portfolio Site',
    description:
      'This personal portfolio — built with React and Vite for fast development.',
    tags: ['React', 'Vite', 'Responsive'],
    link: '#',
  },
]

function Home() {
  return (
    <div className="portfolio">
      <header className="header">
        <Link to="/" className="logo">
          Portfolio
        </Link>
        <nav className="nav">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          <ThemeToggle />
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="hero-greeting">Hello, I'm</p>
          <h1 className="hero-name">Ahmad Nadil</h1>
          <p className="hero-tagline">Frontend Developer &amp; UI Enthusiast</p>
          <p className="hero-bio">
            I build clean, accessible web experiences with modern tools.
            Passionate about turning ideas into polished digital products.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              View Projects
            </a>
            <a href="#contact" className="btn btn-secondary">
              Get in Touch
            </a>
          </div>
        </section>

        <section id="about" className="section">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-avatar" aria-hidden="true">
              <span>AN</span>
            </div>
            <div className="about-text">
              <p>
                I'm a web developer focused on creating intuitive and
                performant user interfaces. I enjoy working across the full
                frontend stack — from layout and styling to state management
                and API integration.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new frameworks,
                contributing to open source, or sketching UI ideas in Figma.
              </p>
            </div>
          </div>
        </section>

        <section id="skills" className="section">
          <h2 className="section-title">Skills</h2>
          <ul className="skills-list">
            {skills.map((skill) => (
              <li key={skill} className="skill-tag">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section id="projects" className="section">
          <h2 className="section-title">Projects</h2>
          <div className="projects-grid">
            {projects.map((project) => (
              <article key={project.title} className="project-card">
                <div className="project-card-header">
                  <svg
                    className="project-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {project.link.startsWith('/') ? (
                    <Link
                      to={project.link}
                      className="project-link"
                      aria-label={`View ${project.title}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </Link>
                  ) : (
                    <a
                      href={project.link}
                      className="project-link"
                      aria-label={`View ${project.title}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </a>
                  )}
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <ul className="project-tags">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section">
          <h2 className="section-title">Contact</h2>
          <p className="contact-text">
            Have a project in mind or just want to say hello? I'd love to hear
            from you.
          </p>
          <a href="mailto:andinadil90@gmail.com" className="btn btn-primary">
            andinadil90@gmail.com
          </a>
          <div className="social-links">
            <a href="https://github.com/BuahPir" target="_blank" rel="noreferrer">
              <svg className="social-icon" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" />
              </svg>
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <svg className="social-icon" viewBox="0 0 72 72" fill="currentColor" aria-hidden="true">
                <path d="M62,62 L51.315625,62 L51.315625,43.802 C51.315625,38.813 49.42,36.025 45.471,36.025 C41.175,36.025 38.93,38.926 38.93,43.802 L38.93,62 L28.633,62 L28.633,27.333 L38.93,27.333 L38.93,32.003 C38.93,32.003 42.026,26.274 49.383,26.274 C56.736,26.274 62,30.764 62,40.051 L62,62 Z M16.349,22.794 C12.842,22.794 10,19.93 10,16.397 C10,12.864 12.842,10 16.349,10 C19.857,10 22.697,12.864 22.697,16.397 C22.697,19.93 19.857,22.794 16.349,22.794 Z M11.033,62 L21.769,62 L21.769,27.333 L11.033,27.333 L11.033,62 Z" />
              </svg>
              LinkedIn
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <svg className="social-icon" viewBox="0 0 1668.56 1221.19" fill="currentColor" aria-hidden="true">
                <g transform="translate(52.39,-25.06)">
                  <path d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.42-367.76L984.48,1104h297.8L874.15,558.3l361.92-391h-87.51l-313.51,338.7l-253.31-338.7H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z" />
                </g>
              </svg>
              Twitter/X
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with React &amp; Vite</p>
        <p>&copy; {new Date().getFullYear()} Ahmad Nadil</p>
      </footer>
    </div>
  )
}

export default Home
