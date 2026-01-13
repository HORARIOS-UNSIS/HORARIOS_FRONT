import { obtenerMaterias, obtenerProfesores, obtenerAulas } from './examService';

export function generarExamenes({ tipo, rangoFechas }) {
  const materias = obtenerMaterias();
  const profesores = obtenerProfesores();
  const aulas = obtenerAulas();

  // validacion de sinodales
  const sinSinodal = materias.filter(m => !m.sinodal_id);
  if (sinSinodal.length > 0) {
    throw new Error('Existen materias sin profesor sinodal asignado');
  }

  const horarios = ['08:00', '10:00', '12:00'];
  const examenes = [];

  let diaIndex = 0;
  let horaIndex = 0;
  let aulaIndex = 0;

  materias.forEach(materia => {
    const fecha = rangoFechas[diaIndex % rangoFechas.length];
    const hora = horarios[horaIndex % horarios.length];
    const aula = aulas[aulaIndex % aulas.length];

    let aplicaProfesor;

    if (materia.academia) {
      // En academia el titular NO aplica
      aplicaProfesor = profesores.find(p => p.id !== materia.sinodal_id);
    } else {
      aplicaProfesor = profesores.find(p => p.id === materia.profesor_titular_id);
    }

    examenes.push({
      id: Date.now() + Math.random(),
      materia: materia.nombre,
      fecha,
      hora,
      aula,
      aplica: aplicaProfesor?.nombre || 'Por asignar',
      sinodal: profesores.find(p => p.id === materia.sinodal_id)?.nombre
    });

    horaIndex++;
    aulaIndex++;
    diaIndex++;
  });

  return examenes;
}
