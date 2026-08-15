import { useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { Brand, Learn2EarnSignature } from './Brand'
import { Avatar, Button } from './UI'

type ShellProps = {
  role: 'student' | 'admin'
  children: ReactNode
  onLogout: () => void
}

const studentLinks = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/assessments', label: 'Assessments', icon: ClipboardCheck },
  { to: '/app/results', label: 'My results', icon: BarChart3 },
]

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/exams', label: 'Examinations', icon: ClipboardCheck },
  { to: '/admin/questions', label: 'Question bank', icon: BookOpenCheck },
  { to: '/admin/submissions', label: 'Submissions', icon: FlaskConical },
  { to: '/admin/students', label: 'Students', icon: UsersRound },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const pageTitles: Record<string, { title: string; copy: string }> = {
  '/app': { title: 'Good morning, Amara', copy: 'Ready for the next checkpoint?' },
  '/app/assessments': { title: 'Assessments', copy: 'Your checkpoints, sprints and coding labs.' },
  '/app/results': { title: 'My results', copy: 'Review your progress and sharpen your edge.' },
  '/admin': { title: 'Command centre', copy: 'Here’s what is happening across L2E LAB.' },
  '/admin/exams': { title: 'Examinations', copy: 'Create, schedule and manage every assessment.' },
  '/admin/questions': { title: 'Question bank', copy: 'Build a reusable library of great challenges.' },
  '/admin/submissions': { title: 'Submissions', copy: 'Review performance and release results.' },
  '/admin/students': { title: 'Students', copy: 'Manage access across campuses and cohorts.' },
  '/admin/analytics': { title: 'Analytics', copy: 'See how learners and assessments are performing.' },
  '/admin/settings': { title: 'Settings', copy: 'Configure your workspace and assessment defaults.' },
}

export function Shell({ role, children, onLogout }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const links = role === 'admin' ? adminLinks : studentLinks
  const meta = useMemo(() => {
    const key = Object.keys(pageTitles).sort((a, b) => b.length - a.length).find((path) => location.pathname === path)
    if (location.pathname.includes('/new')) return { title: 'Create examination', copy: 'Design a focused, fair coding experience.' }
    if (location.pathname.includes('/edit')) return { title: 'Edit examination', copy: 'Refine the assessment and publishing rules.' }
    return pageTitles[key || (role === 'admin' ? '/admin' : '/app')]
  }, [location.pathname, role])

  const user = role === 'admin'
    ? { name: 'Dami Lawson', detail: 'Platform administrator' }
    : { name: 'Amara Okafor', detail: 'Yaba · Cohort 02' }

  return (
    <div className={`app-shell ${collapsed ? 'app-shell--collapsed' : ''}`}>
      <aside className={`sidebar ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar__top">
          <Brand inverse compact={collapsed} />
          <button className="sidebar__close-mobile" onClick={() => setMobileOpen(false)}><X size={21} /></button>
        </div>

        {role === 'admin' && !collapsed && (
          <button className="create-exam" onClick={() => { navigate('/admin/exams/new'); setMobileOpen(false) }}>
            <span><Plus size={18} /></span>
            <div><strong>Create exam</strong><small>Build a new checkpoint</small></div>
          </button>
        )}

        {role === 'student' && !collapsed && (
          <div className="student-mini-card">
            <span className="student-mini-card__glow" />
            <div className="student-mini-card__icon"><Sparkles size={18} /></div>
            <small>Current path</small>
            <strong>JavaScript Foundations</strong>
            <div><span style={{ width: '68%' }} /></div>
            <p><b>68%</b><span>12 of 18 quests</span></p>
          </div>
        )}

        <nav className="sidebar__nav" aria-label="Main navigation">
          {!collapsed && <span className="nav-section-label">Workspace</span>}
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`} title={collapsed ? label : undefined}>
              <Icon size={19} strokeWidth={1.9} /><span>{label}</span>
            </NavLink>
          ))}
          {role === 'admin' && <NavLink to="/admin/settings" onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`} title={collapsed ? 'Settings' : undefined}><Settings size={19} /><span>Settings</span></NavLink>}
        </nav>

        <div className="sidebar__bottom">
          <a className="nav-link" href="mailto:support@learn2earn.ng"><CircleHelp size={19} /><span>Help & support</span></a>
          {!collapsed && <Learn2EarnSignature inverse />}
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar__left">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
            <button className="collapse-toggle" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <div className="topbar__title"><h1>{meta.title}</h1><p>{meta.copy}</p></div>
          </div>

          <div className="topbar__actions">
            <button className="topbar-search" onClick={() => setSearchOpen(true)}><Search size={18} /><span>Search anything</span><kbd>⌘ K</kbd></button>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <div className="profile-wrap">
              <button className="profile-button" onClick={() => setProfileOpen((open) => !open)}>
                <Avatar name={user.name} />
                <span><strong>{user.name}</strong><small>{user.detail}</small></span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu__head"><Avatar name={user.name} size="lg" /><div><strong>{user.name}</strong><small>{user.detail}</small></div></div>
                  <button><UserRound size={17} />Profile</button>
                  <button><Settings size={17} />Preferences</button>
                  <hr />
                  <button className="profile-menu__logout" onClick={onLogout}><LogOut size={17} />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>

      {searchOpen && (
        <div className="command-layer" onMouseDown={(event) => event.target === event.currentTarget && setSearchOpen(false)}>
          <div className="command-menu">
            <div className="command-search"><Search size={20} /><input autoFocus placeholder="Search exams, students or submissions…" /><kbd>ESC</kbd></div>
            <div className="command-empty"><Sparkles size={24} /><strong>Jump anywhere, quickly.</strong><span>Start typing to search across L2E LAB.</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

export function PageAction({ onClick, label, icon }: { onClick: () => void; label: string; icon?: ReactNode }) {
  return <Button onClick={onClick} icon={icon || <Plus size={18} />}>{label}</Button>
}
