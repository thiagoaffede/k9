#!/usr/bin/env node
/**
 * Versionado y novedades de Sección Canes.
 *
 * Toma los commits desde la última versión publicada, arma las viñetas que ve
 * la clienta en el login y sube el número de versión.
 *
 *   npm run versionar              escribe los archivos y muestra el commit
 *   npm run versionar -- --dry     muestra lo que haría, sin tocar nada
 *   npm run versionar -- --commit  además commitea y crea el tag vX.Y.Z
 *   ... --major | --minor | --patch  fuerza el tipo de salto
 *
 * Regla de versionado: feat -> minor, fix/perf -> patch, breaking -> major.
 * docs/chore/ci/test no se muestran (el login es público y no le sirven a la
 * clienta), salvo que no quede ningún cambio visible: ahí no se versiona.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const RUTA_DATOS = path.join(RAIZ, 'frontend', 'src', 'data', 'novedades.json');
const RUTA_CHANGELOG = path.join(RAIZ, 'CHANGELOG.md');
const RUTA_PKG = path.join(RAIZ, 'frontend', 'package.json');
const IDENTIDAD = [
  '-c', 'user.name=Thiago Affede',
  '-c', 'user.email=62530514+thiagoaffede@users.noreply.github.com'
];

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const COMMIT = args.includes('--commit');
const FORZAR = args.includes('--major') ? 'major'
  : args.includes('--minor') ? 'minor'
    : args.includes('--patch') ? 'patch'
      : null;

const git = (...a) => execFileSync('git', a, { cwd: RAIZ, encoding: 'utf8' }).trim();

const salir = (mensaje, codigo = 0) => {
  console.log(mensaje);
  process.exit(codigo);
};

const hoy = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

// ---------------------------------------------------------------- datos
const datos = fs.existsSync(RUTA_DATOS)
  ? JSON.parse(fs.readFileSync(RUTA_DATOS, 'utf8'))
  : { actual: '0.0.0', versiones: [] };

const ultima = datos.versiones[0];
const desde = ultima?.hash ? `${ultima.hash}..HEAD` : 'HEAD';

// ---------------------------------------------------------------- commits
const crudos = git('log', '--no-merges', '--pretty=%H%x09%s', desde)
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const limpiar = (texto) => {
  const t = texto.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  const mayuscula = t.charAt(0).toUpperCase() + t.slice(1);
  return mayuscula.length > 110 ? `${mayuscula.slice(0, 107)}...` : mayuscula;
};

const clasificar = (asunto) => {
  if (/^merge\b/i.test(asunto)) return null;
  if (/^chore\(release\)/i.test(asunto)) return null;
  if (/^revert\b/i.test(asunto)) return null;

  const m = /^([a-zA-Z]+)(\([^)]*\))?(!)?:\s*(.+)$/.exec(asunto);
  if (!m) return { tipo: 'novedad', breaking: false, texto: limpiar(asunto) };

  const prefijo = m[1].toLowerCase();
  const breaking = Boolean(m[3]);
  const texto = limpiar(m[4]);

  if (['feat', 'fix', 'perf'].includes(prefijo)) {
    return { tipo: prefijo === 'feat' ? 'novedad' : 'arreglo', breaking, texto };
  }
  if (['docs', 'chore', 'ci', 'test', 'build', 'style', 'refactor'].includes(prefijo)) {
    return { tipo: 'interno', breaking, texto };
  }
  return { tipo: 'novedad', breaking, texto };
};

const commits = crudos
  .map((linea) => {
    const [hash, asunto] = linea.split('\t');
    return { hash, asunto, ...(clasificar(asunto) || {}) };
  })
  .filter((c) => c.tipo);

const visibles = commits.filter((c) => c.tipo !== 'interno');
const conBreaking = commits.some((c) => c.breaking);

if (!visibles.length) {
  salir(commits.length
    ? 'Solo hubo cambios internos (docs, chore, refactor): no hay nada visible para versionar.'
    : 'No hay nada para versionar.');
}

// Una viñeta por texto, sin repetir.
const vistos = new Set();
const cambios = [];
for (const c of visibles.slice().reverse()) {
  const clave = c.texto.toLowerCase();
  if (vistos.has(clave)) continue;
  vistos.add(clave);
  cambios.push(c.texto);
}

// ---------------------------------------------------------------- versión
const subir = (version, salto) => {
  const [mayor, menor, parche] = version.split('.').map((n) => parseInt(n, 10) || 0);
  if (salto === 'major') return `${mayor + 1}.0.0`;
  if (salto === 'minor') return `${mayor}.${menor + 1}.0`;
  return `${mayor}.${menor}.${parche + 1}`;
};

const salto = FORZAR
  || (conBreaking ? 'major' : visibles.some((c) => c.tipo === 'novedad') ? 'minor' : 'patch');
const nueva = subir(datos.actual, salto);

const entrada = {
  version: nueva,
  fecha: hoy(),
  tipo: salto,
  hash: git('rev-parse', '--short', 'HEAD'),
  cambios
};

const versiones = [entrada, ...datos.versiones];

// ---------------------------------------------------------------- salida
console.log(`\n${datos.actual}  ->  v${nueva}  (${salto})`);
console.log(`commits incluidos: ${visibles.length}${commits.length !== visibles.length ? ` (${commits.length - visibles.length} internos omitidos)` : ''}\n`);
for (const c of cambios) console.log(`  • ${c}`);
console.log('');

if (DRY) salir('Modo --dry: no se escribió nada.');

// ---------------------------------------------------------------- archivos
fs.writeFileSync(
  RUTA_DATOS,
  `${JSON.stringify({ actual: nueva, versiones }, null, 2)}\n`,
  'utf8'
);

const lineas = [
  '# Novedades',
  '',
  'Historial de versiones de Sección Canes. Lo mismo que se ve en el login.',
  ''
];
for (const v of versiones) {
  lineas.push(`## v${v.version} - ${v.fecha}`, '');
  for (const c of v.cambios) lineas.push(`- ${c}`);
  lineas.push('');
}
fs.writeFileSync(RUTA_CHANGELOG, lineas.join('\n'), 'utf8');

const pkg = JSON.parse(fs.readFileSync(RUTA_PKG, 'utf8'));
pkg.version = nueva;
fs.writeFileSync(RUTA_PKG, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

console.log('Actualizado: frontend/src/data/novedades.json, CHANGELOG.md, frontend/package.json');

if (!COMMIT) {
  console.log(`\nPróximo paso:\n  git add frontend/src/data/novedades.json CHANGELOG.md frontend/package.json\n  git commit -m "chore(release): v${nueva}"`);
  process.exit(0);
}

const archivos = ['frontend/src/data/novedades.json', 'CHANGELOG.md', 'frontend/package.json'];
execFileSync('git', ['add', ...archivos], { cwd: RAIZ, stdio: 'inherit' });
execFileSync('git', [...IDENTIDAD, 'commit', '-m', `chore(release): v${nueva}`], { cwd: RAIZ, stdio: 'inherit' });
execFileSync('git', [...IDENTIDAD, 'tag', '-a', `v${nueva}`, '-m', `v${nueva}`], { cwd: RAIZ, stdio: 'inherit' });
console.log(`\nCommit y tag v${nueva} creados. Falta: git push origin master --follow-tags`);
