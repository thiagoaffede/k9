/**
 * Aplica las migraciones pendientes antes de arrancar el servidor.
 *
 * Por qué existe: el servicio de Render corre `npm install` como build, así
 * que `prisma migrate deploy` nunca se ejecuta en el deploy. Colgarlo acá
 * (dentro de `npm start`) hace que las migraciones se apliquen solas.
 *
 * Es deliberadamente NO fatal: si la base está pausada o inaccesible, se
 * loguea el error y el servidor arranca igual (degradado, como hasta ahora).
 * Con el flag --strict sí sale con código 1, que es lo que quiere un uso
 * manual (`npm run db:migrate`).
 */
const { execFile } = require('child_process');
const path = require('path');

const STRICT = process.argv.includes('--strict');
const TIMEOUT_MS = 120000;
const CLI = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');

// Se invoca la CLI con node: en la imagen de Render el shim de
// node_modules/.bin/prisma llega sin permiso de ejecución (exit 127).
execFile(process.execPath, [CLI, 'migrate', 'deploy'], { timeout: TIMEOUT_MS }, (error, stdout, stderr) => {
  const salida = `${stdout || ''}${stderr || ''}`.trim();

  if (!error) {
    const aplicadas = (stdout.match(/\d+ migrations? found/) || [])[0];
    console.log(`[migraciones] OK${aplicadas ? ` (${aplicadas})` : ''}`);
    if (salida) console.log(salida);
    return;
  }

  const motivo = error.killed
    ? `timeout de ${TIMEOUT_MS / 1000}s`
    : (error.code !== undefined ? `código ${error.code}` : error.message);

  console.error('[migraciones] FALLARON:', motivo);
  if (salida) console.error(salida);
  console.error(
    '[migraciones] El servidor arranca igual. Si hay migraciones pendientes, ' +
    'aplicalas con: npm run db:migrate (necesita la base accesible).'
  );

  if (STRICT) process.exitCode = 1;
});
