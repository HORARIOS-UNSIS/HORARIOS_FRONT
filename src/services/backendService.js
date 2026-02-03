import apiClient from './apiClient';

/**
 * Servicio de Catálogos y Datos del Backend
 * Consume endpoints desde el backend (teachers, subjects, classrooms, etc)
 */

// ===== PROFESORES =====
export async function obtenerProfesores() {
  try {
    const response = await apiClient.get('/teachers', { skipAuthRedirect: true });
    return response.data.map(prof => ({
      id: prof.idProfesor,
      nombre: prof.nombre,
      sabatico: prof.sabatico
    }));
  } catch (error) {
    console.error('Error obteniendo profesores:', error);
    return [];
  }
}

export async function obtenerProfesor(id) {
  try {
    const response = await apiClient.get(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo profesor:', error);
    return null;
  }
}

// ===== MATERIAS =====
export async function obtenerMaterias() {
  try {
    const response = await apiClient.get('/subjects');
    return response.data.map(materia => ({
      id: materia.idMateria,
      nombre: materia.nombre,
      esAcademia: materia.esAcademia
    }));
  } catch (error) {
    console.error('Error obteniendo materias:', error);
    return [];
  }
}

export async function obtenerMateriasPorCarreraYPeriodo(claveCarrera, clavePeriodo) {
  try {
    const response = await apiClient.get('/subjects', {
      params: {
        claveCarrera,
        clavePeriodo
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo materias por carrera:', error);
    return [];
  }
}

export async function obtenerMateria(id) {
  try {
    const response = await apiClient.get(`/subjects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo materia:', error);
    return null;
  }
}

// ===== AULAS =====
export async function obtenerAulas() {
  try {
    const response = await apiClient.get('/classrooms');
    return response.data.map(aula => ({
      id: aula.idAula,
      nombre: aula.nombre,
      capacidad: aula.capacidad
    }));
  } catch (error) {
    console.error('Error obteniendo aulas:', error);
    return [];
  }
}

export async function obtenerAula(id) {
  try {
    const response = await apiClient.get(`/classrooms/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo aula:', error);
    return null;
  }
}

// ===== HORARIOS ESCOLARES =====
export async function obtenerHorariosEscolares() {
  try {
    const response = await apiClient.get('/school-hours');
    return response.data.map(horario => ({
      id: horario.id,
      periodo: horario.periodNumber,
      inicio: horario.startTime,
      fin: horario.endTime,
      esReceso: horario.isBreak,
      descripcion: horario.description
    }));
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    return [];
  }
}

// ===== SINODALES =====
export async function obtenerSinodales() {
  try {
    const response = await apiClient.get('/synodals');
    return response.data.map(sinodal => ({
      id: sinodal.idSinodal,
      idProfesorSinodal: sinodal.idProfesorSinodal,
      idProfesorTitular: sinodal.idProfesorTitular,
      idMateria: sinodal.idMateria
    }));
  } catch (error) {
    console.error('Error obteniendo sinodales:', error);
    return [];
  }
}

export async function obtenerAsignacionesSinodales(claveCarrera, clavePeriodo) {
  try {
    const response = await apiClient.get('/synodals/assignments', {
      params: {
        carrera: claveCarrera,
        periodo: clavePeriodo
      },
      skipAuthRedirect: true
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
       console.warn('Endpoint /synodals/assignments no disponible o no autorizado.');
    }
    console.error('Error obteniendo asignaciones de sinodales:', error);
    return [];
  }
}

export async function asignarSinodal(datos) {
  try {
    const response = await apiClient.post('/synodals', datos);
    return response.data;
  } catch (error) {
    console.error('Error asignando sinodal:', error);
    throw error;
  }
}

export async function eliminarSinodal(id) {
  try {
    await apiClient.delete(`/synodals/${id}`);
    return true;
  } catch (error) {
    console.error('Error eliminando sinodal:', error);
    throw error;
  }
}

export async function obtenerSinodalesPorMateria(idMateria) {
  try {
    const response = await apiClient.get(`/synodals/materia/${idMateria}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo sinodales por materia:', error);
    return null;
  }
}

export async function obtenerSinodalesPorProfesor(idProfesor) {
  try {
    const response = await apiClient.get(`/synodals/profesor/${idProfesor}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo sinodales por profesor:', error);
    return [];
  }
}

// ===== HORARIOS/EXÁMENES =====
export async function obtenerHorarios() {
  try {
    const response = await apiClient.get('/schedules');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    return [];
  }
}

export async function obtenerHorariosFiltrados(claveCarrera, clavePeriodo) {
  try {
    const response = await apiClient.get('/schedules/filtrar', {
      params: {
        claveCarrera,
        clavePeriodo
      },
      skipAuthRedirect: true
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo horarios filtrados:', error);
    return [];
  }
}

export async function obtenerHorario(id) {
  try {
    const response = await apiClient.get(`/schedules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo horario:', error);
    return null;
  }
}

export async function crearHorario(datos) {
  try {
    const response = await apiClient.post('/schedules', datos);
    return response.data;
  } catch (error) {
    console.error('Error creando horario:', error);
    throw error;
  }
}

export async function actualizarHorario(id, datos) {
  try {
    const response = await apiClient.put(`/schedules/${id}`, datos);
    return response.data;
  } catch (error) {
    console.error('Error actualizando horario:', error);
    throw error;
  }
}

export async function eliminarHorario(id) {
  try {
    await apiClient.delete(`/schedules/${id}`);
    return true;
  } catch (error) {
    console.error('Error eliminando horario:', error);
    throw error;
  }
}

export async function obtenerHorariosPorProfesor(profesorId) {
  try {
    const response = await apiClient.get(`/schedules/profesor/${profesorId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo horarios por profesor:', error);
    return [];
  }
}

export async function obtenerHorariosPorMateria(idMateria) {
  try {
    const response = await apiClient.get(`/schedules/materia/${idMateria}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo horarios por materia:', error);
    return [];
  }
}

// ===== USUARIOS =====
export async function obtenerUsuarios() {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
}

// ===== GRUPOS =====
export async function obtenerGruposPorCarreraYPeriodo(claveCarrera, clavePeriodo) {
  try {
    const response = await apiClient.get('/groups', {
      params: {
        claveCarrera,
        clavePeriodo
      },
      skipAuthRedirect: true
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo grupos:', error);
    return [];
  }
}

export async function crearUsuario(usuario) {
  try {
    const response = await apiClient.post('/users', usuario);
    return response.data;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
}

export async function generarHorariosAuto(datos) {
  try {
    const response = await apiClient.post('/schedules/generate', datos);
    return response.data;
  } catch (error) {
    console.error('Error generando horarios:', error);
    throw error;
  }
}

// ===== UTILIDADES =====
export async function obtenerNombreProfesor(id) {
  const profesor = await obtenerProfesor(id);
  return profesor?.nombre || 'Desconocido';
}

export async function obtenerNombreMateria(id) {
  const materia = await obtenerMateria(id);
  return materia?.nombre || 'Desconocida';
}

export async function obtenerNombreAula(id) {
  const aula = await obtenerAula(id);
  return aula?.nombre || 'Sin aula';
}
