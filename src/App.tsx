import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import GameDetail from './pages/GameDetail'
import Games from './pages/Games'
import Home from './pages/Home'
import Legal from './pages/Legal'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Play from './pages/Play'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="games" element={<Games />} />
          <Route path="game/:id" element={<GameDetail />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="admin" element={<Admin />} />
          <Route path="privacy" element={<Legal kind="privacy" />} />
          <Route path="terms" element={<Legal kind="terms" />} />
          <Route path="support" element={<Legal kind="support" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="play/:id" element={<Play />} />
      </Routes>
    </>
  )
}
