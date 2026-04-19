import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dog, LogOut, Menu, X, Shield } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  // Prevenir scroll en body cuando menu mobile esta abierto
  useEffect(() => {
    if (isSidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isSidebarOpen]);

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center p-3.5 rounded-xl font-medium transition-all duration-200 ${
      isActive 
      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
    }`;
  };

  return (
    <div className="flex h-screen bg-[#fafbfc] text-slate-800 overflow-hidden font-sans">
      
      {/* OVERLAY TELA OSCURA PARA MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR BARRAS LATERAL BLANCA */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 transform transition-transform duration-300 ease-out print:hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between md:justify-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
               <Dog className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight outfit text-slate-800">K9 SYS</h1>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-slate-800 transition-colors bg-slate-50 p-2 rounded-full">
             <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-5 space-y-2.5 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2">Menú Principal</p>
          
          <Link to="/" onClick={closeSidebar} className={navLinkClass('/')}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Panel General
          </Link>
          
          {user?.rol !== 'guia' && (
            <Link to="/dogs/new" onClick={closeSidebar} className={navLinkClass('/dogs/new')}>
              <Dog className="w-5 h-5 mr-3" /> Activar Perro
            </Link>
          )}
          
          {user?.rol === 'admin' && (
            <>
            <div className="pt-4 pb-1"><div className="h-px w-full bg-slate-100"></div></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Administración</p>
            <Link to="/users" onClick={closeSidebar} className={navLinkClass('/users')}>
              <Shield className="w-5 h-5 mr-3" /> Equipo y Permisos
            </Link>
            </>
          )}
        </nav>
        
        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center px-3 py-2 mb-4">
             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold outfit mr-3 border border-blue-200 shadow-sm">
                {user?.nombre.charAt(0).toUpperCase()}
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800 truncate max-w-[140px]">{user?.nombre}</p>
               <p className="text-xs font-medium text-slate-500 capitalize">{user?.rol}</p>
             </div>
          </div>
          
          <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        {/* MOBILE HEADER CON HAMBURGUESA BOLD */}
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 text-slate-800 p-4 flex items-center justify-between shadow-sm shrink-0 z-30 sticky top-0 print:hidden">
          <div className="flex items-center">
             <button onClick={() => setIsSidebarOpen(true)} className="mr-3 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none">
               <Menu className="w-6 h-6 text-slate-600" />
             </button>
             <h2 className="text-xl font-extrabold outfit">K9 SYS</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
             {user?.nombre.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE (El Background real es #fafbfc) */}
        <main className="flex-1 overflow-auto p-4 md:p-10 relative print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto print:max-w-none">
             {children}
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default Layout;
