import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { Shield, Plus, Trash2, Edit, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialForm = { nombre: '', email: '', password: '', rol: 'guia' };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then(res => {
      setUsers(res.data);
      setLoading(false);
    }).catch(err => {
       console.error(err);
       if(err.response?.status === 403) navigate('/');
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setFormData(initialForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (currentUser) => {
    setFormData({
       nombre: currentUser.nombre,
       email: currentUser.email,
       password: '', // Clave vacía porque editar no exige cambiar clave a menos que lo deseen
       rol: currentUser.rol
    });
    setEditId(currentUser.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
         // Quitar password si viene vacío en la edición
         const payload = { ...formData };
         if (!payload.password || payload.password.trim() === '') delete payload.password;
         await api.put(`/users/${editId}`, payload);
      } else {
         await api.post('/users', formData);
      }
      setShowModal(false);
      setFormData(initialForm);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error guardando usuario');
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
        <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-2" /> Agregar Usuario
        </button>
      </div>

      {/* MODAL GESTIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h2 className="text-lg font-bold text-slate-800">{editId ? 'Editar Personal' : 'Nuevo Usuario'}</h2>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                   <input required type="text" className="w-full p-2.5 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login)</label>
                   <input required type="email" className="w-full p-2.5 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Clave de Acceso {editId && <span className="text-slate-400 font-normal">(Opcional si no cambia)</span>}</label>
                   <input required={!editId} type="password" placeholder={editId ? 'Dejar en blanco para conservar clave antigua' : 'Mínimo 6 caracteres'} className="w-full p-2.5 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Permisos</label>
                   <select className="w-full p-2.5 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.rol} onChange={e=>setFormData({...formData, rol:e.target.value})}>
                      <option value="admin">Admin (Acceso Total)</option>
                      <option value="veterinario">Veterinario (Edita Sanidad)</option>
                      <option value="instructor">Instructor (Edita Entrenamientos)</option>
                      <option value="guia">Guía (Solo Lectura/Consulta)</option>
                   </select>
                 </div>
                 
                 <div className="pt-4 flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">Guardar Datos</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Cargando personal...</div> : (
          <div className="overflow-x-auto">
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
                          <button onClick={() => openEditModal(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-2" title="Editar Usuario">
                             <Edit className="w-5 h-5" />
                          </button>
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
          </div>
        )}
      </div>

    </div>
  );
};

export default UsersList;
