# NOTAS.md — historial de cambios e incidentes

Bitácora del proyecto K9. Cada cambio (código, config, schema, migración,
deploy o corrección de bug) deja una entrada abajo.

**Formato**: `### <AAAA-MM-DD> — <título corto>` con los campos **Qué**,
**Por qué**, **Archivos**, **Verificación** y **Aprendizaje**. El
**Aprendizaje** es lo importante: es la regla que evita repetir el error, y
generalmente ya está reflejada en `AGENTS.md`.

---

### 2026-10-04 — Antiparasitarios en vacunas + borrado de entrenamientos
- **Qué:** `Vaccine.tipo` (`vacuna` | `antiparasitario` | `desparasitacion`)
  con select, badges y PDF; ruta `DELETE /api/dogs/:id/trainings/:tid` para
  admin e instructor con auditoría en `History`; el frontend deja de pedir
  rol admin para registrar entrenamientos, que era un desalineado con el
  backend.
- **Por qué:** los antiparasitarios se guardaban como `"vacuna"` y no había
  forma de borrar un entrenamiento mal cargado.
- **Archivos:** `backend/src/controllers/dog.controller.js`,
  `backend/src/routes/dog.routes.js`, `backend/prisma/schema.prisma`,
  `backend/prisma/migrations/0_init/`,
  `backend/prisma/migrations/20260101000000_add_vaccine_tipo/`,
  `frontend/src/pages/DogProfile.jsx`,
  `frontend/src/components/FichaTecnicaPDF.jsx`
- **Verificación:** E2E contra la API con token real: DELETE 200, repetido
  404, IDOR con id de perro distinto 404, instructor 200, veterinario y guía
  403. Tipo inválido cae a `vacuna`; `id` inyectado en el body se ignora.
  Conteo de filas idéntico antes y después. Commit `62ecf60`.
- **Aprendizaje:** una migración aplicada no garantiza que el cliente
  Prisma en el servidor la conozca. Ver la entrada siguiente.

---

### 2026-10-04 — Incidente: produccion caida por DATABASE_URL
- **Qué:** Render quedó sin conexión a la base y el sitio no servía.
- **Por qué:** se cambió el `DATABASE_URL` del servicio por la URL **directa**
  de Supabase, asumiendo que el runtime podía alcanzar `db.*:5432`. No puede:
  el pooler es la única vía accesible desde Render. El error era
  `P1001 can't reach database server`.
- **Archivos:** panel de Render (`k9-backend` → Environment).
- **Verificación:** login restaurado (`POST /api/auth/login` → 200 con token).
- **Aprendizaje:** dos URLs, dos propósitos. Pooler para el runtime, directa
  solo para migraciones. Nunca cambiar la variable de runtime "para arreglar"
  una migración.

---

### 2026-10-04 — El cliente de Prisma viejo rompia las vacunas en produccion
- **Qué:** se sacaron `backend/node_modules` (10006 archivos) y
  `backend/.env` del índice de git, y se agregó `.gitignore` en la raíz más
  un `backend/.env.example`.
- **Por qué:** `backend/node_modules/.prisma/client` estaba commiteado. Al
  construir, Render quedó con un **query engine viejo**: el código nuevo ya
  servía el DELETE de entrenamientos, pero el engine rechazaba `Vaccine.tipo`
  con `Unknown argument tipo`, así que **crear una vacuna o antiparasitario
  devolvía 500 en producción**. Confuso porque la columna sí existía en la
  base y la migración sí estaba aplicada: el culpable era el cliente
  generado, no el schema.
- **Archivos:** `.gitignore` (nuevo), `backend/.env.example` (nuevo),
  índice de git. Commit `d7bdcf5`.
- **Verificación:** `POST /api/dogs/:id/vaccines` en producción; conteo de
  `_prisma_migrations` y de columnas reales de `Vaccine` vía Prisma.
- **Aprendizaje:** si el campo existe en el schema **y** en la base, y la API
  igual dice `Unknown argument`, el problema es el cliente: `prisma generate`.
  El cliente generado es artefacto de build, nunca se versiona.

---

### 2026-10-04 — Las fechas elegidas en el calendario se guardaban un dia antes
- **Qué:** nuevo helper `fmtFecha` / `hoyISO` en
  `frontend/src/utils/fecha.js` que lee la parte textual del ISO sin
  construir un `Date`; 16 renderizados corregidos en `DogProfile.jsx` y
  `FichaTecnicaPDF.jsx`. Además se agregó campo de fecha donde no existía
  (control veterinario y los dos formularios de entrenamiento), y el tachito
  de borrar entrenamientos en los dos lugares donde se renderizan.
- **Por qué:** dos defectos distintos con la misma complaint. Uno: las
  columnas son `timestamp without time zone`, Prisma devuelve ISO con `Z`
  (medianoche UTC), y `new Date(x).toLocaleDateString()` en Argentina (UTC-3)
  muestra **un día antes** (`2026-10-20T00:00:00.000Z` se veía `19/10/2026`).
  Como casi todas las altas usaban la fecha del día, pasaba desapercibido y
  se hacía visible justo al elegir una fecha en el calendario. Dos: los
  formularios de control veterinario y entrenamiento no tenían input de
  fecha, así que el backend caía siempre en `new Date()` y quedaba siempre
  la fecha de hoy. El tachito faltaba en la lista compacta de
  entrenamientos: la tab "Operativo" los renderiza dos veces.
- **Archivos:** `frontend/src/utils/fecha.js` (nuevo),
  `frontend/src/pages/DogProfile.jsx`,
  `frontend/src/components/FichaTecnicaPDF.jsx`
- **Verificación:** `fmtFecha` 6/6 casos, incluido el contraste contra el
  método viejo. Build OK. Lint: los mismos 9 problemas preexistentes, cero
  nuevos. Commit `f6f6147`.
- **Aprendizaje:** "no se guarda la fecha que elegí" puede ser **desfase de
  zona horaria** o **campo que no existe en el formulario**. Son bugs
  distintos con el mismo síntoma; hay que probar el round-trip contra la API
  real antes de tocar código. Y no confiar en que un campo se ve en todas
  partes: si el mismo dato se renderiza dos veces, los dos lugares necesitan
  el mismo permiso.

---

### 2026-10-04 — Verificar contra la base real, y no dejar basura
- **Qué:** limpieza de los registros `SMOKE` creados al probar contra
  producción, incluidos 5 renglones de `History`.
- **Por qué:** los endpoints de borrado no cubren todo: **`vetcontrols` no
  tiene ruta DELETE**, y toda alta escribe una fila en `History`. Un test que
  crea datos y no los borra ensucia la base de producción.
- **Archivos:** — (solo base de datos)
- **Verificación:** conteo antes y después; 3 registros y 5 histories
  eliminados, 0 restantes.
- **Aprendizaje:** un smoke test que no limpia no es un smoke test, es
  basura. Contá filas antes y después, y asertá **valores esperados**: un
  test de IDOR que usa el mismo id de perro en ambos lados no prueba nada
  (pasó en esta sesión).

---

### 2026-11-09 — Formularios: borrado de foto, campos faltantes y errores silenciosos
- **Qué:** se corrigieron los formularios que no guardaban datos o lo hacían
  sin avisar. (1) `DELETE /api/dogs/:id/photo` borra la foto de la base **y**
  el archivo de Supabase S3; antes el frontend mandaba `PUT { foto_url: null }`
  y el backend lo ignoraba. (2) El formulario de control veterinario ahora
  captura y persiste `veterinario`, `diagnostico`, `medicacion`, `dosis` y
  `observaciones` (antes solo motivo/fecha/tratamiento, y la lista mostraba
  `Vet: undefined`). (3) La vacuna acepta `observaciones`. (4) Nuevo Perro y
  Editar Info ahora tienen Color, Origen y Señas Particulares (el estado
  inicial ya los tenía, pero no había inputs). (5) El entrenamiento
  autocompleta `instructor` con el usuario logueado. (6) Todos los submits y
  borrados muestran el mensaje del servidor en un `alert`; antes un 4xx/5xx
  quedaba como promesa rechazada y el formulario “no hacía nada”. (7) El
  interceptor de axios limpia la sesión y redirige al login ante un 401.
  (8) Backend: whitelist y validación con 400 en las altas de sub-entidades
  (vacuna, control, alimentación, entrenamiento, incidente, asignación) en
  lugar de `...req.body` y 500 genérico.
- **Por qué:** la API sí guardaba (E2E 22/23), pero el único fallo real de
  guardado era el borrado de foto. El resto eran campos que no existían en el
  formulario y errores que el frontend se tragaba: el usuario veía “no guarda”
  sin ningún mensaje. Además, si el token vencía, la UI seguía “logueada” y
  todos los formularios fallaban en silencio.
- **Archivos:** `backend/src/controllers/dog.controller.js`,
  `backend/src/routes/dog.routes.js`, `frontend/src/services/api.js`,
  `frontend/src/pages/DogProfile.jsx`, `frontend/src/pages/NewDog.jsx`,
  `frontend/src/components/FichaTecnicaPDF.jsx`
- **Verificación:** E2E real contra la API local con la base de producción:
  29/29 (altas de todas las sub-entidades, fechas, edición con objeto
  completo, borrado de foto, borrados de sub-entidades, validaciones 400) y
  matriz de roles 12/12 (veterinario/instructor/guía, incluidos los 403
  esperados). Chip duplicado verificado: segundo alta 409 con mensaje claro.
  Subida y borrado de foto verificados contra Supabase S3
  (el objeto deja de existir). Conteos antes/después idénticos
  (`dog=12`, `history=114`, `vaccine=13`, `training=6`, `assignment=1`,
  `incident=3`, `feeding=7`, `vetControl=2`, `user=3`); los perros y usuarios
  de prueba se borraron. `npm run build` OK; lint con los mismos 9 problemas
  preexistentes, cero nuevos.
- **Aprendizaje:** “no guarda” puede ser tres cosas distintas: un endpoint que
  ignora el campo (foto), un campo que no está en el formulario (veterinario,
  diagnóstico, señas) o un error que nadie muestra. Antes de tocar código hay
  que reproducir el round-trip contra la API real. Y un formulario sin
  `try/catch` convierte cualquier 500 en “no pasa nada”: siempre mostrar el
  `message` del backend.
### 2026-11-09 — Borrado de controles veterinarios
- **Qué:** se agregó la ruta `DELETE /api/dogs/:id/vetcontrols/:cid` y el botón
  de borrar en la sección Controles Veterinarios del perfil, visible para
  `admin` y `veterinario`.
- **Por qué:** `vetcontrols` era la única sub-entidad sin delete. Un control
  cargado por error (motivo equivocado, fecha mal tipeada) quedaba para siempre
  en la ficha, y la única forma de sacarlo era ir por Prisma a la base.
- **Archivos:** `backend/src/controllers/dog.controller.js`,
  `backend/src/routes/dog.routes.js`, `frontend/src/pages/DogProfile.jsx`.
- **Verificación:** server local en :5099 contra la base de producción,
  script E2E temporal (13/13):
  - POST de control como veterinario → 201.
  - DELETE con el id de un control del perro A usando el id de perro B en la
    URL → **404**, y la fila seguía en la base (IDOR cubierto).
  - DELETE como guía → **403**, fila intacta.
  - DELETE correcto → 200 y la fila desaparece.
  - Segundo DELETE → **404**, no 500.
  - POST + DELETE como admin → 201 / 200.
  - Conteos antes/después idénticos (`vetControl=2`, `history=114`); se
    borraron las 4 filas de historial generadas y los 2 usuarios temporales
    (veterinario/guía) creados solo para probar la matriz de roles.
  `npm run build` OK; lint con los mismos 9 problemas preexistentes.
- **Aprendizaje:** toda sub-entidad necesita su par POST/DELETE, y el delete
  no puede confiar en los IDs de la URL: hay que filtrar por
  `{ id, id_perro }` (o el 404 convierte un borrado cruzado en una fuga de
  datos). Un `delete` directo por id devuelve 500 (P2025) cuando el registro
  no existe; se responde 404.
