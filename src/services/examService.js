/**
 * Servicio de Exámenes
 * Simula una base de datos y proporciona funciones para gestionar exámenes,
 * materias, profesores, aulas y otros catálogos relacionados.
 */

// ===== BASE DE DATOS SIMULADA =====

const database = {
  roles: [
    { id: 1, nombre: 'Servicios Escolares', description: 'Administrador de servicios escolares' },
    { id: 2, nombre: 'Jefe de Carrera', description: 'Jefe de programa académico' },
    { id: 3, nombre: 'Administrador', description: 'Administrador del sistema' },

  ],

  aulas: [
    { id: 1, nombre: 'A1', capacidad: 40 },
    { id: 2, nombre: 'A2', capacidad: 35 },
    { id: 3, nombre: 'Laboratorio 1', capacidad: 25 },
    { id: 4, nombre: 'Auditorio', capacidad: 100 }
  ],

  carreras: [
    { id: 1, nombre: 'Informática', codigo: 'INF' },
    { id: 2, nombre: 'Medicina', codigo: 'MED' },
    { id: 3, nombre: 'Administración', codigo: 'ADM' }
  ],

  materias: [
    { id: 1, clave: 'MAT101', nombre: 'Matemáticas I', semestre: 1, carrera_id: 1 },
    { id: 2, clave: 'FIS101', nombre: 'Física General', semestre: 1, carrera_id: 1 },
    { id: 3, clave: 'ANA101', nombre: 'Anatomía Humana', semestre: 1, carrera_id: 2 }
  ],

  grupos: [
    { id: 1, nombre: 'INF-101A', semestre: 1, carrera_id: 1, materia_id: 1, aula_id: 1 },
    { id: 2, nombre: 'INF-102B', semestre: 1, carrera_id: 1, materia_id: 2, aula_id: 2 },
    { id: 3, nombre: 'MED-101A', semestre: 1, carrera_id: 2, materia_id: 3, aula_id: 3 }
  ],

  tipos_examen: [
    { id: 1, nombre: 'Parcial' },
    { id: 2, nombre: 'Ordinario' },
    { id: 3, nombre: 'Extraordinario' },
    { id: 4, nombre: 'Recursamiento' }
  ],

  examenes: [
    {
      id: 1,
      grupo_id: 1,
      materia_id: 1,
      tipo_examen_id: 1,
      fecha: '2025-03-15',
      hora_inicio: '09:00',
      hora_fin: '10:30',
      numero_alumnos: 28,
      estado: 'programado',
      created_at: '2025-02-15',
      updated_at: '2025-02-15'
    }
  ],

  notificaciones: [
    {
      id: 1,
      profesor_id: 1,
      grupo_id: 1,
      fecha: '2025-03-15',
      hora_inicio: '09:00',
      hora_fin: '10:30',
      motivo: 'Examen Parcial'
    }
  ]
};

// ===== EXÁMENES =====

// src/services/examService.js

export function obtenerExamenes() {
  return [
    {
      id: 1,
      materia_id: 1,
      grupo_id: 1,
      tipo_examen_id: 1,
      fecha: '2026-01-15',
      hora_inicio: '09:00',
      duracion: 120,
      estado: 'pendiente'
    },
    {
      id: 2,
      materia_id: 2,
      grupo_id: 2,
      tipo_examen_id: 2,
      fecha: '2026-01-18',
      hora_inicio: '11:00',
      duracion: 90,
      estado: 'aprobado'
    },
    {
      id: 3,
      materia_id: 3,
      grupo_id: 3,
      tipo_examen_id: 1,
      fecha: '2026-01-20',
      hora_inicio: '08:00',
      duracion: 120,
      estado: 'reprobado'
    }
  ];
}

export function obtenerExamenesPorCarrera(carreraId) {
  return database.examenes.filter(exam => {
    const grupo = database.grupos.find(g => g.id === exam.grupo_id);
    return grupo && grupo.carrera_id === carreraId;
  });
}

export function crearExamen(examen) {
  const nuevoExamen = {
    ...examen,
    id: Math.max(0, ...database.examenes.map(e => e.id)) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  database.examenes.push(nuevoExamen);
  return nuevoExamen;
}

export function actualizarExamen(id, cambios) {
  const examen = database.examenes.find(e => e.id === id);
  if (!examen) return null;

  Object.assign(examen, cambios);
  examen.updated_at = new Date().toISOString();
  return examen;
}

export function eliminarExamen(id) {
  const index = database.examenes.findIndex(e => e.id === id);
  if (index === -1) return false;
  database.examenes.splice(index, 1);
  return true;
}

export function obtenerNombreCarrera(id) {
  return database.carreras.find(c => c.id === id)?.nombre || 'Desconocida';
}

// catalogos

export function obtenerCarreras() {
  return database.carreras;
}

export function obtenerMaterias() {
  return database.materias;
}

export function obtenerMateriasPorCarrera(carreraId) {
  return database.materias.filter(m => m.carrera_id === carreraId);
}

export function obtenerGrupos() {
  return database.grupos;
}

export function obtenerGruposPorCarrera(carreraId) {
  return database.grupos.filter(g => g.carrera_id === carreraId);
}

export function obtenerTiposExamen() {
  return database.tipos_examen;
}

export function obtenerAulas() {
  return database.aulas;
}

// utilidades

export function obtenerNombreMateria(id) {
  return database.materias.find(m => m.id === id)?.nombre || 'Desconocida';
}

export function obtenerNombreGrupo(id) {
  return database.grupos.find(g => g.id === id)?.nombre || 'Desconocido';
}

export function obtenerNombreTipoExamen(id) {
  return database.tipos_examen.find(t => t.id === id)?.nombre || 'Desconocido';
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX');
}



// Profesores
export function obtenerProfesores() {
  return [
    { id: 3, nombre: 'Juan García' },
    { id: 4, nombre: 'Ana López' },
    { id: 5, nombre: 'Carlos Ruiz' },
    { id: 6, nombre: 'María Torres' },
    { id: 7, nombre: 'Luis Méndez' },
    { id: 8, nombre: 'Rosa Castillo' }
  ];
}


