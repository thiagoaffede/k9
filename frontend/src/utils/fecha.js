/**
 * Helpers de fechas.
 *
 * Por que existe: las columnas son "timestamp without time zone" y Prisma las
 * serializa como ISO con Z (medianoche UTC). Si se renderizan con
 * new Date(x).toLocaleDateString(), el navegador las corre un dia para atras en
 * zonas con offset negativo (Argentina = UTC-3):
 *
 *   '2026-10-20T00:00:00.000Z' -> 19/10/2026   <- bug
 *
 * Por eso aca leemos la parte textual del ISO, sin construir un objeto Date:
 * el valor guardado ya ES la fecha de calendario que se quiso registrar.
 */

/** Formatea un ISO a dd/mm/aaaa usando la fecha tal cual se guardo. */
export const fmtFecha = (valor) => {
  if (!valor) return '-';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '-';
};

/** Hoy en formato yyyy-mm-dd, para valores por defecto de <input type="date">. */
export const hoyISO = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};