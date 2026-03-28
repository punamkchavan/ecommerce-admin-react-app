import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import { fetchAdminProfile } from './features/auth/authSlice';
import AdminLayout from './components/layout/AdminLayout';

function App() {
  const dispatch = useDispatch();
  const { token, user, profile } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user?.uid && !profile) {
      dispatch(fetchAdminProfile(user.uid));
    }
  }, [token, user, profile, dispatch]);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!token ? <LoginPage /> : <Navigate to="/" />} 
      />

      <Route 
        path="/forgot-password" 
        element={!token ? <ForgotPasswordPage /> : <Navigate to="/" />} 
      />
      
      <Route 
        path="/*" 
        element={
          token ? (
            <AdminLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                {/* Add other admin routes here */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
    </Routes>
  );
}

export default App;
