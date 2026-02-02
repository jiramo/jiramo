import { Outlet, NavLink } from 'react-router-dom'
import { useResponsive } from '../hooks/useResponsive'
import { Home, BarChart3, Folder, Settings } from 'lucide-react'

const navIcons = {
  home: <Home className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
  projects: <Folder className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
}

const navItems = [
  { to: '/', icon: navIcons.home, end: true },
  { to: '/analytics', icon: navIcons.analytics, end: false },
  { to: '/projects', icon: navIcons.projects, end: false },
]

const bottomItems = [
  { to: '/settings', icon: navIcons.settings, end: false },
]

const navLinkClass = (isActive: boolean) => 
  `w-11 h-11 rounded-xl flex items-center justify-center text-gray-500 transition-all duration-200 ${
    isActive ? 'bg-accent-orange text-white' : 'hover:text-gray-400'
  }`

function Sidebar() {
  const { isMobile } = useResponsive()

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-dark-900 border-t border-dark-500 flex items-center justify-around px-4 z-50">
        {navItems.map(({ to, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => navLinkClass(isActive)}>
            {icon}
          </NavLink>
        ))}
      </nav>
    )
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[70px] md:w-20 bg-dark-900 border-r border-dark-500 flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <div className="mb-6 md:mb-8">
        <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col gap-2 flex-1 justify-start">
        {navItems.map(({ to, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => navLinkClass(isActive)}>
            {icon}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Icons */}
      <div className="flex flex-col gap-2 mt-auto">
        {bottomItems.map(({ to, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => navLinkClass(isActive)}>
            {icon}
          </NavLink>
        ))}

        <NavLink
          to="/profile"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-dark-200 overflow-hidden transition-all duration-200 hover:bg-dark-300"
        >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marco"
            alt="Profile"
            className="w-9 h-9"
          />
        </NavLink>
      </div>
    </aside>
  )
}

function Layout() {
  const { isMobile } = useResponsive()

  return (
    <div className={`flex min-h-screen bg-dark-800 ${isMobile ? 'pb-[70px]' : ''}`}>
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-[70px] md:ml-20'}`}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
