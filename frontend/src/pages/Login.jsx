import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

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
      setError('Credenciales inválidas, intente nuevamente');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-md w-full glass-panel rounded-3xl p-10 z-10 mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800 outfit tracking-tight">K9 SYSTEM</h2>
          <p className="text-slate-500 mt-3 font-medium">Gestión Integrada de Escuadrones</p>
        </div>

        {error && (
          <div className="mb-6 text-red-600 text-center text-sm font-semibold bg-red-50/80 border border-red-100 p-3 rounded-xl backdrop-blur-sm shadow-sm transition-all animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Correo Electrónico</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input type="email" required
                className="pl-11 block w-full bg-white/80 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@k9.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Contraseña Segura</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input type="password" required
                className="pl-11 block w-full bg-white/80 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" />
            </div>
          </div>
          
          <button type="submit" className="w-full mt-8 group flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:-translate-y-0.5">
            Iniciar Sesión
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
