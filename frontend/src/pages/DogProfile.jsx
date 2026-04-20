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

  const fetchDog = () => {
    api.get(`/dogs/${id}`).then(res => setDog(res.data)).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDog();
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
          <button onClick={() => setActiveTab('entrenamiento')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'entrenamiento' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Operativo</button>
          <button onClick={() => setActiveTab('historial')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'historial' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Historial Completo</button>
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
                
                {/* Asignaciones de Guia */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center">Historial de Guías Asignados</h3>
                  </div>
                  {dog.assignments?.length > 0 ? (
                    <ul className="space-y-3">
                       {dog.assignments.map(a => <li key={a.id} className="p-3 bg-white border border-slate-200 rounded text-sm">
                          <strong>{a.guia}</strong> | Desde: {new Date(a.fecha_inicio).toLocaleDateString()} {a.fecha_fin ? `hasta ${new Date(a.fecha_fin).toLocaleDateString()}` : '(Activa)'}
                       </li>)}
                    </ul>
                  ) : <p className="text-slate-500 text-sm">Perro sin asignaciones registradas.</p>}
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
