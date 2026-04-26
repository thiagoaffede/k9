import React from 'react';
import { Shield, Activity, Award, User, Calendar, MapPin, Hash, Info } from 'lucide-react';
import { BASE_URL } from '../services/api';

const FichaTecnicaPDF = ({ dog }) => {
  const photoURL = dog.foto_url 
    ? (dog.foto_url.startsWith('http') ? dog.foto_url : `${BASE_URL}${dog.foto_url}`)
    : 'https://via.placeholder.com/150?text=No+Foto';
  const today = new Date().toLocaleDateString();

  return (
    <div className="hidden print:block w-full max-w-[210mm] mx-auto bg-white p-10 text-slate-800 font-sans min-h-screen">
      {/* HEADER DE LA FICHA */}
      <div className="flex justify-between items-start border-b-4 border-blue-600 pb-6 mb-8">
        <div>
          <div className="flex flex-col mb-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase outfit text-slate-900 leading-none">Ficha Técnica de Operaciones</h1>
            <p className="text-blue-600 font-extrabold tracking-[0.2em] text-[9px] uppercase mt-2 pl-1 border-t border-blue-100 pt-1">Sección Canes - Unidad N° 4 • Registro Oficial</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha de Expedición</p>
          <p className="font-bold text-slate-700">{today}</p>
        </div>
      </div>

      {/* BLOQUE DE IDENTIDAD PRINCIPAL */}
      <div className="flex space-x-8 mb-10">
        <div className="w-48 h-48 bg-slate-100 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-sm shrink-0">
          <img src={photoURL} alt={dog.nombre} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-5xl font-black text-slate-900 outfit uppercase tracking-tighter mb-1">{dog.nombre}</h2>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div className="flex items-center">
              <Hash className="w-4 h-4 mr-2 text-slate-400" />
              <span className="font-bold text-slate-500 mr-2 uppercase text-[10px]">Chip:</span>
              <span className="font-bold text-slate-800">{dog.nro_chip || 'SIN REGISTRO'}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              <span className="font-bold text-slate-500 mr-2 uppercase text-[10px]">Origen:</span>
              <span className="font-bold text-slate-800 uppercase tracking-tight">{dog.origen || 'NO ESPECIFICADO'}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 border border-slate-300 rounded-full" style={{ backgroundColor: dog.color?.toLowerCase() === 'marron' ? '#8B4513' : dog.color?.toLowerCase() === 'negro' ? '#000' : '#CBD5E1' }}></div>
              <span className="font-bold text-slate-500 mr-2 uppercase text-[10px]">Color:</span>
              <span className="font-bold text-slate-800 uppercase tracking-tight">{dog.color || 'NO REGISTRADO'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <span className="font-bold text-slate-500 mr-2 uppercase text-[10px]">Nacimiento:</span>
              <span className="font-bold text-slate-800">{dog.fecha_nacimiento ? new Date(dog.fecha_nacimiento).toLocaleDateString() : 'NO REGISTRADA'}</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2 text-slate-400" />
              <span className="font-bold text-slate-500 mr-2 uppercase text-[10px]">Estado:</span>
              <span className="font-bold text-blue-700 uppercase">{dog.estado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUERPO DE LA FICHA - GRID DOS COLUMNAS */}
      <div className="grid grid-cols-2 gap-10">
        
        {/* COLUMNA IZQUIERDA: SALUD Y ASIGNACIÓN */}
        <div className="space-y-8">
          {/* SECCIÓN SALUD */}
          <section>
            <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-emerald-500 pl-3">
              <Activity className="w-4 h-4 mr-2 text-emerald-500" /> Sanidad y Vacunación
            </h3>
            <div className="space-y-3">
              {dog.vaccines?.slice(0, 5).map(v => (
                <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-800 uppercase">{v.vacuna}</span>
                    <span className="text-emerald-600">{new Date(v.fecha_aplicacion).toLocaleDateString()}</span>
                  </div>
                  {v.proxima_dosis && (
                    <p className="text-slate-400 font-medium">Próxima dosis sugerida: {new Date(v.proxima_dosis).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
              {(!dog.vaccines || dog.vaccines.length === 0) && (
                <p className="text-slate-400 text-xs italic">No hay registros de vacunas recientes.</p>
              )}
            </div>
          </section>

          {/* SECCIÓN ALIMENTACIÓN */}
          <section>
            <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-orange-500 pl-3">
              <Activity className="w-4 h-4 mr-2 text-orange-500" /> Plan de Alimentación
            </h3>
            {dog.feedings?.length > 0 ? (
              <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 text-xs">
                <div className="flex justify-between font-bold mb-2">
                  <span className="text-orange-900 uppercase">{dog.feedings[0].tipo_alimento} ({dog.feedings[0].marca || 'S/M'})</span>
                  <span className="text-orange-700">{dog.feedings[0].cantidad_diaria}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <p><span className="font-bold text-orange-800 uppercase">Horarios:</span> {dog.feedings[0].horario || 'N/R'}</p>
                  <p><span className="font-bold text-orange-800 uppercase">Suplementos:</span> {dog.feedings[0].suplementos || 'Ninguno'}</p>
                </div>
                {dog.feedings[0].observaciones && (
                  <p className="mt-2 pt-2 border-t border-orange-100 italic text-slate-600">{dog.feedings[0].observaciones}</p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">Sin plan de alimentación registrado.</p>
            )}
          </section>

          {/* ASIGNACIÓN ACTUAL */}
          <section>
            <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-blue-500 pl-3">
              <User className="w-4 h-4 mr-2 text-blue-500" /> Asignación de Servicio
            </h3>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              {dog.assignments?.length > 0 ? (
                <div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Guía Designado</p>
                  <p className="text-lg font-black text-blue-800 outfit">{dog.assignments[0].guia}</p>
                  <p className="text-xs font-bold text-blue-600/70 mt-1 uppercase">Turno: {dog.assignments[0].turno} • Desde: {new Date(dog.assignments[0].fecha_inicio).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">Perro disponible para asignación.</p>
              )}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: ENTRENAMIENTO Y OBSERVACIONES */}
        <div className="space-y-8">
          <section>
            <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-indigo-500 pl-3">
              <Award className="w-4 h-4 mr-2 text-indigo-500" /> Historial Operativo
            </h3>
            <div className="space-y-3">
              {dog.trainings?.slice(0, 4).map(t => (
                <div key={t.id} className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-100 text-xs shadow-sm">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-indigo-800 uppercase">{t.tipo}</span>
                    <span className="text-indigo-400">{new Date(t.fecha).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 leading-tight">Nivel: <span className="font-bold text-indigo-700">{t.nivel}</span>. {t.evaluacion}</p>
                </div>
              ))}
              {(!dog.trainings || dog.trainings.length === 0) && (
                <p className="text-slate-400 text-xs italic">Sin registros de capacitación operativa.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-slate-400 pl-3">
              <Info className="w-4 h-4 mr-2 text-slate-400" /> Observaciones de Campo
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 h-40">
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                {dog.observaciones || 'Sin observaciones registradas a la fecha.'}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* FOODER Y FIRMAS */}
      <div className="mt-16 pt-10 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-10">
          <div className="text-center pt-10 border-t border-slate-300">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Firma del Guía / Responsable</p>
          </div>
          <div className="text-center flex items-center justify-center opacity-10 grayscale">
            <Shield className="w-16 h-16" />
          </div>
          <div className="text-center pt-10 border-t border-slate-300">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sello de la Unidad / Vet.</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Documento Oficial Generado Digitalmente por K9 System Management</p>
        </div>
      </div>
    </div>
  );
};

export default FichaTecnicaPDF;
