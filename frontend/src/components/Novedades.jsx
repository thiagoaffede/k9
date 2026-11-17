import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import datos from '../data/novedades.json';
import { fmtFecha } from '../utils/fecha';

// Bloque de novedades que se muestra en el login.
// Los datos salen de src/data/novedades.json, que actualiza `npm run versionar`.

const CLAVE_ULTIMA_VISTA = 'k9_ultima_version';

const Novedades = ({ maximo = 3 }) => {
  const [abierto, setAbierto] = useState(false);
  const actual = datos.actual;
  const ultima = datos.versiones[0];
  const anteriores = datos.versiones.slice(1);

  const esNueva = useMemo(() => {
    try {
      return localStorage.getItem(CLAVE_ULTIMA_VISTA) !== actual;
    } catch {
      return false;
    }
  }, [actual]);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ULTIMA_VISTA, actual);
    } catch {
      // Modo privado o storage bloqueado: el badge simplemente no persiste.
    }
  }, [actual]);

  if (!ultima) return null;

  const visibles = ultima.cambios.slice(0, maximo);
  const resto = ultima.cambios.length - visibles.length;

  return (
    <section className="mt-8 pt-6 border-t border-slate-200/70">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Novedades</h3>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 whitespace-nowrap">
            v{actual}
          </span>
          {esNueva && (
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
              Nuevo
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 shrink-0">{fmtFecha(ultima.fecha)}</span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {visibles.map((cambio) => (
          <li key={cambio} className="flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
            <span className="text-[12px] leading-snug text-slate-600">{cambio}</span>
          </li>
        ))}
        {resto > 0 && (
          <li className="pl-3 text-[11px] text-slate-400">
            y {resto} cambio{resto === 1 ? '' : 's'} más
          </li>
        )}
      </ul>

      {anteriores.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {abierto ? 'Ocultar versiones anteriores' : `Ver versiones anteriores (${anteriores.length})`}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`} />
          </button>

          {abierto && (
            <div className="fb-panel mt-3 max-h-40 overflow-y-auto pr-2 space-y-3 border-l-2 border-slate-100 pl-3">
              {anteriores.map((v) => (
                <div key={v.version}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">v{v.version}</span>
                    <span className="text-[10px] text-slate-400">{fmtFecha(v.fecha)}</span>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {v.cambios.map((cambio) => (
                      <li key={cambio} className="text-[11px] leading-snug text-slate-500">{cambio}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Novedades;
