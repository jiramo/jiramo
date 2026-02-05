import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Overview from './pages/overview'
import Login from './pages/login'
import Profile from './pages/profile'
import Layout from './layouts/main'
import Settings from './pages/settings'
import Projects from './pages/projects'
import NotFound from './pages/not-found'

function App() {
  return (
    <BrowserRouter>
      <div className="w-screen h-screen overflow-auto relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path='projects' element={<Projects />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App