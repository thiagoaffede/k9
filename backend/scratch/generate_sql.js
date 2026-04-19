const fs = require('fs');
const path = require('path');

function main() {
  const dumpPath = path.join(__dirname, 'migration_dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.error('❌ No se encontró migration_dump.json');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
  let sql = '-- MIGRACIÓN DE DATOS K9 -> SUPABASE\n\n';

  // Helper para escapar strings
  const esc = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
    if (val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val)))) {
        return `'${new Date(val).toISOString()}'`;
    }
    return val;
  };

  // 1. Usuarios
  sql += '-- Usuarios\n';
  data.users.forEach(u => {
    sql += `INSERT INTO "User" (id, nombre, email, password, rol) VALUES (${u.id}, ${esc(u.nombre)}, ${esc(u.email)}, ${esc(u.password)}, ${esc(u.rol)}) ON CONFLICT (email) DO NOTHING;\n`;
  });

  // 2. Perros
  sql += '\n-- Perros\n';
  data.dogs.forEach(d => {
    sql += `INSERT INTO "Dog" (id, nombre, raza, sexo, fecha_nacimiento, color, senas_particulares, nro_chip, estado, fecha_ingreso, origen, observaciones, foto_url, "deletedAt", "createdAt", "updatedAt") VALUES (${d.id}, ${esc(d.nombre)}, ${esc(d.raza)}, ${esc(d.sexo)}, ${esc(d.fecha_nacimiento)}, ${esc(d.color)}, ${esc(d.senas_particulares)}, ${esc(d.nro_chip)}, ${esc(d.estado)}, ${esc(d.fecha_ingreso)}, ${esc(d.origen)}, ${esc(d.observaciones)}, ${esc(d.foto_url)}, ${esc(d.deletedAt)}, ${esc(d.createdAt)}, ${esc(d.updatedAt)}) ON CONFLICT (id) DO NOTHING;\n`;
  });

  // 3. Entidades relacionadas
  const generateInsert = (table, items, columns) => {
    sql += `\n-- ${table}\n`;
    items.forEach(item => {
      const vals = columns.map(col => esc(item[col])).join(', ');
      const cols = columns.map(c => `"${c}"`).join(', ');
      sql += `INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT (id) DO NOTHING;\n`;
    });
  };

  generateInsert('Vaccine', data.vaccines, ['id', 'id_perro', 'vacuna', 'fecha_aplicacion', 'proxima_dosis', 'veterinario', 'observaciones', 'createdAt']);
  generateInsert('VetControl', data.vetControls, ['id', 'id_perro', 'fecha', 'motivo', 'diagnostico', 'tratamiento', 'medicacion', 'dosis', 'veterinario', 'observaciones']);
  generateInsert('Training', data.trainings, ['id', 'id_perro', 'tipo', 'nivel', 'fecha', 'instructor', 'evaluacion', 'observaciones']);
  generateInsert('Assignment', data.assignments, ['id', 'id_perro', 'guia', 'fecha_inicio', 'fecha_fin', 'turno', 'observaciones']);
  generateInsert('History', data.history, ['id', 'id_perro', 'fecha', 'tipo_evento', 'descripcion', 'responsable']);
  generateInsert('Incident', data.incidents, ['id', 'id_perro', 'fecha', 'tipo', 'descripcion', 'gravedad', 'acciones_tomadas']);
  generateInsert('Feeding', data.feedings, ['id', 'id_perro', 'tipo_alimento', 'marca', 'cantidad_diaria', 'horario', 'suplementos', 'fecha_inicio']);

  // 4. Resetear secuencias
  sql += '\n-- Reajuste de secuencias\n';
  const tables = ['User', 'Dog', 'Vaccine', 'VetControl', 'Training', 'Assignment', 'History', 'Incident', 'Feeding'];
  tables.forEach(t => {
     sql += `SELECT setval(pg_get_serial_sequence('"${t}"', 'id'), COALESCE(MAX(id), 1)) FROM "${t}";\n`;
  });

  const sqlPath = path.join(__dirname, 'migration_data.sql');
  fs.writeFileSync(sqlPath, sql);
  console.log(`✅ SQL generado exitosamente en: ${sqlPath}`);
}

main();
