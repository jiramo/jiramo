import { Outlet, NavLink } from 'react-router-dom'
import { useResponsive } from '../hooks/useResponsive'

const icons = {
  home: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logo: (
    <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.43323e-05 23.4634C3.43323e-05 24.568 0.896952 25.4716 1.99812 25.385C8.02024 24.9112 13.7033 22.3075 18.0054 18.0054C22.3075 13.7032 24.9112 8.02021 25.385 1.99809C25.4716 0.896919 24.568 3.8147e-06 23.4635 1.90735e-06H14.7317C13.6272 1.90735e-06 12.7478 0.900923 12.575 1.99189C12.157 4.63064 10.9157 7.0897 9.00271 9.00268C7.08973 10.9157 4.63067 12.157 1.99192 12.575C0.900957 12.7478 3.62396e-05 13.6271 3.62396e-05 14.7317L3.43323e-05 23.4634Z" fill="#F3EEDF"/>
      <path d="M36 12.5366C36 11.432 35.1031 10.5284 34.002 10.615C27.9798 11.0888 22.2968 13.6925 17.9947 17.9946C13.6926 22.2968 11.0889 27.9798 10.6151 34.0019C10.5284 35.1031 11.4321 36 12.5366 36H21.2683C22.3729 36 23.2523 35.0991 23.4251 34.0081C23.843 31.3694 25.0844 28.9103 26.9974 26.9973C28.9103 25.0843 31.3694 23.843 34.0081 23.425C35.0991 23.2522 36 22.3729 36 21.2683V12.5366Z" fill="#F3EEDF"/>
    </svg>
  ),
}

const navItems = [
  { to: '/', icon: icons.home, end: true },
  { to: '/analytics', icon: icons.analytics, end: false },
  { to: '/projects', icon: icons.projects, end: false },
]

const bottomItems = [
  { to: '/settings', icon: icons.settings, end: false },
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
        {icons.logo}
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
