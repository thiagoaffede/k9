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
    link.download = "SeccionCanes_Export.csv";
    link.click();
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 outfit">Panel General</h1>
          <p className="text-slate-500 mt-1 font-medium">Resumen operativo y estado sanitario del cuartel.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
          <Download className="w-4 h-4 mr-2" /> Exportar a CSV
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center space-x-5 hover:-translate-y-1 hover:shadow-lg transition-transform duration-300 cursor-default">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Activity className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Perros Totales</p>
            <p className="text-3xl font-extrabold text-slate-800 outfit">{dogs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center space-x-5 hover:-translate-y-1 hover:shadow-lg transition-transform duration-300 cursor-default">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Servicio Activo</p>
            <p className="text-3xl font-extrabold text-slate-800 outfit">{activeDogs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center space-x-5 hover:-translate-y-1 hover:shadow-lg transition-transform duration-300 cursor-default">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl"><Clock className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Por Vencer</p>
            <p className="text-3xl font-extrabold text-slate-800 outfit">{proxCount > 0 ? proxCount : '0'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center space-x-5 hover:-translate-y-1 hover:shadow-lg transition-transform duration-300 cursor-default">
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl"><AlertTriangle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Para Atención</p>
            <p className="text-3xl font-extrabold text-slate-800 outfit">{venciCount > 0 ? venciCount : '0'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden mb-8">
         <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
               <input type="text" placeholder="Buscar por nombre..." className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium text-slate-700"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium text-slate-600 appearance-none min-w-[200px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
               <option value="">Todos los Estados</option>
               <option value="activo">Servicio Activo</option>
               <option value="entrenamiento">En Entrenamiento</option>
               <option value="retirado">Retirado / Baja</option>
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
