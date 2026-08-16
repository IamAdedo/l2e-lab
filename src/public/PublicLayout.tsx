import { useEffect, useState } from 'react'
import {
  BookOpen,
  Code2,
  LayoutGrid,
  Menu,
  Sparkles,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { PwaInstallPrompt } from '../components/PwaInstallPrompt'
import './public.css'
import './public-pages.css'
import './public-detail.css'
import './public-responsive.css'
import './public-app.css'

const publicNavigation = [
  { label: 'Projects', to: '/projects', icon: LayoutGrid },
  { label: 'Daily 100', to: '/daily', icon: BookOpen },
  { label: 'Playground', to: '/playground', icon: Code2 },
  { label: 'Community', to: '/community', icon: UsersRound },
  { label: 'My learning', to: '/my-learning', icon: Sparkles },
  { label: 'Achievements', to: '/achievements', icon: Trophy },
]

function activeNavClass({ isActive }: { isActive: boolean }) {
  return `pl-nav__link${isActive ? ' pl-nav__link--active' : ''}`
}

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="pl-shell">
      <header className="pl-header">
        <div className="pl-container pl-header__inner">
          <Link className="pl-header__brand" to="/" aria-label="L2E LAB learning hub">
            <Brand compact />
            <span className="pl-header__brand-note">Learning hub</span>
          </Link>

          <nav className="pl-nav" aria-label="Primary navigation">
            {publicNavigation.map(({ label, to }) => (
              <NavLink className={activeNavClass} to={to} key={to}>{label}</NavLink>
            ))}
          </nav>

          <div className="pl-header__actions">
            <Link className="pl-button pl-button--primary pl-header__play" to="/playground">
              <Code2 size={16} /> Open playground
            </Link>
            <button
              className="pl-menu-button"
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="pl-mobile-menu">
            <nav className="pl-container" aria-label="Mobile navigation">
              {publicNavigation.map(({ label, to, icon: Icon }) => (
                <NavLink className={activeNavClass} to={to} key={to}>
                  <Icon size={17} /> {label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="pl-main">
        <Outlet />
      </main>
      <PwaInstallPrompt />
    </div>
  )
}

export function PublicToolLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="pl-tool-shell">
      <main className="pl-tool-main">
        <Outlet />
      </main>
    </div>
  )
}
