import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', rol: 'guia'
  });

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then(res => {
      setUsers(res.data);
      setLoading(false);
    }).catch(err => {
       console.error(err);
       if(err.response?.status === 403) navigate('/'); // Redirigir si no es admin
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowForm(false);
      setFormData({ nombre: '', email: '', password: '', rol: 'guia' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creando usuario');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Eliminar definitivamente a este usuario?')) {
       try {
          await api.delete(`/users/${id}`);
          fetchUsers();
       } catch (err) {
          alert('Error eliminando: ' + (err.response?.data?.message || err.message));
       }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center"><Shield className="mr-3 text-blue-600"/> Gestión de Personal</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-2" /> Agregar Usuario
        </button>
      </div>

      {showForm && (
         <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
              <input required type="text" className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} />
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-slate-700">Email (Login)</label>
              <input required type="email" className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} />
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-slate-700">Clave</label>
              <input required type="password" placeholder="Mínimo 6 caracteres" className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} />
            </div>
            <div className="w-full md:w-auto">
              <label className="text-sm font-medium text-slate-700">Rol</label>
              <select className="mt-1 w-full p-2 border rounded-lg focus:ring-blue-500" value={formData.rol} onChange={e=>setFormData({...formData, rol:e.target.value})}>
                 <option value="admin">Admin (Acceso Total)</option>
                 <option value="veterinario">Veterinario (Edita Sanidad)</option>
                 <option value="instructor">Instructor (Edita Entrenamientos)</option>
                 <option value="guia">Guía (Solo Lectura/Consulta)</option>
              </select>
            </div>
            <button type="submit" className="w-full md:w-auto mt-4 px-6 py-2 h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors">Guardar</button>
         </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Cargando personal...</div> : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-600">Nombre</th>
                <th className="px-6 py-4 font-medium text-slate-600">Email</th>
                <th className="px-6 py-4 font-medium text-slate-600">Rol / Permisos</th>
                <th className="px-6 py-4 font-medium text-slate-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 font-bold text-slate-800">{u.nombre}</td>
                     <td className="px-6 py-4 text-slate-600">{u.email}</td>
                     <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold 
                           ${u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 
                             u.rol === 'veterinario' ? 'bg-blue-100 text-blue-700' :
                             u.rol === 'instructor' ? 'bg-emerald-100 text-emerald-700' : 
                             'bg-slate-100 text-slate-700'}`
                           }>
                           {u.rol.toUpperCase()}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        {u.id !== user?.id && (
                          <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Usuario">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                     </td>
                  </tr>
               ))}
               {users.length === 0 && <tr><td colSpan="4" className="text-center p-8 text-slate-500">No hay usuarios.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default UsersList;
