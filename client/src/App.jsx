import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './routes/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import ManageProjects from './pages/admin/ManageProjects'
import ProjectForm from './pages/admin/ProjectForm'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:id" element={<ProjectDetail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageProjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/new"
            element={
              <ProtectedRoute roles={['admin']}>
                <ProjectForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/:id/edit"
            element={
              <ProtectedRoute roles={['admin']}>
                <ProjectForm />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
