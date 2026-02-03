<template>
  <div class="progress-container">

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <h2>Progreso de Exámenes</h2>
          <p class="header-subtitle">{{ tipoRol }}</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Carrera:</label>
          <select v-model="carreraSeleccionada" @change="cargarGrupos" class="filter-select">
            <option value="">Seleccionar carrera...</option>
            <option v-for="carrera in carrerasDisponibles" :key="carrera.id" :value="carrera.id">
              {{ carrera.nombre }}
            </option>
          </select>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="content-section">
        <!-- Si no hay carrera seleccionada -->
        <div v-if="!carreraSeleccionada" class="empty-state">
          <i class="pi pi-info-circle"></i>
          <p>Selecciona una carrera para ver el progreso de los grupos</p>
        </div>

        <!-- Lista de Grupos -->
        <div v-else-if="gruposFiltrados.length > 0" class="grupos-grid">
          <div v-for="grupo in gruposFiltrados" :key="grupo.id" class="grupo-card">
            <div class="grupo-header">
              <h3>{{ grupo.nombre }}</h3>
              <span class="semester-badge">{{ grupo.semestre }}º Semestre</span>
            </div>
            
            <div class="grupo-info">
              <p><strong>Materia:</strong> {{ obtenerNombreMateria(grupo.materia_id) }}</p>
              <p><strong>Capacidad:</strong> {{ grupo.capacidad_alumnos }} estudiantes</p>
              <p><strong>Aula:</strong> {{ grupo.aula_id }}</p>
            </div>

            <div class="grupo-exams">
              <h4>Exámenes del Grupo</h4>
              <div v-if="obtenerExamenesGrupo(grupo.id).length > 0" class="exams-list">
                <div 
                  v-for="examen in obtenerExamenesGrupo(grupo.id)" 
                  :key="examen.idExamen" 
                  class="exam-item"
                >
                  <div class="exam-info">
                    <span class="exam-materia-title">{{ examen.nombreMateria }}</span>
                    <span class="exam-tipo">{{ examen.claveMateria }}</span>
                    <span class="exam-fecha">{{ formatearFecha(examen.fecha) }}</span>
                    <span class="exam-profesor">{{ examen.nombreProfesor }}</span>
                  </div>
                  
                  <div class="exam-actions">
                    <button 
                      class="status-btn aprobado"
                      :class="{ active: examen.status === 'aprobado' }"
                      @click="cambiarEstado(examen.idExamen, 'aprobado')"
                      title="Aprobar"
                    >
                      <i class="pi pi-check"></i>
                    </button>
                    <button 
                      class="status-btn pendiente"
                      :class="{ active: examen.status === 'pendiente' }"
                      @click="cambiarEstado(examen.idExamen, 'pendiente')"
                      title="Pendiente"
                    >
                      <i class="pi pi-clock"></i>
                    </button>
                    <button 
                      class="status-btn rechazado"
                      :class="{ active: examen.status === 'rechazado' }"
                      @click="cambiarEstado(examen.idExamen, 'rechazado')"
                      title="Rechazar"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="no-exams">
                <p>No hay exámenes programados</p>
              </div>
            </div>

            <!-- Resumen de Estado -->
            <div class="grupo-summary">
              <div class="summary-item aprobado">
                <i class="pi pi-check-circle"></i>
                <span>{{ contarEstado(grupo.id, 'aprobado') }} Aprobados</span>
              </div>
              <div class="summary-item pendiente">
                <i class="pi pi-clock"></i>
                <span>{{ contarEstado(grupo.id, 'pendiente') }} Pendientes</span>
              </div>
              <div class="summary-item rechazado">
                <i class="pi pi-times-circle"></i>
                <span>{{ contarEstado(grupo.id, 'rechazado') }} Rechazados</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin grupos -->
        <div v-else class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>No hay grupos para esta carrera</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as examService from '../../services/examService';
import { obtenerHorarios, obtenerGruposPorCarreraYPeriodo, obtenerHorariosFiltrados } from '../../services/backendService';

const router = useRouter();

/* =========================
   ESTADO DEL USUARIO
========================= */
const usuarioEmail = ref('');
const usuarioRol = ref('servicios_escolares'); // JS puro
const usuarioCarrera = ref(null);

/* =========================
   DATOS GENERALES
========================= */
const examenesData = ref([]);
const gruposData = ref([]);
const materiasData = ref([]);
const carrerasData = ref([]);
const carreraSeleccionada = ref('');

const mapCarreras = {
  "01": "LICENCIATURA EN ADMINISTRACIÓN MUNICIPAL",
  "03": "LICENCIATURA EN ENFERMERÍA",
  "04": "LICENCIATURA EN CIENCIAS EMPRESARIALES",
  "05": "LICENCIATURA EN ADMINISTRACIÓN PÚBLICA",
  "06": "LICENCIATURA EN INFORMÁTICA",
  "07": "LICENCIATURA EN NUTRICIÓN",
  "08": "MAESTRÍA EN PLANEACIÓN ESTRATÉGICA MUNICIPAL",
  "09": "MAESTRÍA EN SALUD PÚBLICA",
  "10": "MAESTRÍA EN GOBIERNO ELECTRÓNICO",
  "11": "DOCTORADO EN GOBIERNO ELECTRÓNICO",
  "12": "INGLÉS",
  "14": "LICENCIATURA EN ODONTOLOGÍA",
  "15": "LICENCIATURA EN MEDICINA",
  "15POS": "MAESTRÍA EN ADMINISTRACIÓN UNIVERSITARIA",
  "16A": "LICENCIATURA EN CIENCIAS BIOMÉDICAS"
}

/* =========================
   COMPUTED
========================= */
const tipoRol = computed(() => {
  return usuarioRol.value === 'servicios_escolares'
    ? 'Servicios Escolares'
    : 'Jefe de Carrera';
});

const carrerasDisponibles = computed(() => {
  if (usuarioRol.value === 'servicios_escolares') {
    return carrerasData.value;
  }
  return carrerasData.value.filter(
    c => c.id === usuarioCarrera.value
  );
});

const gruposFiltrados = computed(() => {
  // Ya estamos filtrando al hacer fetch, así que devolvemos todo lo que tenemos en gruposData
  if (gruposData.value.length === 0) return [];
  return gruposData.value;
});

/* =========================
   LIFECYCLE
========================= */
onMounted(() => {
  verificarAutenticacion();
  cargarDatos();
});

watch(carreraSeleccionada, (newVal) => {
  if(newVal) {
    cargarDatosCompleto(newVal);
  } else {
    gruposData.value = [];
    examenesData.value = [];
  }
});

/* =========================
   MÉTODOS
========================= */
const verificarAutenticacion = () => {
  const user = localStorage.getItem('user');

  if (!user) {
    router.push('/');
    return;
  }

  try {
    const userData = JSON.parse(user);
    usuarioEmail.value = userData.email || '';
    
    // Mapear roles
    const roleMap = {
      'JEFE': 'jefe_carrera',
      'SERV': 'servicios_escolares'
    };
    usuarioRol.value = roleMap[userData.rol] || 'servicios_escolares';
    
    usuarioCarrera.value = userData.claveCarrera ?? null;

    if (usuarioRol.value === 'jefe_carrera' && usuarioCarrera.value) {
      carreraSeleccionada.value = usuarioCarrera.value.toString();
      // El watcher se encargará de cargar los datos
    }
  } catch (error) {
    router.push('/');
  }
};

const cargarDatos = async () => {
  // Llenar carrerasData desde el mapa
  carrerasData.value = Object.entries(mapCarreras).map(([id, nombre]) => ({
    id,
    nombre
  }));
};

const cargarDatosCompleto = async (claveCarrera) => {
  // Resetear datos
  gruposData.value = [];
  examenesData.value = [];
  
  const periodoFijo = "2526A";

  // Intentar cargar grupos y exámenes en paralelo
  const [gruposCargados, examenesCargados] = await Promise.all([
    obtenerGruposPorCarreraYPeriodo(claveCarrera, periodoFijo).catch(err => {
      console.warn("Error cargando grupos (posible 401/403):", err);
      return [];
    }),
    obtenerHorariosFiltrados(claveCarrera, periodoFijo).catch(err => {
       console.error("Error cargando exámenes:", err);
       return [];
    })
  ]);

  // Setear exámenes
  examenesData.value = examenesCargados;

  // Si obtuvimos grupos del backend, usarlos
  if (gruposCargados && gruposCargados.length > 0) {
    gruposData.value = gruposCargados.map(g => ({
       id: g.nombre, 
       nombre: `Grupo ${g.nombre}`,
       semestre: g.semestre,
       carrera_id: claveCarrera, 
       materia_id: 0, 
       capacidad_alumnos: g.alumnos || 0,
       aula_id: 'N/A'
    }));
  } else if (examenesCargados.length > 0) {
    // FALLBACK: Si falló la carga de grupos (por permisos) pero tenemos exámenes,
    // reconstruimos los grupos a partir de los exámenes para que el usuario pueda ver algo.
    console.log("Generando grupos a partir de exámenes (Fallback)");
    const gruposUnicos = {};
    
    examenesCargados.forEach(ex => {
      const gNombre = ex.grupo || 'Sin Grupo';
      if (!gruposUnicos[gNombre]) {
        gruposUnicos[gNombre] = {
           id: gNombre,
           nombre: `Grupo ${gNombre}`,
           semestre: 'Unknown', // No tenemos este dato en el examen
           carrera_id: claveCarrera,
           materia_id: 0,
           capacidad_alumnos: 0,
           aula_id: 'N/A'
        };
      }
    });
    gruposData.value = Object.values(gruposUnicos).sort((a,b) => a.id.localeCompare(b.id));
  }
};

const cargarExamenesBackend = async (claveCarrera) => {
  // DEPRECATED: Usar cargarDatosCompleto
};

const cargarGruposBackend = async (claveCarrera) => {
  // DEPRECATED: Usar cargarDatosCompleto
};

const cargarGrupos = () => {
  // La vista se actualiza sola por el computed, pero el watcher activará cargarGruposBackend
};

/* =========================
   FUNCIONES DE SERVICIO
========================= */
const obtenerNombreMateria = (materiaId) => {
  return ''; // Ya no se usa, viene en el objeto examen
};

const obtenerNombreTipoExamen = (tipoId) => {
  return ''; // Viene en el objeto como idTipo o texto si lo mapeamos
};

const formatearFecha = (fecha) => {
  return examService.formatearFecha(fecha);
};

/* =========================
   LÓGICA DE EXÁMENES
========================= */
const obtenerExamenesGrupo = (grupoId) => {
  // grupoId es string '706'
  return examenesData.value.filter(
    exam => exam.grupo === grupoId
  );
};

const cambiarEstado = (examenId, nuevoEstado) => {
  const examen = examenesData.value.find(e => e.idExamen === examenId);

  if (examen) {
    examen.status = nuevoEstado;
    // Falta persistencia al backend si se requiere update
    console.log(`Estado cambiado a ${nuevoEstado} para examen ${examenId}`);
  }
};

const contarEstado = (grupoId, estado) => {
  return obtenerExamenesGrupo(grupoId)
    .filter(e => e.status === estado).length;
};

/* =========================
   NAVEGACIÓN
========================= */
const volverDashboard = () => {
  router.push('/dashboard');
};

const handleLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  router.push('/').then(() => {
    window.location.reload();
  });
};

const contactarServiciosEscolares = () => {
  alert(
    'Contactando a Servicios Escolares...\n\n' +
    'Email: servicios@universidad.edu\n' +
    'Teléfono: (555) 123-4567\n' +
    'Horario: Lunes a Viernes 8:00 AM - 5:00 PM'
  );
};
</script>

<style src="./ExamProgress.css" scoped></style>