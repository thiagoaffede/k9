import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-10">
          <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h2 className="text-3xl font-extrabold text-slate-900">K9 SECURITY</h2>
          <p className="text-slate-500 mt-2">Acceso al Sistema de Gestión</p>
        </div>
        {error && <div className="mb-4 text-red-500 text-center font-medium bg-red-50 p-2 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input type="email" required
                className="pl-10 block w-full border border-slate-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@k9.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input type="password" required
                className="pl-10 block w-full border border-slate-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
