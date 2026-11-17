import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { FeedbackContext } from '../context/FeedbackContext';

// Sistema de avisos de la app: reemplaza a window.alert / window.confirm.
// Uso:
//   const { toast, confirm } = useFeedback();
//   toast.success('Guardado');
//   if (!(await confirm({ mensaje: '¿Borrar?', tono: 'danger' }))) return;


let contador = 0;

const TIPOS = {
  success: {
    Icono: CheckCircle2,
    borde: 'border-l-emerald-500',
    icono: 'text-emerald-500'
  },
  error: {
    Icono: XCircle,
    borde: 'border-l-red-500',
    icono: 'text-red-500'
  },
  warning: {
    Icono: AlertTriangle,
    borde: 'border-l-amber-500',
    icono: 'text-amber-500'
  },
  info: {
    Icono: Info,
    borde: 'border-l-blue-500',
    icono: 'text-blue-500'
  }
};

const DURACION = { success: 4500, info: 4500, warning: 6000, error: 8000 };

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialogo, setDialogo] = useState(null);
  const resolverRef = useRef(null);
  const confirmarRef = useRef(null);

  const quitarToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => {
    const push = (tipo, mensaje, opciones = {}) => {
      const id = ++contador;
      const duracion = opciones.duracion ?? DURACION[tipo] ?? 4500;
      setToasts((prev) => [...prev, { id, tipo, mensaje }].slice(-4));
      if (duracion > 0) setTimeout(() => quitarToast(id), duracion);
      return id;
    };

    return {
      success: (mensaje, opciones) => push('success', mensaje, opciones),
      error: (mensaje, opciones) => push('error', mensaje, opciones),
      warning: (mensaje, opciones) => push('warning', mensaje, opciones),
      info: (mensaje, opciones) => push('info', mensaje, opciones),
      dismiss: quitarToast
    };
  }, [quitarToast]);

  const confirm = useCallback((config = {}) => new Promise((resolve) => {
    // Si ya había un diálogo abierto, se cancela antes de reemplazarlo.
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    resolverRef.current = resolve;
    setDialogo({
      titulo: 'Confirmar acción',
      mensaje: '',
      confirmar: 'Aceptar',
      cancelar: 'Cancelar',
      tono: 'danger',
      ...(typeof config === 'string' ? { mensaje: config } : config)
    });
  }), []);

  const cerrar = useCallback((resultado) => {
    setDialogo(null);
    const resolver = resolverRef.current;
    resolverRef.current = null;
    if (resolver) resolver(resultado);
  }, []);

  useEffect(() => {
    if (!dialogo) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmarRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrar(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        cerrar(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflowPrevio;
    };
  }, [dialogo, cerrar]);

  const tono = dialogo?.tono === 'primary'
    ? { Icono: Info, circulo: 'bg-blue-50 text-blue-600', boton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' }
    : { Icono: AlertTriangle, circulo: 'bg-red-50 text-red-600', boton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* AVISOS (TOASTS) */}
      <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[120] flex flex-col items-center gap-3 pointer-events-none print:hidden">
        {toasts.map((t) => {
          const cfg = TIPOS[t.tipo] || TIPOS.info;
          const { Icono } = cfg;
          return (
            <div
              key={t.id}
              role={t.tipo === 'error' ? 'alert' : 'status'}
              aria-live={t.tipo === 'error' ? 'assertive' : 'polite'}
              className={`fb-toast pointer-events-auto flex w-full sm:w-auto sm:min-w-[20rem] sm:max-w-md items-start gap-3 rounded-xl border border-slate-100 border-l-4 ${cfg.borde} bg-white px-4 py-3 shadow-lg`}
            >
              <Icono className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.icono}`} />
              <p className="flex-1 text-sm font-medium text-slate-700 break-words">{t.mensaje}</p>
              <button
                type="button"
                onClick={() => quitarToast(t.id)}
                className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
                aria-label="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      {dialogo && (
        <div
          className="fb-overlay fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => cerrar(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-titulo"
            aria-describedby="feedback-mensaje"
            className="fb-panel bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${tono.circulo}`}>
                  <tono.Icono className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 id="feedback-titulo" className="text-lg font-bold text-slate-800">{dialogo.titulo}</h3>
                  {dialogo.mensaje && (
                    <p id="feedback-mensaje" className="mt-1 text-sm text-slate-600 whitespace-pre-line">{dialogo.mensaje}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => cerrar(false)}
                  className="px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {dialogo.cancelar}
                </button>
                <button
                  type="button"
                  ref={confirmarRef}
                  onClick={() => cerrar(true)}
                  className={`px-4 py-2.5 text-white rounded-lg font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 ${tono.boton}`}
                >
                  {dialogo.confirmar}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;
