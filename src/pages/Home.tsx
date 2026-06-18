import { Link } from 'react-router-dom'
import '../App.css'
import githubIcon from '../assets/github.svg'
import linkedinIcon from '../assets/linkedIn.svg'
import XIcon from '../assets/x.svg'

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
      'A drag-and-drop task board to organize daily work and track progress.',
    tags: ['TypeScript', 'React', 'Local Storage'],
    link: '#',
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
              <img src={githubIcon} alt="GitHub" className="social-icon" />
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <img src={linkedinIcon} alt="LinkedIn" className="social-icon" />
              LinkedIn
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <img src={XIcon} alt="Twitter/X" className="social-icon" />
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
