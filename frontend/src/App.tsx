import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Spinner } from './components/Loaders';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { StoreList } from './pages/StoreList';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { Settings } from './pages/Settings';
import { NotFound, Unauthorized, Forbidden } from './pages/Errors';

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Forbidden />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'NORMAL']}>
                  <StoreList />
                </ProtectedRoute>
              } 
            />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Role specific routes */}
            <Route 
              path="/admin" 
              element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/owner" 
              element={<ProtectedRoute allowedRoles={['STORE_OWNER']}><OwnerDashboard /></ProtectedRoute>} 
            />
            
            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
