import { Outlet, NavLink } from 'react-router-dom'

function Layout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <NavLink to="/">Overview</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/analytics">Analytics</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
