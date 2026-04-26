import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../services/api';
import { Activity, FileText, Printer, Trash2, PlusCircle, Dog as DogIcon, Edit } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import FichaTecnicaPDF from '../components/FichaTecnicaPDF';

const DogProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [dog, setDog] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');
  
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editDogData, setEditDogData] = useState(null);
  const [usersList, setUsersList] = useState([]);

  const fetchUsers = () => {
    api.get('/users').then(res => setUsersList(res.data)).catch(err => console.error(err));
  };

  const fetchDog = () => {
    api.get(`/dogs/${id}`).then(res => setDog(res.data)).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDog();
    if (user?.rol === 'admin') fetchUsers();
  }, [id]);

  if (!dog) return <div className="p-8">Cargando perfil...</div>;

  // Lógica mejorada para photoURL: soporta local (/uploads) y remoto (http...)
  const photoURL = dog.foto_url 
    ? (dog.foto_url.startsWith('http') ? dog.foto_url : `${BASE_URL}${dog.foto_url}`)
    : 'https://via.placeholder.com/150?text=No+Foto';

  const handleDeleteDog = async () => {
    if (window.confirm('¿Eliminar registro de este perro? (Soft Delete)')) {
      await api.delete(`/dogs/${dog.id}`);
      navigate('/');
    }
  };

  const handleEntitySubmit = async (e, endpoint) => {
    e.preventDefault();
    await api.post(`/dogs/${dog.id}/${endpoint}`, formData);
    setShowForm(false);
    setFormData({});
    fetchDog();
  };

  const deleteSubEntity = async (endpointId) => {
    if (window.confirm('¿Borrar registro?')) {
      await api.delete(`/dogs/${dog.id}/${endpointId}`);
      fetchDog();
    }
  };

  const handleUpdateDog = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/dogs/${dog.id}`, editDogData);
      setEditDogData(null);
      fetchDog();
    } catch (err) {
      console.error(err);
      alert('Error actualizando información del perro');
    }
  };

  const printRecord = () => {
    // Pequeño delay para asegurar que el navegador móvil procese el renderizado del componente oculto
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('photo', file);

    setUploading(true);
    try {
      await api.post(`/dogs/${dog.id}/photo`, formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDog();
      setShowPhotoModal(false);
    } catch (err) {
      console.error(err);
      alert('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (window.confirm('¿Eliminar la foto de perfil?')) {
      try {
        // Podríamos tener un endpoint específico para borrar, 
        // o simplemente mandar un update con foto_url null.
        // En este caso, usaremos el mismo endpoint de update pero con foto_url: null si estuviera implementado,
        // pero vamos a implementar una lógica simple en el backend si es necesario o enviar null.
        await api.put(`/dogs/${dog.id}`, { foto_url: null });
        fetchDog();
        setShowPhotoModal(false);
      } catch (err) {
        console.error(err);
        alert('Error al eliminar la foto');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:m-0 print:p-0 print:w-full print:bg-white print:shadow-none">
      {/* HEADER PERFIL - OCULTO EN IMPRESION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-6">
          <div className="relative group cursor-pointer" onClick={() => setShowPhotoModal(true)}>
            <img src={photoURL} alt={dog.nombre} className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 hover:opacity-90 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <PlusCircle className="text-white w-8 h-8" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{dog.nombre}</h1>
            <p className="text-slate-500 font-medium">{dog.raza} • {dog.sexo.toUpperCase()} • Chip: {dog.nro_chip || 'N/A'}</p>
            <span className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full ${dog.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
              ESTADO: {dog.estado.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 print:hidden">
          <button onClick={() => setEditDogData({ ...dog })} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center text-sm hover:bg-blue-700 transition-colors">
            <Edit className="w-4 h-4 mr-2"/> Editar Info
          </button>
          <button onClick={printRecord} className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center text-sm hover:bg-slate-900 transition-colors">
            <Printer className="w-4 h-4 mr-2"/> Ficha PDF
          </button>
          {user?.rol === 'admin' && (
            <button onClick={handleDeleteDog} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg flex items-center text-sm hover:bg-red-200 transition-colors">
              <Trash2 className="w-4 h-4 mr-2"/> Eliminar
            </button>
          )}
        </div>
      </div>

      {/* TABS NAVEGADOR (Ocualto al imprimir) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:hidden">
        <div className="flex border-b border-slate-200 print:hidden">
          <button onClick={() => setActiveTab('resumen')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'resumen' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Resumen</button>
          <button onClick={() => setActiveTab('sanidad')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'sanidad' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Sanidad</button>
          <button onClick={() => setActiveTab('alimentacion')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'alimentacion' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Alimentación</button>
          <button onClick={() => setActiveTab('entrenamiento')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'entrenamiento' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Operativo</button>
          <button onClick={() => setActiveTab('incidentes')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'incidentes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Incidentes</button>
          <button onClick={() => setActiveTab('historial')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'historial' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Auditoría</button>
        </div>
        
        {/* CONTENIDO TABS */}
        <div className="p-6 bg-slate-50 rounded-b-xl print:bg-white print:p-0">
          
          {/* TAB: RESUMEN / EXPORT PRINT WILL JUST RENDER THIS VISTA */}
          {(activeTab === 'resumen') && (
             <div className="mt-4">
                {editDogData ? (
                  <form onSubmit={handleUpdateDog} className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg text-blue-800 border-b pb-2 mb-4">Editando Información Básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                        <input required className="w-full border rounded p-2 mt-1" value={editDogData.nombre || ''} onChange={e => setEditDogData({...editDogData, nombre: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nro Chip</label>
                        <input className="w-full border rounded p-2 mt-1" value={editDogData.nro_chip || ''} onChange={e => setEditDogData({...editDogData, nro_chip: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Raza</label>
                        <input className="w-full border rounded p-2 mt-1" value={editDogData.raza || ''} onChange={e => setEditDogData({...editDogData, raza: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Sexo</label>
                        <select className="w-full border rounded p-2 mt-1" value={editDogData.sexo} onChange={e => setEditDogData({...editDogData, sexo: e.target.value})}>
                          <option value="macho">Macho</option>
                          <option value="hembra">Hembra</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Color</label>
                        <input className="w-full border rounded p-2 mt-1" value={editDogData.color || ''} onChange={e => setEditDogData({...editDogData, color: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Origen</label>
                        <input className="w-full border rounded p-2 mt-1" value={editDogData.origen || ''} onChange={e => setEditDogData({...editDogData, origen: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                        <select className="w-full border rounded p-2 mt-1" value={editDogData.estado} onChange={e => setEditDogData({...editDogData, estado: e.target.value})}>
                          <option value="entrenamiento">Entrenamiento</option>
                          <option value="activo">Servicio Activo</option>
                          <option value="retirado">Retirado</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Fecha Nacimiento</label>
                        <input type="date" className="w-full border rounded p-2 mt-1" value={editDogData.fecha_nacimiento ? editDogData.fecha_nacimiento.split('T')[0] : ''} onChange={e => setEditDogData({...editDogData, fecha_nacimiento: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Observaciones</label>
                        <textarea className="w-full border rounded p-2 mt-1" rows="3" value={editDogData.observaciones || ''} onChange={e => setEditDogData({...editDogData, observaciones: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button type="button" onClick={() => setEditDogData(null)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                      <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md">Guardar Cambios</button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500">Origen:</span> <p className="font-semibold">{dog.origen || 'No registrado'}</p></div>
                    <div><span className="text-slate-500">Color:</span> <p className="font-semibold">{dog.color || 'No registrado'}</p></div>
                    <div><span className="text-slate-500">Fecha Nacimiento:</span> <p className="font-semibold">{dog.fecha_nacimiento ? new Date(dog.fecha_nacimiento).toLocaleDateString() : 'No registrado'}</p></div>
                    <div className="col-span-2"><span className="text-slate-500">Observaciones Generales:</span> <p className="p-3 bg-white mt-1 border border-slate-200 rounded">{dog.observaciones || 'No hay observaciones'}</p></div>
                    
                    <div className="col-span-2 mt-4">
                      <h3 className="font-bold text-lg mb-2">Asignación Actual</h3>
                      {dog.assignments?.length > 0 ? (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="font-bold text-blue-800">Guía: {dog.assignments[0].guia}</p>
                          <p className="text-sm text-blue-600">Desde: {new Date(dog.assignments[0].fecha_inicio).toLocaleDateString()} | Turno: {dog.assignments[0].turno}</p>
                        </div>
                      ) : <p className="text-slate-500">Sin guía asignado actualmente.</p>}
                    </div>
                  </div>
                )}
             </div>
          )}

          {/* TAB: SANIDAD */}
          {activeTab === 'sanidad' && (
             <div className="space-y-8">
                {/* Vacunas */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold flex items-center"><Activity className="w-5 h-5 mr-2 text-emerald-500"/> Vacunas</h3>
                     {(user?.rol === 'admin' || user?.rol === 'veterinario') && <button onClick={() => { setShowForm(showForm==='vac' ? false : 'vac'); setFormData({}); }} className="text-sm text-blue-600 flex"><PlusCircle className="w-4 h-4 mr-1"/> Añadir</button>}
                  </div>

                  {showForm === 'vac' && (
                    <form onSubmit={e => handleEntitySubmit(e, 'vaccines')} className="bg-white p-4 border rounded mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                       <div className="md:col-span-2">
                         <label className="text-xs text-slate-500">Vacuna (Nombre)</label>
                         <input required type="text" className="w-full border rounded p-2 text-sm" value={formData.vacuna||''} onChange={e=>setFormData({...formData, vacuna: e.target.value})} />
                       </div>
                       <div>
                         <label className="text-xs text-slate-500">Fecha Aplicación</label>
                         <input required type="date" className="w-full border rounded p-2 text-sm" value={formData.fecha_aplicacion||''} onChange={e=>setFormData({...formData, fecha_aplicacion: e.target.value})} />
                       </div>
                       <div>
                         <label className="text-xs text-slate-500">Próxima Dosis</label>
                         <input type="date" className="w-full border rounded p-2 text-sm" value={formData.proxima_dosis||''} onChange={e=>setFormData({...formData, proxima_dosis: e.target.value})} />
                       </div>
                       <div className="md:col-span-4 flex justify-end space-x-2 mt-2">
                         <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 bg-slate-100 rounded text-sm hover:bg-slate-200 transition-colors">Cancelar</button>
                         <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Guardar Vacuna</button>
                       </div>
                    </form>
                  )}

                  {dog.vaccines?.length > 0 ? (
                    <ul className="space-y-2">
                       {dog.vaccines.map(v => (
                          <li key={v.id} className="p-3 bg-white border border-slate-200 rounded flex justify-between items-center text-sm">
                             <div><span className="font-bold">{v.vacuna}</span> - {new Date(v.fecha_aplicacion).toLocaleDateString()} (Próxima: {v.proxima_dosis ? new Date(v.proxima_dosis).toLocaleDateString() : 'N/A'})</div>
                             {(user?.rol === 'admin') && <button onClick={() => deleteSubEntity(`vaccines/${v.id}`)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4"/></button>}
                          </li>
                       ))}
                    </ul>
                  ) : <p className="text-slate-500 text-sm">No hay vacunas registradas.</p>}
                </div>

                {/* Controles */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold flex items-center"><Activity className="w-5 h-5 mr-2 text-blue-500"/> Controles Veterinarios</h3>
                     {(user?.rol === 'admin' || user?.rol === 'veterinario') && <button onClick={() => { setShowForm(showForm==='ctrl' ? false : 'ctrl'); setFormData({}); }} className="text-sm text-blue-600 flex"><PlusCircle className="w-4 h-4 mr-1"/> Añadir</button>}
                  </div>
                  
                  {showForm === 'ctrl' && (
                    <form onSubmit={e => handleEntitySubmit(e, 'vetcontrols')} className="bg-white p-4 border rounded mb-4">
                       <input required placeholder="Motivo del control" className="w-full border rounded p-2 text-sm mb-2" value={formData.motivo||''} onChange={e=>setFormData({...formData, motivo: e.target.value})} />
                       <input placeholder="Tratamiento/Medicación" className="w-full border rounded p-2 text-sm mb-2" value={formData.tratamiento||''} onChange={e=>setFormData({...formData, tratamiento: e.target.value})} />
                       <div className="flex justify-end space-x-2 mt-2">
                         <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 bg-slate-100 rounded text-sm hover:bg-slate-200 transition-colors">Cancelar</button>
                         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Guardar Control</button>
                       </div>
                    </form>
                  )}

                  {dog.vetControls?.length > 0 ? (
                    <ul className="space-y-2">
                       {dog.vetControls.map(c => <li key={c.id} className="p-3 bg-white border border-slate-200 rounded text-sm">
                          <span className="font-bold">{c.motivo}</span> - {new Date(c.fecha).toLocaleDateString()} | Vet: {c.veterinario} <br/> <span className="text-slate-500 italic">{c.tratamiento}</span>
                       </li>)}
                    </ul>
                  ) : <p className="text-slate-500 text-sm">No hay controles registrados.</p>}
                </div>
             </div>
          )}

          {/* TAB: ALIMENTACIÓN */}
          {activeTab === 'alimentacion' && (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center"><Activity className="w-5 h-5 mr-2 text-orange-500"/> Plan de Alimentación</h3>
                  {(user?.rol === 'admin' || user?.rol === 'veterinario' || user?.rol === 'guia') && (
                    <button onClick={() => { setShowForm(showForm === 'feed' ? false : 'feed'); setFormData({}); }} className="text-sm text-blue-600 flex items-center">
                      <PlusCircle className="w-4 h-4 mr-1"/> Registrar Cambio/Dieta
                    </button>
                  )}
                </div>

                {showForm === 'feed' && (
                  <form onSubmit={e => handleEntitySubmit(e, 'feedings')} className="bg-white p-6 border rounded-xl shadow-sm mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Alimento</label>
                        <input required placeholder="Ej: Balanceado, Barf, etc." className="w-full border rounded p-2 text-sm mt-1" value={formData.tipo_alimento || ''} onChange={e => setFormData({ ...formData, tipo_alimento: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Marca</label>
                        <input placeholder="Marca del alimento" className="w-full border rounded p-2 text-sm mt-1" value={formData.marca || ''} onChange={e => setFormData({ ...formData, marca: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Cantidad Diaria</label>
                        <input placeholder="Ej: 500g, 2 tazas" className="w-full border rounded p-2 text-sm mt-1" value={formData.cantidad_diaria || ''} onChange={e => setFormData({ ...formData, cantidad_diaria: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Horario / Turno</label>
                        <select className="w-full border rounded p-2 text-sm mt-1" value={formData.horario || ''} onChange={e => setFormData({ ...formData, horario: e.target.value })}>
                          <option value="">Seleccionar horario...</option>
                          <option value="Mañana (08:00)">Mañana (08:00)</option>
                          <option value="Mediodía (12:00)">Mediodía (12:00)</option>
                          <option value="Tarde (16:00)">Tarde (16:00)</option>
                          <option value="Noche (20:00)">Noche (20:00)</option>
                          <option value="Refuerzo / Extra">Refuerzo / Extra</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Suplementos</label>
                        <input placeholder="Vitaminas, aceites, etc." className="w-full border rounded p-2 text-sm mt-1" value={formData.suplementos || ''} onChange={e => setFormData({ ...formData, suplementos: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Fecha Registro</label>
                        <input type="date" className="w-full border rounded p-2 text-sm mt-1" value={formData.fecha_inicio || ''} onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Cambios de Dieta / Notas de Ingesta</label>
                        <textarea placeholder="Detalle si hubo algún cambio o comportamiento especial al comer" className="w-full border rounded p-2 text-sm mt-1" rows="2" value={formData.cambios_dieta || ''} onChange={e => setFormData({ ...formData, cambios_dieta: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Observación</label>
                        <textarea placeholder="Ej: Comió todo, dejó la mitad, etc." className="w-full border rounded p-2 text-sm mt-1" rows="2" value={formData.observaciones || ''} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 bg-slate-100 rounded text-sm hover:bg-slate-200 transition-colors">Cancelar</button>
                      <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors">Guardar Registro</button>
                    </div>
                  </form>
                )}

                {dog.feedings?.length > 0 ? (
                  <div className="space-y-4">
                    {dog.feedings.map((f, idx) => (
                      <div key={f.id} className={`p-5 bg-white border rounded-xl shadow-sm ${idx === 0 ? 'border-orange-200 ring-1 ring-orange-100' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.fecha_inicio ? new Date(f.fecha_inicio).toLocaleDateString() : 'S/F'}</span>
                            <h4 className="text-lg font-bold text-slate-800">{f.tipo_alimento} - <span className="text-slate-500">{f.marca || 'S/M'}</span></h4>
                          </div>
                          <div className="flex space-x-2">
                            {idx === 0 && <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-full uppercase">Último Registro</span>}
                            {(user?.rol === 'admin' || user?.rol === 'veterinario') && (
                              <button onClick={() => deleteSubEntity(`feedings/${f.id}`)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Cantidad</span>
                            <p className="font-semibold">{f.cantidad_diaria || 'N/R'}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Horarios</span>
                            <p className="font-semibold">{f.horario || 'N/R'}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Suplementos</span>
                            <p className="font-semibold">{f.suplementos || 'Ninguno'}</p>
                          </div>
                        </div>

                        {(f.cambios_dieta || f.observaciones) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                            {f.cambios_dieta && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Cambios de Dieta</span>
                                <p className="text-sm text-slate-600 italic">{f.cambios_dieta}</p>
                              </div>
                            )}
                            {f.observaciones && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Observaciones</span>
                                <p className="text-sm text-slate-600">{f.observaciones}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic p-4 bg-white border border-dashed rounded-lg text-center">No hay registros de alimentación para este perro.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB: Entrenamiento y Operativo */}
          {activeTab === 'entrenamiento' && (
             <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center"><DogIcon className="w-5 h-5 mr-2 text-indigo-500"/> Entrenamientos</h3>
                    {(user?.rol === 'admin' || user?.rol === 'instructor') && <button onClick={() => { setShowForm(showForm==='train' ? false : 'train'); setFormData({}); }} className="text-sm text-indigo-600 flex"><PlusCircle className="w-4 h-4 mr-1"/> Registrar</button>}
                  </div>

                  {showForm === 'train' && (
                    <form onSubmit={e => handleEntitySubmit(e, 'trainings')} className="bg-white p-4 border rounded mb-4">
                       <div className="flex gap-2 mb-2">
                         <input required placeholder="Tipo (Ej: Detección)" className="w-1/2 border rounded p-2 text-sm" value={formData.tipo||''} onChange={e=>setFormData({...formData, tipo: e.target.value})} />
                         <input placeholder="Nivel" className="w-1/2 border rounded p-2 text-sm" value={formData.nivel||''} onChange={e=>setFormData({...formData, nivel: e.target.value})} />
                       </div>
                       <textarea placeholder="Evaluación / Resultados" className="w-full border rounded p-2 text-sm" value={formData.evaluacion||''} onChange={e=>setFormData({...formData, evaluacion: e.target.value})} />
                       <div className="flex justify-end space-x-2 mt-2">
                         <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 bg-slate-100 rounded text-sm hover:bg-slate-200 transition-colors">Cancelar</button>
                         <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Guardar Entrenamiento</button>
                       </div>
                    </form>
                  )}

                  {dog.trainings?.length > 0 ? (
                    <ul className="space-y-3">
                         {dog.trainings.map(t => <li key={t.id} className="p-4 bg-white border border-slate-200 rounded text-sm shadow-sm">
                          <div className="flex justify-between font-bold border-b pb-2 mb-2"><span>{t.tipo}</span> <span className="text-slate-500">{new Date(t.fecha).toLocaleDateString()}</span></div>
                          Nivel: <span className="font-semibold text-slate-800">{t.nivel||'-'}</span> | Evaluación: <span className="italic">{t.evaluacion||'-'}</span>
                       </li>)}
                    </ul>
                  ) : <p className="text-slate-500 text-sm">Sin historial de entrenamientos.</p>}
                </div>

                {/* TAB: OPERATIVO (ENTRENAMIENTO Y ASIGNACIÓN) */}
                <div className="space-y-12">
                {/* Asignaciones de Guia */}
                <section className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black flex items-center text-slate-800 tracking-tighter uppercase"><User className="w-6 h-6 mr-2 text-blue-500 fill-blue-50"/> Gestión de Guías</h3>
                     {user?.rol === 'admin' && (
                        <button onClick={() => { setShowForm(showForm === 'assign' ? false : 'assign'); setFormData({}); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-md hover:bg-blue-700 transition-all">
                           <PlusCircle className="w-4 h-4 mr-1"/> Nueva Asignación
                        </button>
                     )}
                   </div>

                   {showForm === 'assign' && (
                     <form onSubmit={e => handleEntitySubmit(e, 'assignments')} className="bg-white p-6 border-2 border-blue-100 rounded-2xl shadow-xl mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Seleccionar Guía</label>
                              <select required className="w-full border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.guia || ''} onChange={e => setFormData({ ...formData, guia: e.target.value })}>
                                 <option value="">Seleccionar...</option>
                                 {(usersList || []).filter(u => u.rol === 'guia' || u.rol === 'admin').map(u => (
                                    <option key={u.id} value={u.nombre}>{u.nombre}</option>
                                 ))}
                              </select>
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Turno de Servicio</label>
                              <select required className="w-full border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.turno || ''} onChange={e => setFormData({ ...formData, turno: e.target.value })}>
                                 <option value="">Seleccionar turno...</option>
                                 <option value="Mañana">Mañana</option>
                                 <option value="Tarde">Tarde</option>
                                 <option value="Noche">Noche</option>
                                 <option value="Rotativo">Rotativo</option>
                                 <option value="24x48">24x48</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fecha de Alta en Servicio</label>
                              <input type="date" className="w-full border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.fecha_inicio || ''} onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                           </div>
                           <div className="md:col-span-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Observaciones / Motivo</label>
                              <input placeholder="Ej: Refuerzo temporada, reemplazo por licencia..." className="w-full border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.observaciones || ''} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} />
                           </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                           <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-colors">Cancelar</button>
                           <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0">Confirmar Operativo</button>
                        </div>
                     </form>
                   )}

                   <div className="space-y-4">
                     {dog.assignments?.length > 0 ? (
                       <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:to-slate-100">
                          {dog.assignments.map((a, idx) => (
                            <div key={a.id} className="relative flex items-start mb-6 last:mb-0">
                               <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 z-10 shadow-md ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                  {idx === 0 ? <Activity className="w-4 h-4 animate-pulse"/> : <User className="w-4 h-4"/>}
                               </div>
                               <div className={`ml-6 flex-1 p-5 rounded-2xl border transition-all ${idx === 0 ? 'bg-white border-blue-200 shadow-xl ring-1 ring-blue-50' : 'bg-white/60 border-slate-100 grayscale-[0.5]'}`}>
                                  <div className="flex justify-between items-start">
                                     <div className="space-y-1">
                                        <div className="flex items-center space-x-3">
                                           <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}`}>
                                              {idx === 0 ? 'Activo en Servicio' : 'Histórico'}
                                           </span>
                                           <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">
                                              {new Date(a.fecha_inicio).toLocaleDateString()} {a.fecha_fin ? `al ${new Date(a.fecha_fin).toLocaleDateString()}` : '— Presente'}
                                           </span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-800">{a.guia}</h4>
                                        <p className="text-sm font-bold text-slate-500 flex items-center">
                                           <MapPin className="w-3 h-3 mr-1 text-blue-400"/> Turno: <span className="text-blue-600 ml-1">{a.turno || 'Sin especificar'}</span>
                                        </p>
                                        {a.observaciones && <p className="text-xs text-slate-400 italic mt-3 bg-slate-50 p-2 rounded-lg border-l-4 border-slate-200">"{a.observaciones}"</p>}
                                     </div>
                                     {user?.rol === 'admin' && (
                                        <button onClick={() => deleteSubEntity(`assignments/${a.id}`)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                           <Trash2 className="w-5 h-5"/>
                                        </button>
                                     )}
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                     ) : (
                       <div className="text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                          <User className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin guías asignados</p>
                       </div>
                     )}
                   </div>
                </section>

                {/* Entrenamiento / Capacitación */}
                <section>
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black flex items-center text-slate-800 tracking-tighter uppercase"><Award className="w-6 h-6 mr-2 text-indigo-500 fill-indigo-50"/> Historial de Capacitación</h3>
                     {user?.rol === 'admin' && (
                        <button onClick={() => { setShowForm(showForm === 'training' ? false : 'training'); setFormData({}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-md hover:bg-indigo-700 transition-all">
                           <PlusCircle className="w-4 h-4 mr-1"/> Registrar Nivel
                        </button>
                     )}
                   </div>

                   {showForm === 'training' && (
                     <form onSubmit={e => handleEntitySubmit(e, 'trainings')} className="bg-white p-6 border-2 border-indigo-100 rounded-2xl shadow-xl mb-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Entrenamiento</label>
                              <select required className="w-full border rounded p-2 text-sm mt-1" value={formData.tipo || ''} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                 <option value="">Seleccionar...</option>
                                 <option value="Obediencia Básica">Obediencia Básica</option>
                                 <option value="Detección Narcóticos">Detección Narcóticos</option>
                                 <option value="Detección Explosivos">Detección Explosivos</option>
                                 <option value="Búsqueda y Rescate">Búsqueda y Rescate</option>
                                 <option value="Intervención / Guardia">Intervención / Guardia</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Nivel Alcanzado</label>
                              <select required className="w-full border rounded p-2 text-sm mt-1" value={formData.nivel || ''} onChange={e => setFormData({ ...formData, nivel: e.target.value })}>
                                 <option value="">Seleccionar...</option>
                                 <option value="Inicial">Inicial</option>
                                 <option value="En Formación">En Formación</option>
                                 <option value="Operativo">Operativo</option>
                                 <option value="Avanzado">Avanzado</option>
                                 <option value="Experto">Experto</option>
                              </select>
                           </div>
                           <div className="md:col-span-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Evaluación / Notas</label>
                              <textarea required placeholder="Detalle los avances o deficiencias observadas..." className="w-full border rounded p-2 text-sm mt-1" rows="3" value={formData.evaluacion || ''} onChange={e => setFormData({ ...formData, evaluacion: e.target.value })} />
                           </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                           <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 bg-slate-100 rounded text-sm hover:bg-slate-200 transition-colors">Cancelar</button>
                           <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Guardar Progreso</button>
                        </div>
                     </form>
                   )}

                   {dog.trainings?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {dog.trainings.map(t => (
                         <div key={t.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                               <div>
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{new Date(t.fecha).toLocaleDateString()}</span>
                                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mt-1">{t.tipo}</h4>
                               </div>
                               <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Nivel: {t.nivel}</span>
                            </div>
                            <p className="text-sm text-slate-600 italic leading-relaxed">"{t.evaluacion}"</p>
                         </div>
                       ))}
                    </div>
                  ) : <p className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium">Sin historial de capacitación.</p>}
                </section>
             </div>
          </div>
          )}

          {/* TAB: INCIDENTES / EVENTOS */}
          {activeTab === 'incidentes' && (
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center text-red-600"><Activity className="w-5 h-5 mr-2"/> Registro de Incidentes y Eventos</h3>
                      <button onClick={() => { setShowForm(showForm==='incident' ? false : 'incident'); setFormData({ gravedad: 'baja' }); }} className="text-sm text-red-600 flex font-bold"><PlusCircle className="w-4 h-4 mr-1"/> Reportar Incidente</button>
                   </div>

                   {showForm === 'incident' && (
                     <form onSubmit={e => handleEntitySubmit(e, 'incidents')} className="bg-white p-6 border-2 border-red-100 rounded-2xl shadow-sm mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Incidente</label>
                              <select required className="w-full border rounded p-2 text-sm mt-1" value={formData.tipo || ''} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                 <option value="">Seleccionar tipo...</option>
                                 <option value="Mordidas">Mordidas</option>
                                 <option value="Enfermedades importantes">Enfermedades importantes</option>
                                 <option value="Problemas de conducta">Problemas de conducta</option>
                                 <option value="Traslados">Traslados</option>
                                 <option value="Fallecimiento">Fallecimiento</option>
                                 <option value="Otro">Otro incidente</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Gravedad</label>
                              <select required className="w-full border rounded p-2 text-sm mt-1" value={formData.gravedad || 'baja'} onChange={e => setFormData({ ...formData, gravedad: e.target.value })}>
                                 <option value="baja">Baja (Preventivo)</option>
                                 <option value="media">Media (Requiere atención)</option>
                                 <option value="alta">Alta (Crítico / Urgente)</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Fecha del Evento</label>
                              <input type="date" className="w-full border rounded p-2 text-sm mt-1" value={formData.fecha || ''} onChange={e => setFormData({ ...formData, fecha: e.target.value })} />
                           </div>
                           <div className="md:col-span-3">
                              <label className="text-xs font-bold text-slate-500 uppercase">Descripción detallada</label>
                              <textarea required placeholder="Describa lo sucedido con el mayor detalle posible..." className="w-full border rounded p-2 text-sm mt-1" rows="3" value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                           </div>
                           <div className="md:col-span-3">
                              <label className="text-xs font-bold text-slate-500 uppercase">Acciones Tomadas</label>
                              <input placeholder="Medidas correctivas, atención médica, sanciones, etc." className="w-full border rounded p-2 text-sm mt-1" value={formData.acciones_tomadas || ''} onChange={e => setFormData({ ...formData, acciones_tomadas: e.target.value })} />
                           </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                           <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 bg-slate-100 rounded text-sm hover:bg-slate-200 transition-colors">Cancelar</button>
                           <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-black shadow-md hover:bg-red-700 transition-all uppercase">Registrar Evento Crítico</button>
                        </div>
                     </form>
                   )}

                   {dog.incidents?.length > 0 ? (
                    <div className="space-y-4">
                       {dog.incidents.map(i => (
                         <div key={i.id} className={`p-5 bg-white border rounded-2xl shadow-sm relative overflow-hidden group border-l-8 ${i.gravedad === 'alta' ? 'border-l-red-600' : i.gravedad === 'media' ? 'border-l-amber-500' : 'border-l-blue-400'}`}>
                            <div className="flex justify-between items-start">
                               <div>
                                  <div className="flex items-center space-x-3 mb-2">
                                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{new Date(i.fecha).toLocaleDateString()}</span>
                                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${i.gravedad === 'alta' ? 'bg-red-100 text-red-700' : i.gravedad === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                        Gravedad: {i.gravedad.toUpperCase()}
                                     </span>
                                  </div>
                                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{i.tipo}</h4>
                                  <p className="mt-3 text-slate-600 text-sm leading-relaxed">{i.descripcion}</p>
                                  
                                  {i.acciones_tomadas && (
                                     <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                                        <span className="font-bold text-slate-700 uppercase block mb-1">Acciones Tomadas:</span>
                                        {i.acciones_tomadas}
                                     </div>
                                  )}
                               </div>
                               {user?.rol === 'admin' && (
                                 <button onClick={() => deleteSubEntity(`incidents/${i.id}`)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                                    <Trash2 className="w-5 h-5"/>
                                 </button>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : <p className="p-12 text-center text-slate-400 font-medium bg-white border border-dashed rounded-3xl uppercase tracking-widest text-xs">Sin incidentes registrados</p>}
                </div>
             </div>
          )}

          {/* TAB: HISTORIAL GENERAL AUTOMÁTICO */}
          {activeTab === 'historial' && (
             <div>
                <h3 className="text-lg font-bold mb-4">Historial y Auditoría Global</h3>
                {dog.history?.length > 0 ? (
                  <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                     {dog.history.map(h => <li key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"><FileText className="w-4 h-4"/></div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white border border-slate-100 shadow-sm rounded-xl">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-slate-700">{h.tipo_evento}</span>
                            <span className="text-xs text-slate-400 font-medium">{new Date(h.fecha).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-600 text-sm">{h.descripcion}</p>
                          <p className="text-xs text-slate-400 mt-2">Usuario: {h.responsable}</p>
                        </div>
                     </li>)}
                  </ul>
                ) : <p className="text-slate-500 text-sm">Historial vacío.</p>}
             </div>
          )}
        </div>
      </div>
      
      {/* COMPONENTE EXCLUSIVO PARA IMPRESION (PDF) */}
      <FichaTecnicaPDF dog={dog} />

      {/* MODAL DE GESTIÓN DE FOTO */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Gestionar Foto de Perfil</h3>
            </div>
            
            <div className="p-8 flex flex-col items-center space-y-6">
              <img src={photoURL} alt="Preview" className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-slate-50" />
              
              <div className="grid grid-cols-1 w-full gap-3">
                <button 
                  onClick={() => document.getElementById('photoInput').click()} 
                  disabled={uploading}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Cambiar Foto'}
                </button>
                <input id="photoInput" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                
                {dog.foto_url && (
                  <button 
                    onClick={handleDeletePhoto} 
                    className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95"
                  >
                    Eliminar Foto
                  </button>
                )}
                
                <button 
                  onClick={() => setShowPhotoModal(false)} 
                  className="mt-2 px-4 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogProfile;
