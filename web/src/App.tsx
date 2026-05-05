import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Overview from './pages/overview'
import Login from './pages/login'
import Profile from './pages/profile'
import Layout from './layouts/main'
import Settings from './pages/settings'
import Projects from './pages/projects'
import Clients from './pages/clients'
import NotFound from './pages/not-found'
import Setup from './pages/setup'
import SetupGuard from './components/SetupGuard'
import { AuthProvider, RequireAuth, RequireGuest } from './lib/auth'
import Analytics from './pages/analytics'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SetupGuard>
          <div className="w-screen h-screen overflow-auto relative">
            <Routes>
              <Route path="/setup" element={<Setup />} />
              <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
              <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                <Route index element={<Overview />} />
                <Route path='projects' element={<Projects />} />
                <Route path='clients' element={<Clients />} />
                <Route path='analytics' element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<RequireAuth><NotFound /></RequireAuth>} />
            </Routes>
          </div>
        </SetupGuard>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App