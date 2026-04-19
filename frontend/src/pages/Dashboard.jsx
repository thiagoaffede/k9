import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Activity, AlertTriangle, CheckCircle, Clock, Download, Search } from 'lucide-react';

const Dashboard = () => {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchDogs = () => {
    setLoading(true);
    let url = '/dogs';
    const params = new URLSearchParams();
    if (search) params.append('nombre', search);
    if (statusFilter) params.append('estado', statusFilter);
    if (params.toString()) url += `?${params.toString()}`;

    api.get(url).then(res => {
      setDogs(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDogs();
  }, [search, statusFilter]);

  const activeDogs = dogs.filter(d => d.estado === 'activo');
  const trainingDogs = dogs.filter(d => d.estado === 'entrenamiento');
  
  // Alert system calculations
  let venciCount = 0;
  let proxCount = 0;
  
  const getSanitaryStatus = (dog) => {
    if (!dog.vaccines || dog.vaccines.length === 0) return { status: 'red', text: 'Sin Registro' };
    let latest = null;
    dog.vaccines.forEach(v => {
      if (v.proxima_dosis) {
        if (!latest || new Date(v.proxima_dosis) < new Date(latest)) {
          latest = v.proxima_dosis;
        }
      }
    });

    if (!latest) return { status: 'green', text: 'Al día' };
    
    const timeDiff = new Date(latest).getTime() - new Date().getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      venciCount++;
      return { status: 'red', text: 'Vencido' };
    } else if (daysDiff <= 30) {
      proxCount++;
      return { status: 'yellow', text: 'Próximo a Vencer' };
    }
    return { status: 'green', text: 'Al día' };
  };

  const exportCSV = () => {
    const headers = "ID,Nombre,Raza,Sexo,Estado,Origen\n";
    const rows = dogs.map(d => `${d.id},${d.nombre},${d.raza || ''},${d.sexo},${d.estado},${d.origen || ''}`).join("\n");
    const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Sistema_K9_Export.csv";
    link.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Control General</h1>
        <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Activity className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Perros Totales</p>
            <p className="text-2xl font-bold text-slate-800">{dogs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">En Servicio Activo</p>
            <p className="text-2xl font-bold text-slate-800">{activeDogs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Clock className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Por Vencer (Sanidad)</p>
            <p className="text-2xl font-bold text-slate-800">{proxCount > 0 ? proxCount : '?'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><AlertTriangle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Alertas Vencidas</p>
            <p className="text-2xl font-bold text-slate-800">{venciCount > 0 ? venciCount : '?'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
               <input type="text" placeholder="Buscar perro por nombre..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2 border border-slate-200 rounded-lg" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
               <option value="">Cualquier estado</option>
               <option value="activo">En Servicio Activo</option>
               <option value="entrenamiento">Entrenamiento</option>
               <option value="retirado">Retirado</option>
            </select>
         </div>
        
        <div className="p-6 overflow-x-auto">
          {loading ? <p className="text-slate-500 py-4">Cargando...</p> : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-slate-500 border-b border-slate-200">
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">Raza</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Sanidad</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dogs.map(dog => {
                  const sanidad = getSanitaryStatus(dog);
                  return (
                    <tr key={dog.id} onClick={() => navigate(`/dogs/${dog.id}`)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="py-4 font-medium text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                          {dog.foto_url ? <img src={`http://localhost:5000${dog.foto_url}`} alt="" className="w-full h-full object-cover"/> : null}
                        </div>
                        {dog.nombre}
                      </td>
                      <td className="py-4 text-slate-600">{dog.raza}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${dog.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {dog.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                           <div className={`w-3 h-3 rounded-full ${sanidad.status === 'red' ? 'bg-red-500' : sanidad.status === 'yellow' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                           <span className={sanidad.status === 'red' ? 'text-red-600 font-bold' : ''}>{sanidad.text}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {dogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">No hay resultados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
