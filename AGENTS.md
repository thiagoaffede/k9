# AGENTS.md — K9 (perros de rescate)

Instrucciones operativas para cualquier agente que trabaje en este repo.

---

## REGLA PRINCIPAL — historial obligatorio

Al terminar **cualquier** cambio en este proyecto (código, config, schema,
migración, deploy, o una corrección de un bug), agregá una entrada al final de
`NOTAS.md` **antes** de dar por terminada la tarea.

Si no la anotaste, la tarea no está terminada.

Formato (copiá el estilo de las entradas que ya están):

```markdown
### <AAAA-MM-DD> — <título corto>
- **Qué:** qué se hizo, en una o dos líneas.
- **Por qué:** el problema o la causa raíz.
- **Archivos:** rutas de los archivos tocados.
- **Verificación:** cómo se comprobó (comando, endpoint, conteo antes/después).
- **Aprendizaje:** la regla que deja este cambio, para no repetirlo.
```

Leé `NOTAS.md` antes de tocar algo que ya se rompió antes: casi todo lo que
hay abajo tiene un antecedente documentado ahí.

---

## Estructura

- `backend/` — Express + Prisma. Puerto 5000 en dev, 10000 en Render.
- `frontend/` — React + Vite + Tailwind. SPA, sin router de servidor.
- `render.yaml` — define los 2 servicios de Render (web + static).

Flujo de deploy: pushear a `master` dispara el build en Render
(`npm install && npm run build`) y en Vercel.

- Backend: `https://k9-emmo.onrender.com`
- Frontend (Vercel, preview): `https://k9-pink.vercel.app`
- Producción: `https://seccioncanes.com`
- El frontend llama al backend por `VITE_API_URL`, con fallback local.

## Comandos

| Dónde | Qué | Para qué |
|---|---|---|
| `backend/` | `npm run dev` | nodemon, puerto 5000 |
| `backend/` | `npm start` | producción |
| `backend/` | `npx prisma generate` | regenerar el cliente tras tocar el schema |
| `backend/` | `npx prisma migrate status` | ver migraciones pendientes (**siempre con URL directa**) |
| `backend/` | `npx prisma migrate dev --name x` | crear migración en local |
| `frontend/` | `npm run dev` | Vite |
| `frontend/` | `npm run build` | build |
| `frontend/` | `npm run lint` | ESLint |

`npm run build` del backend es `prisma generate && prisma migrate deploy`.
Ojo: en Render ese `migrate deploy` corre contra el pooler.

## Roles

`admin`, `veterinario`, `instructor`, `guia`. JWT de 24h + bcrypt.
El backend valida el rol por ruta con `roleMiddleware([...])`; el frontend
solo oculta botones. **Ocultar un botón no es autorización**: el backend es la
única frontera real.

Al agregar o cambiar una ruta, revisá los dos lados.

---

## Reglas que aprendimos en el camino

### 1. Las fechas no se renderizan con `new Date(...)`
Las columnas son `timestamp without time zone`. Prisma las devuelve como ISO
con `Z` (medianoche UTC). Si hacés `new Date(x).toLocaleDateString()`, en
Argentina (UTC-3) se ve **un día antes** de lo que se guardó.

Usá siempre `fmtFecha(x)` de `frontend/src/utils/fecha.js`, que lee la parte
textual del ISO sin construir un `Date`.

Para los `<input type="date">`: value = `yyyy-mm-dd`. Ojo con los campos
opcionales: si ponés `value={x || hoyISO()}` el usuario no puede dejarlo vacío.

### 2. Pooler para runtime, URL directa para migraciones
- `DATABASE_URL` → **pooler** (`:6543?pgbouncer=true`). Es lo que usa el runtime.
- `DIRECT_URL` → **directa** (`:5432?sslmode=require`). Solo migraciones y scripts.

El runtime en Render no puede alcanzar `db.*.supabase.co:5432`. Sin
`?pgbouncer=true`, `migrate status` se cuelga.

> Pendiente: falta agregar `directUrl = env("DIRECT_URL")` al schema para que
> `migrate deploy` no dependa del pooler.

### 3. `node_modules` y el cliente de Prisma no se versionan
Un `node_modules` commiteado (10006 archivos) hizo que Render arrancara con
un query engine viejo: el código nuevo ya servía la ruta DELETE de
entrenamientos, pero el engine rechazaba `Vaccine.tipo` con
`Unknown argument tipo` → **crear una vacuna daba 500 en producción**,
aunque la columna existiera en la base y la migración estuviera aplicada.

Si un campo existe en el schema, en la base y en la API sigue dando
`Unknown argument`, el culpable es el cliente generado: `prisma generate`.

### 4. Nunca `git add .`
`backend/.env` y `backend/node_modules` estuvieron años en el índice. Hoy
`.gitignore` los cubre, pero stageá rutas explícitas igual: el índice es
histórico y un `add .` reintroduce lo que se acaba de sacar.

`backend/.env` contiene credenciales reales de producción. No se commitea.

### 5. Verificar contra la base real, y no dejar basura
- Contá filas antes y después de una migración o un test, y compará.
- Los endpoints de borrado no cubren todo: `vetcontrols` **no tiene** ruta
  DELETE. Para limpiar ese tipo de basura hay que ir por Prisma.
- Cada alta escribe una fila en `History`. Si creaste un registro de prueba
  para verificar, borrá también su historial.
- Asertá **valores esperados**, no "no tira error". Un test de IDOR que usa
  el mismo id de perro en ambos lados no prueba nada.

### 6. Ninguna afirmación de deploy sin caso control
`router.use(authMiddleware)` corre para **todo** path bajo `/api/dogs`,
aunque no exista. Un 401 no prueba que la ruta esté viva.

Antes de decir "ya está en producción":
1. probá la ruta con un token real,
2. compará contra un path que **no** debería funcionar,
3. usá un fingerprint de código (un string único del bundle).

`/health` no toca la base: que responda `{"status":"ok"}` no significa que la
app sirva. Para vaccines hace falta login + consulta real.

### 7. No reconstruir un valor secreto truncado
Las herramientas pueden truncar la salida. Si ves
`postgres.sjig...:esto_es_una_prue...`, **no completes de memoria**: leelo
programáticamente (`[uri]$url.UserInfo`) y verificá que la credencial
funcione antes de pedirle a alguien que la configure.

---

## Trampas del repo

- `frontend/.gitignore` existe; el `.gitignore` de la raíz es nuevo (2026-10-04).
- `npm run lint` en frontend tiene **9 problemas preexistentes**
  (6 errores, 3 warnings) en `AuthContext.jsx`, `Dashboard.jsx`, `Login.jsx`,
  `UsersList.jsx` y `DogProfile.jsx`. **No son tuyos.** No los arregles de
  pasada sin avisar: la línea base de lint está sucia.
- No hay tests automatizados. La verificación es manual contra la API.
- No hay `.prettierrc` ni formato consistente: respetá el estilo del archivo
  que estás tocando.
- Los ancestros van en minúscula sin tilde (`sanas`, `casa`) y los nombres
  propios conservan mayúscula.
- La UI es en español, con tildes. Mantener.

## Modelo de datos

`Dog` (soft delete con `deletedAt`), `Vaccine` (con `tipo`: `vacuna` |
`antiparasitario` | `desparasitacion`), `VetControl`, `Feeding`, `Training`,
`Assignment` (histórica, `fecha_fin` null = activa), `Incident`, `History`,
`User`.

Migraciones en `backend/prisma/migrations/`. La baseline es `0_init`
(marcada aplicada sin ejecutar). Agregar migraciones siempre con nombre
descriptivo y `prisma migrate status` antes de deployar.

## Git

- Rama única: `master`. Se pushea directo.
- Identidad: `Thiago Affede <62530514+thiagoaffede@users.noreply.github.com>`.
  No hay `git config` global, así que pasala con
  `git -c user.name=... -c user.email=... commit`.
- No commitear sin que lo pidan.