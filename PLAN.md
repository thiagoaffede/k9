# K9 — Plan de Trabajo

Checklist de mejoras de seguridad, estabilidad y deuda técnica. Ordenado por prioridad.

---

## Fase 1 — Críticos de seguridad (backend)

- [ ] **1. Sanear secrets del repo**
  - [ ] Crear `.gitignore` en `backend/` y en la raíz (`.env`, `node_modules`, `uploads/`, `scratch/`, `prisma/generated/`, `prisma/schema_old.prisma`)
  - [ ] `git rm --cached backend/.env`
  - [ ] `git rm --cached` de `node_modules/` (todo el árbol)
  - [ ] `git rm --cached` de `backend/uploads/`, `backend/scratch/`, `backend/prisma/schema_old.prisma`, `backend/prisma/generated/sqlserver/`
  - [ ] Verificar que `.env` ya no figura en `git ls-files`
  - [ ] Agregar `.env*` al `.gitignore` de `frontend/`

- [ ] **2. Cerrar privilege escalation en registro**
  - [ ] `backend/src/routes/auth.routes.js`: quitar `/register` público o exigir token de admin
  - [ ] `backend/src/controllers/auth.controller.js`: ignorar `rol` del body y/o validar contra whitelist `['admin','veterinario','instructor','guia']`
  - [ ] Aplicar mismo ajuste en `user.controller.js:createUser` (que ya es admin-only)

- [ ] **3. Rate limiting + helmet**
  - [ ] Instalar `express-rate-limit` y `helmet` en `backend/`
  - [ ] Limitar `/api/auth/login` (p. ej. 10 intentos / 15 min)
  - [ ] Aplicar `helmet()` en `backend/index.js`
  - [ ] Agregar handler de error global (no filtrar `error.message` al cliente)

- [ ] **4. Validación de entradas**
  - [ ] Whitelist de `rol`, `estado`, `sexo`, `gravedad`, `tipo` de incidente
  - [ ] Helper de `parseInt` seguro para params (evitar `NaN` → 500)
  - [ ] Validar campos requeridos y tipos en `createDog`/`updateDog`

---

## Fase 2 — Altos (backend)

- [ ] **5. Fix mass assignment**
  - [ ] `dog.controller.js:createDog` (línea ~68): reemplazar `...req.body` por whitelist de campos
  - [ ] `addVaccine`, `addVetControl`, `addIncident`, `addTraining`: idem
  - [ ] Bloquear campos reservados: `id`, `deletedAt`, `createdAt`, `updatedAt`, `foto_url` (excepto upload)

- [ ] **6. Fix IDOR en deletes de sub-entidades**
  - [ ] `deleteVaccine`, `deleteAssignment`, `deleteFeeding`, `deleteIncident`: verificar que el registro pertenezca al `id_perro` del URL
  - [ ] Devolver 404 si el registro no existe o no pertenece al perro

- [ ] **7. Upload seguro**
  - [ ] `upload.middleware.js`: agregar `fileFilter` (solo `image/*`, `application/pdf`)
  - [ ] `uploadMedicalDoc`: re-encode de imágenes a WebP, validar extensión de PDF

---

## Fase 3 — Frontend (bugs y UX)

- [ ] **8. Manejo de 401**
  - [ ] Interceptor de axios: en respuesta 401 → `logout()` + redirect a `/login`

- [ ] **9. AuthContext robusto**
  - [ ] `JSON.parse` de `k9_user` con `try/catch` (`AuthContext.jsx:12`)
  - [ ] Limpiar localStorage si el parse falla

- [ ] **10. Debounce en búsqueda**
  - [ ] `Dashboard.jsx:30-32`: fetch por tecla → debounce de ~300ms

- [ ] **11. CSV escaping**
  - [ ] `Dashboard.jsx:67-75`: escapar campos que empiecen con `=`, `+`, `-`, `@` (formula injection)

- [ ] **12. Correcciones varias**
  - [ ] Dashboard: perro sin vacunas ("Sin Registro", rojo) que no cuenta en "Para Atención"
  - [ ] `DogProfile.jsx:647`: role check en "Reportar Incidente" (que guia no pueda)
  - [ ] `DogProfile.jsx:42-47`: `handleDeleteDog` con `try/catch`
  - [ ] Guard de rutas por rol en `App.jsx` (no solo backend)
  - [ ] Considerar asignar guía por `user.id` en vez de `user.nombre` (`DogProfile.jsx:496-498`)

---

## Fase 4 — Acciones manuales (usuario)

- [ ] **13. Rotar credenciales** (están en el historial de git)
  - [ ] Regenerar `DATABASE_URL` (Supabase)
  - [ ] Regenerar `JWT_SECRET`
  - [ ] Regenerar S3/Storage keys (Supabase Storage)
  - [ ] Actualizar `.env` local y variables en Render

- [ ] **14. Scrubbing del historial de git**
  - [ ] Si el repo es/puede ser público: reescribir historia para eliminar `.env` (filter-repo)
  - [ ] `git remote set-url origin ...` y re-pushear después de limpiar

- [ ] **15. Cambiar password del admin default**
  - [ ] Cambiar `admin123` en producción
  - [ ] Actualizar `seed.js` para exigir password fuerte o generar aleatoria

---

## Extras (no bloqueantes)

- [ ] Agregar `prisma/migrations/` (hoy no existe; `migrate deploy` en Render no tiene nada que correr)
- [ ] Eliminar archivos muertos: `App.css`, `assets/vite.svg`, `assets/react.svg`, `assets/hero.png`
- [ ] `frontend/README.md` (sigue el template de Vite)
- [ ] `index.html` → `lang="es"`
- [ ] `debug.js`, archivos de `scratch/` y `.txt` de cloudflared en raíz: borrar o mover fuera del repo
- [ ] Paginación en `getDogs`