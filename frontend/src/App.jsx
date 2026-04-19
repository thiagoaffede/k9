import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewDog from './pages/NewDog';
import DogProfile from './pages/DogProfile';
import UsersList from './pages/UsersList';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dogs/new" element={
            <ProtectedRoute>
               <Layout>
                  <NewDog />
               </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dogs/:id" element={
            <ProtectedRoute>
               <Layout>
                  <DogProfile />
               </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
