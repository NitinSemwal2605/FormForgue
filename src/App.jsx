import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Analytics from './pages/Analytics'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import FormBuilder from './pages/FormBuilder'
import FormView from './pages/FormView'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import PublicForm from './pages/PublicForm'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-950 text-white">
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/form/:shareUrl" element={<PublicForm />} />
                
                {/* Protected Routes - Require Authentication */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/forms/new" element={
                  <ProtectedRoute>
                    <FormBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/forms/:id" element={
                  <ProtectedRoute>
                    <FormView />
                  </ProtectedRoute>
                } />
                <Route path="/forms/:id/edit" element={
                  <ProtectedRoute>
                    <FormBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/forms/:id/analytics" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Analytics />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Analytics />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Fallback - Redirect to landing page for unknown routes */}
                <Route path="*" element={<Landing />} />
              </Routes>
            </Layout>
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  )
}

export default App