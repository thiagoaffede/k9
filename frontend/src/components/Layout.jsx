import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dog, LogOut, Menu, X, Shield } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      
      {/* OVERLAY TELA OSCURA PARA MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between md:justify-center">
          <div className="flex items-center">
            <Dog className="w-8 h-8 mr-2 text-blue-400" />
            <h1 className="text-xl font-bold tracking-wider">K9 SYSTEM</h1>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
             <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/" onClick={closeSidebar} className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          {user?.rol !== 'guia' && (
            <Link to="/dogs/new" onClick={closeSidebar} className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors">
              <Dog className="w-5 h-5 mr-3" /> Registrar Perro
            </Link>
          )}
          {user?.rol === 'admin' && (
            <Link to="/users" onClick={closeSidebar} className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors">
              <Shield className="w-5 h-5 mr-3" /> Personal y Accesos
            </Link>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm mb-4 text-slate-400">Usuario: <span className="text-white font-medium">{user?.nombre}</span></p>
          <button onClick={handleLogout} className="flex items-center w-full p-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* MOBILE HEADER CON HAMBURGUESA */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center shadow-md shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="mr-3 focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold">K9 SYSTEM</h2>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
      
    </div>
  );
};

export default Layout;
