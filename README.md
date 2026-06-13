
<p align="center">
  <img src="https://raw.githubusercontent.com/thiagoaffede/k9/main/frontend/public/favicon.svg" alt="K9" width="100" />
</p>

<h1 align="center">K9 — Sistema de Gestión Canina</h1>

<p align="center">
  <strong>Sistema integral para unidades caninas militares y policiales</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express" alt="Express 5" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/🟢_En_Producción-22C55E?style=for-the-badge" alt="En Producción" />
</p>

<p align="center">
  <a href="https://seccioncanes.com">🌐 seccioncanes.com</a>
</p>

<br />

---

## 📋 Descripción

Sistema de gestión digital completo para la **Sección Canes Unidad N°4**. Reemplaza el registro en papel por una plataforma moderna que permite administrar todo el ciclo de vida de los perros de trabajo: desde el ingreso y vacunación hasta el entrenamiento operativo, incidentes y asignación de guías.

Diseñado para entornos militares/policiales con **control de acceso por roles** (Admin, Veterinario, Instructor, Guía) y **auditoría automática** de todas las acciones.

🔗 **Producción:** [seccioncanes.com](https://seccioncanes.com)

---

## ✨ Funcionalidades

### 🐕 Gestión de Canes
- Registro completo: nombre, raza, sexo, fecha de nacimiento, color, señas particulares, número de microchip (único)
- Estados: Activo, Retirado, Entrenamiento
- Foto optimizada a WebP con almacenamiento en Supabase S3
- Borrado lógico (soft delete con `deletedAt`)
- Historial de auditoría automático de cada acción

### 💉 Vacunación
- Registro de dosis aplicadas con fechas
- Alertas automáticas: próxima dosis (30 días antes) y vencidas
- Dashboard con contadores de "próximos a vencer" y "atención requerida"

### 🏥 Controles Veterinarios
- Registro de visitas: diagnóstico, tratamiento, medicación, dosis

### 🍖 Alimentación
- Planes por perro: tipo de alimento, marca, cantidad diaria, horarios, suplementos
- Historial de cambios de dieta

### 🎯 Entrenamiento y Readiness Operativo
- Tipos: Obediencia, Detección de Narcóticos, Explosivos, Búsqueda y Rescate, Guardia/Intervención
- Niveles: Inicial, En Formación, Operativo, Avanzado, Experto
- Evaluaciones con notas

### 👤 Asignación de Guías
- Asignación con turno (Mañana, Tarde, Noche, Rotativo, 24x48)
- Cierre automático de asignaciones anteriores
- Línea de tiempo visual de asignaciones activas e históricas

### 🚨 Incidentes
- Tipos: Mordeduras, Enfermedades, Problemas de Conducta, Transferencias, Muerte
- Niveles de gravedad: Bajo, Medio, Alto
- Cambio automático de estado a "Retirado" en caso de muerte
- Acciones correctivas asociadas

### 📊 Dashboard y Reportes
- Estadísticas: total de perros, activos, próximos a vencer, atención requerida
- Filtros por nombre y estado
- Exportación a CSV
- **Ficha Técnica PDF** (2 páginas) lista para imprimir con datos completos del perro
- Indicadores sanitarios: verde/amarillo/rojo

### 👥 Gestión de Usuarios
- Roles: Admin, Veterinario, Instructor, Guía
- Login con JWT (24h)
- Protección: no puedes eliminarte a vos mismo

### 📸 Fotos y Documentos
- Upload con optimización automática: redimensiona a 1024px, convierte a WebP (calidad 80)
- Almacenamiento en Supabase S3
- Borrado automático de fotos viejas al reemplazar

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js + Express 5 |
| **Frontend** | React 19 + Vite 8 |
| **ORM** | Prisma 6 |
| **Base de Datos** | PostgreSQL (Supabase) |
| **Storage** | Supabase S3 |
| **Auth** | JWT + bcryptjs |
| **CSS** | Tailwind CSS 4 |
| **Iconos** | Lucide React |
| **Hosting** | Render (backend + frontend) + Vercel (preview) |

---

## 📁 Estructura del Proyecto

```
K9/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Esquema de base de datos (8 modelos)
│   ├── src/
│   │   ├── config/                # Prisma client + S3 client
│   │   ├── controllers/           # auth, dog, user controllers
│   │   ├── middlewares/           # JWT + role middleware, upload
│   │   └── routes/                # RESTful endpoints
│   ├── index.js                   # Entry point
│   └── seed.js                    # Seed (admin@k9.com)
├── frontend/
│   ├── src/
│   │   ├── components/            # Layout, FichaTecnicaPDF
│   │   ├── context/               # AuthContext
│   │   ├── pages/                 # Login, Dashboard, DogProfile, etc.
│   │   └── services/              # API client (axios)
│   └── vite.config.js
└── render.yaml                    # Deploy config
```

---

## 🚀 Getting Started

### Requisitos
- Node.js 20+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Configurar DB + JWT + S3
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Seed (usuario admin)

```bash
cd backend
node seed.js
# Email: admin@k9.com / Pass: admin123
```

---

## 📄 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro (admin) |
| GET | `/api/dogs` | Listar perros |
| POST | `/api/dogs` | Crear perro |
| GET | `/api/dogs/:id` | Obtener perro |
| PUT | `/api/dogs/:id` | Actualizar perro |
| DELETE | `/api/dogs/:id` | Borrar (soft) |
| POST | `/api/dogs/:id/photo` | Subir foto |
| GET/POST/PUT/DELETE | `/api/dogs/:id/vaccines` | Vacunas |
| GET/POST/PUT/DELETE | `/api/dogs/:id/vet-controls` | Controles veterinarios |
| GET/POST/PUT/DELETE | `/api/dogs/:id/feeding` | Alimentación |
| GET/POST/PUT/DELETE | `/api/dogs/:id/training` | Entrenamiento |
| GET/POST/PUT/DELETE | `/api/dogs/:id/assignments` | Asignaciones |
| GET/POST/PUT/DELETE | `/api/dogs/:id/incidents` | Incidentes |
| GET | `/api/dogs/export/csv` | Exportar CSV |
| GET/POST/PUT/DELETE | `/api/users` | Usuarios (admin) |

---

## 📄 Licencia

Proyecto privado.
