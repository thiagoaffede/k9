-- MIGRACIÓN DE DATOS K9 -> SUPABASE

-- Usuarios
INSERT INTO "User" (id, nombre, email, password, rol) VALUES (1, 'Administrador K9', 'admin@k9.com', '$2b$10$XejGc/UQ1/9y7SyNZm0Yqu1k/LLbjbIepY/aerNihNtXVuB3WkMf.', 'admin') ON CONFLICT (email) DO NOTHING;
INSERT INTO "User" (id, nombre, email, password, rol) VALUES (2, 'Thiago Affede', 'taffede@gmail.com', '$2b$10$2Betrxi6ssBkpgYSMVrDtupkpyaoGwaFBUurm1KGbRrKGvWSO/M8e', 'admin') ON CONFLICT (email) DO NOTHING;
INSERT INTO "User" (id, nombre, email, password, rol) VALUES (3, 'Laura Urrutia', 'lau@lau.com', '$2b$10$.TKmTuWanQNeMB3mBj8TTupQjRHAamYhVRn0b3mSjjHlzurBwNcN.', 'admin') ON CONFLICT (email) DO NOTHING;

-- Perros
INSERT INTO "Dog" (id, nombre, raza, sexo, fecha_nacimiento, color, senas_particulares, nro_chip, estado, fecha_ingreso, origen, observaciones, foto_url, "deletedAt", "createdAt", "updatedAt") VALUES (1, 'Peater', 'Caniche', 'macho', NULL, '', NULL, '122', 'entrenamiento', '2026-04-18T20:28:10.537Z', '', '', NULL, '2026-04-19T00:14:43.918Z', '2026-04-18T20:28:10.537Z', '2026-04-19T00:14:43.919Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Dog" (id, nombre, raza, sexo, fecha_nacimiento, color, senas_particulares, nro_chip, estado, fecha_ingreso, origen, observaciones, foto_url, "deletedAt", "createdAt", "updatedAt") VALUES (6, 'Silvio', 'Pastor Aleman', 'macho', NULL, '', NULL, '112', 'entrenamiento', '2026-04-19T00:18:17.240Z', '', '', '/uploads/1776557897263-88740137.jpg', '2026-04-19T02:57:28.812Z', '2026-04-19T00:18:17.240Z', '2026-04-19T02:57:28.813Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Dog" (id, nombre, raza, sexo, fecha_nacimiento, color, senas_particulares, nro_chip, estado, fecha_ingreso, origen, observaciones, foto_url, "deletedAt", "createdAt", "updatedAt") VALUES (7, 'tarugo', 'caniche', 'macho', NULL, '', NULL, '66', 'activo', '2026-04-19T00:36:19.721Z', '', '', NULL, '2026-04-19T02:57:25.418Z', '2026-04-19T00:36:19.721Z', '2026-04-19T02:57:25.419Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Dog" (id, nombre, raza, sexo, fecha_nacimiento, color, senas_particulares, nro_chip, estado, fecha_ingreso, origen, observaciones, foto_url, "deletedAt", "createdAt", "updatedAt") VALUES (8, 'Valo', 'Pastor belga malinois ', 'macho', '2023-02-08T00:00:00.000Z', 'Marron', NULL, '249', 'activo', '2026-04-19T10:42:08.180Z', 'Dirección de cinotecnia', 'Especialidad búsqueda de estupefacientes, en la actualidad realiza tareas asegurativas ', '/uploads/1776595415851-178529027.jpg', NULL, '2026-04-19T10:42:08.180Z', '2026-04-19T13:22:42.030Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Dog" (id, nombre, raza, sexo, fecha_nacimiento, color, senas_particulares, nro_chip, estado, fecha_ingreso, origen, observaciones, foto_url, "deletedAt", "createdAt", "updatedAt") VALUES (13, 'Tarugo', 'Caniche', 'macho', NULL, '', NULL, '11', 'entrenamiento', '2026-04-19T10:45:34.834Z', '', 'ss', NULL, '2026-04-19T10:45:39.726Z', '2026-04-19T10:45:34.834Z', '2026-04-19T10:45:39.727Z') ON CONFLICT (id) DO NOTHING;

-- Vaccine
INSERT INTO "Vaccine" ("id", "id_perro", "vacuna", "fecha_aplicacion", "proxima_dosis", "veterinario", "observaciones", "createdAt") VALUES (1, 6, 'antigripal', '2026-04-07T00:00:00.000Z', '2026-04-26T00:00:00.000Z', NULL, NULL, '2026-04-19T00:33:03.953Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Vaccine" ("id", "id_perro", "vacuna", "fecha_aplicacion", "proxima_dosis", "veterinario", "observaciones", "createdAt") VALUES (2, 8, 'Puppy', '2023-04-06T00:00:00.000Z', NULL, NULL, NULL, '2026-04-19T13:17:53.225Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Vaccine" ("id", "id_perro", "vacuna", "fecha_aplicacion", "proxima_dosis", "veterinario", "observaciones", "createdAt") VALUES (3, 8, 'Puppy', '2023-05-02T00:00:00.000Z', NULL, NULL, NULL, '2026-04-19T13:18:40.801Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Vaccine" ("id", "id_perro", "vacuna", "fecha_aplicacion", "proxima_dosis", "veterinario", "observaciones", "createdAt") VALUES (4, 8, 'Quíntuple ', '2023-05-22T00:00:00.000Z', NULL, NULL, NULL, '2026-04-19T13:19:26.780Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Vaccine" ("id", "id_perro", "vacuna", "fecha_aplicacion", "proxima_dosis", "veterinario", "observaciones", "createdAt") VALUES (5, 8, 'Antirrabica', '2023-08-11T00:00:00.000Z', NULL, NULL, NULL, '2026-04-19T13:20:03.300Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Vaccine" ("id", "id_perro", "vacuna", "fecha_aplicacion", "proxima_dosis", "veterinario", "observaciones", "createdAt") VALUES (6, 8, 'Refuerzo antirrabica ', '2023-12-12T00:00:00.000Z', NULL, NULL, NULL, '2026-04-19T13:20:50.176Z') ON CONFLICT (id) DO NOTHING;

-- VetControl
INSERT INTO "VetControl" ("id", "id_perro", "fecha", "motivo", "diagnostico", "tratamiento", "medicacion", "dosis", "veterinario", "observaciones") VALUES (1, 1, '2026-04-18T22:00:44.319Z', 'asdasd', NULL, 'asdasd', NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO "VetControl" ("id", "id_perro", "fecha", "motivo", "diagnostico", "tratamiento", "medicacion", "dosis", "veterinario", "observaciones") VALUES (2, 6, '2026-04-19T00:23:12.920Z', 'asdasd', NULL, 'asdas', NULL, NULL, NULL, NULL) ON CONFLICT (id) DO NOTHING;

-- Training
INSERT INTO "Training" ("id", "id_perro", "tipo", "nivel", "fecha", "instructor", "evaluacion", "observaciones") VALUES (1, 6, 'Deteccion', '1', '2026-04-19T00:22:32.903Z', NULL, 'bien maso', NULL) ON CONFLICT (id) DO NOTHING;

-- Assignment

-- History
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (1, 1, '2026-04-18T20:28:10.546Z', 'CREACION', 'Perro registrado en el sistema', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (2, 1, '2026-04-18T22:00:44.329Z', 'CONTROL_VET', 'Motivo: asdasd', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (3, 1, '2026-04-19T00:14:43.949Z', 'ELIMINACION', 'Perro eliminado del sistema (Soft Delete)', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (4, 6, '2026-04-19T00:18:17.249Z', 'CREACION', 'Perro registrado en el sistema', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (5, 6, '2026-04-19T00:18:17.273Z', 'FOTO', 'Foto de perfil actualizada', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (6, 6, '2026-04-19T00:22:32.915Z', 'ENTRENAMIENTO', 'Tipo: Deteccion', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (7, 6, '2026-04-19T00:23:13.032Z', 'CONTROL_VET', 'Motivo: asdasd', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (8, 6, '2026-04-19T00:33:03.962Z', 'VACUNA', 'Aplicada: antigripal', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (9, 7, '2026-04-19T00:36:19.729Z', 'CREACION', 'Perro registrado en el sistema', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (10, 7, '2026-04-19T02:57:25.425Z', 'ELIMINACION', 'Perro eliminado del sistema (Soft Delete)', 'Thiago Affede') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (11, 6, '2026-04-19T02:57:28.815Z', 'ELIMINACION', 'Perro eliminado del sistema (Soft Delete)', 'Thiago Affede') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (12, 8, '2026-04-19T10:42:08.297Z', 'CREACION', 'Perro registrado en el sistema', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (13, 8, '2026-04-19T10:43:37.813Z', 'FOTO', 'Foto de perfil actualizada', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (14, 13, '2026-04-19T10:45:34.837Z', 'CREACION', 'Perro registrado en el sistema', 'Thiago Affede') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (15, 13, '2026-04-19T10:45:39.731Z', 'ELIMINACION', 'Perro eliminado del sistema (Soft Delete)', 'Thiago Affede') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (16, 8, '2026-04-19T10:53:40.829Z', 'MODIFICACION', 'Datos generales del perro actualizados', 'Administrador K9') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (17, 8, '2026-04-19T11:02:38.961Z', 'MODIFICACION', 'Datos generales del perro actualizados', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (18, 8, '2026-04-19T13:17:53.232Z', 'VACUNA', 'Aplicada: Puppy', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (19, 8, '2026-04-19T13:18:40.804Z', 'VACUNA', 'Aplicada: Puppy', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (20, 8, '2026-04-19T13:19:26.783Z', 'VACUNA', 'Aplicada: Quíntuple ', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (21, 8, '2026-04-19T13:20:03.303Z', 'VACUNA', 'Aplicada: Antirrabica', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (22, 8, '2026-04-19T13:20:50.179Z', 'VACUNA', 'Aplicada: Refuerzo antirrabica ', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;
INSERT INTO "History" ("id", "id_perro", "fecha", "tipo_evento", "descripcion", "responsable") VALUES (23, 8, '2026-04-19T13:22:42.134Z', 'MODIFICACION', 'Datos generales del perro actualizados', 'Laura Urrutia') ON CONFLICT (id) DO NOTHING;

-- Incident

-- Feeding

-- Reajuste de secuencias
SELECT setval(pg_get_serial_sequence('"User"', 'id'), COALESCE(MAX(id), 1)) FROM "User";
SELECT setval(pg_get_serial_sequence('"Dog"', 'id'), COALESCE(MAX(id), 1)) FROM "Dog";
SELECT setval(pg_get_serial_sequence('"Vaccine"', 'id'), COALESCE(MAX(id), 1)) FROM "Vaccine";
SELECT setval(pg_get_serial_sequence('"VetControl"', 'id'), COALESCE(MAX(id), 1)) FROM "VetControl";
SELECT setval(pg_get_serial_sequence('"Training"', 'id'), COALESCE(MAX(id), 1)) FROM "Training";
SELECT setval(pg_get_serial_sequence('"Assignment"', 'id'), COALESCE(MAX(id), 1)) FROM "Assignment";
SELECT setval(pg_get_serial_sequence('"History"', 'id'), COALESCE(MAX(id), 1)) FROM "History";
SELECT setval(pg_get_serial_sequence('"Incident"', 'id'), COALESCE(MAX(id), 1)) FROM "Incident";
SELECT setval(pg_get_serial_sequence('"Feeding"', 'id'), COALESCE(MAX(id), 1)) FROM "Feeding";
