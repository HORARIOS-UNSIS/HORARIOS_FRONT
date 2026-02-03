<template>
  <div class="container">
    <!-- DEBUG TEMPORAL: Eliminar tras verificar -->
    <details style="margin-bottom: 20px; background: #eee; padding: 10px;">
      <summary>Ver estructura de datos (DEBUG)</summary>
      <div style="font-weight: bold; margin-bottom: 5px;">Carrera consultada: {{ dbgCarrera }}</div>
      <pre>{{ examenes.length > 0 ? JSON.stringify(examenes[0], null, 2) : 'Sin datos' }}</pre>
    </details>

    <div v-if="examenes.length > 0">
      <!-- Encabezado del calendario -->
      <div class="header-calendario">
        <h2>CALENDARIO DE EVALUACIONES PARCIALES</h2>
        <h3>EVALUACIÓN ORDINARIA DEL {{ fechaInicio }} AL {{ fechaFin }}</h3>
        <h3>{{ licenciatura }}</h3>
        <h4>SEMESTRE {{ semestre }}</h4>
      </div>

      <button class="btn-pdf" @click="generarPDF">
        Generar PDF
      </button>

      <!-- Tabla por cada grupo -->
      <div v-for="(examenesGrupo, grupo) in examenesPorGrupo" :key="grupo" class="tabla-grupo">
        <table>
          <thead>
            <tr>
              <th>GRUPO</th>
              <th>MATERIA</th>
              <th>ACADÉMICO TITULAR</th>
              <th>FECHA</th>
              <th>HORA</th>
              <th>AULA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in examenesGrupo" :key="e.idExamen || e.id">
              <td>{{ e.grupo }}</td>
              <td>{{ getMateria(e) }}</td>
              <td>{{ getProfesor(e) }}</td>
              <td>{{ e.fecha }}</td>
              <td>{{ getHora(e) }}</td>
              <td>{{ getAula(e) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-else class="empty">No hay exámenes generados</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import pdfService from '../../services/pdfService';
import { 
  obtenerHorariosFiltrados, 
  obtenerMaterias, 
  obtenerProfesores, 
  obtenerAulas, 
  obtenerHorariosEscolares 
} from '../../services/backendService';
import { getUser } from '../../services/authService';

const examenes = ref([]);
const dbgCarrera = ref('');
const materiasMap = ref({});
const profesoresMap = ref({});
const aulasMap = ref({});
const horariosMap = ref({});

const fechaInicio = ref('03 DE FEBRERO');
const fechaFin = ref('09 DE FEBRERO DE 2026');
const licenciatura = ref('LICENCIATURA EN CIENCIAS EMPRESARIALES');
const semestre = ref('2025-2026 A');

// Agrupar exámenes por grupo
const examenesPorGrupo = computed(() => {
  const grupos = {};
  examenes.value.forEach(examen => {
    const grupo = examen.grupo || 'SIN GRUPO';
    if (!grupos[grupo]) {
      grupos[grupo] = [];
    }
    grupos[grupo].push(examen);
  });
  return grupos;
});

onMounted(async () => {
  // Cargar catálogos auxiliares primero
  try {
    const [materias, profesores, aulas, horarios] = await Promise.all([
      obtenerMaterias(),
      obtenerProfesores(),
      obtenerAulas(),
      obtenerHorariosEscolares()
    ]);

    materias.forEach(m => materiasMap.value[m.id] = m.nombre);
    profesores.forEach(p => profesoresMap.value[p.id] = p.nombre);
    aulas.forEach(a => aulasMap.value[a.id] = a.nombre);
    horarios.forEach(h => horariosMap.value[h.id] = `${h.inicio} - ${h.fin}`);
  } catch (err) {
    console.error("Error cargando catálogos", err);
  }

  // Primero intentar cargar desde localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const dataLocal = localStorage.getItem('examenes_generados');
      
      if (dataLocal) {
        const data = JSON.parse(dataLocal);
        examenes.value = data;
        return;
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
    }
  }

  // Si no hay datos en localStorage, cargar desde el endpoint
  try {
    const user = getUser();
    let clave = user?.claveCarrera;
    
    // Normalizar clave carrera
    if (clave) {
       clave = String(clave);
       if (clave.length === 1) clave = '0' + clave;
    }
    
    // Si no es jefe (o no tiene clave), usar '06'
    // OJO: Si el usuario es ADMIN o SERV, tal vez no tenga carrera. 
    // Usar '06' por defecto para pruebas, o vacío.
    const claveCarrera = clave || '06'; 
    dbgCarrera.value = claveCarrera; // Para debug

    const data = await obtenerHorariosFiltrados(claveCarrera, '2526A');
    if (data && data.length > 0) {
      examenes.value = data;
      console.log('Exámenes cargados desde API:', data);
    }
  } catch (error) {
    console.error('Error al cargar exámenes desde API:', error);
    examenes.value = [];
  }
});

function getMateria(e) {
  if (e.nombreMateria || e.materia || e.nombre_materia || e.subject) {
      return e.nombreMateria || e.materia || e.nombre_materia || e.subject;
  }
  // Lookup by ID
  if (e.idMateria && materiasMap.value[e.idMateria]) {
      return materiasMap.value[e.idMateria];
  }
  return 'SIN MATERIA';
}

function getProfesor(e) {
  if (e.nombreProfesor || e.academico_titular || e.profesor || e.nombre_profesor) {
      return e.nombreProfesor || e.academico_titular || e.profesor || e.nombre_profesor;
  }
  // Lookup by ID (check profesorId or idProfesor)
  const id = e.profesorId || e.idProfesor;
  if (id && profesoresMap.value[id]) {
      return profesoresMap.value[id];
  }
  return 'SIN PROFESOR';
}

function getHora(e) {
  if (e.horaInicio && e.horaFin) return `${e.horaInicio} - ${e.horaFin}`;
  if (e.hora_inicio && e.hora_fin) return `${e.hora_inicio} - ${e.hora_fin}`;
  if (e.hora) return e.hora;
  
  // Lookup by ID
  if (e.idHorario && horariosMap.value[e.idHorario]) {
      return horariosMap.value[e.idHorario];
  }
  return '--:--';
}

function getAula(e) {
  if (e.nombreAula || e.aula || e.nombre_aula || e.classroom) {
      return e.nombreAula || e.aula || e.nombre_aula || e.classroom;
  }
  // Lookup by ID
  if (e.idAula && aulasMap.value[e.idAula]) {
      return aulasMap.value[e.idAula];
  }
  return 'SIN AULA';
}

function generarHora(index) {
  const horas = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '16:00-18:00'];
  return horas[index % horas.length];
}

function generarPDF() {
  try {
    // Normalizar datos para PDF si es necesario
    const datosNormalizados = examenes.value.map(e => ({
      ...e,
      materia: getMateria(e),
      academico_titular: getProfesor(e),
      hora: getHora(e),
      aula: getAula(e), 
      // aseguramos fecha y grupo que ya funcionaban
      fecha: e.fecha,
      grupo: e.grupo
    }));

    const resultado = pdfService.generarPDFHorarioExamenes(datosNormalizados, {
      titulo: 'Calendario de Evaluaciones Parciales',
      institucion: 'UNSIS - Sistema de Horarios',
      nombreArchivo: `Calendario_Examenes_${Date.now()}.pdf`,
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      licenciatura: licenciatura.value,
      semestre: semestre.value
    });
    
    if (resultado.success) {
      alert(`${resultado.message}\nArchivo: ${resultado.nombreArchivo}`);
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor, intente nuevamente.');
  }
}

</script>
 
<style scoped>
.container {
  padding: 20px;
}

.header-calendario {
  text-align: center;
  margin-bottom: 20px;
}

.header-calendario h2 {
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.header-calendario h3 {
  font-size: 14px;
  font-weight: bold;
  margin: 5px 0;
}

.header-calendario h4 {
  font-size: 13px;
  font-weight: bold;
  margin: 5px 0;
}

.btn-pdf {
  margin: 20px 0;
  padding: 10px 18px;
  background: #6a5acd;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-pdf:hover {
  background: #5a4acb;
}

.tabla-grupo {
  margin-bottom: 40px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #333;
  padding: 8px;
  text-align: center;
  font-size: 12px;
}

th {
  background: #f4f4f4;
  font-weight: bold;
}

td {
  text-align: left;
}

td:first-child,
td:nth-child(4),
td:nth-child(5),
td:nth-child(6) {
  text-align: center;
}

.empty {
  margin-top: 20px;
  font-style: italic;
}
</style>
