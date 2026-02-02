<template>
  <div class="view-container">
    <div class="dashboard-hero purple-hero">
      <div class="hero-content">
        <h1>Grupos Académicos</h1>
        <p>Administración de grupos y asignaciones académicas.</p>
      </div>
    </div>

    <div v-if="cargando" class="empty-state">
       <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
       <p>Cargando grupos...</p>
    </div>
    <div v-else-if="error" class="empty-state">
       <i class="pi pi-exclamation-circle" style="color: #e53e3e;"></i>
       <p>{{ error }}</p>
    </div>
    <div v-else-if="gruposVisibles.length > 0" class="cards-grid">
      <div
        v-for="grupo in gruposVisibles"
        :key="grupo.id"
        class="card"
      >
        <div class="card-header">
          <h4>{{ grupo.nombre }}</h4>
          <span class="semester-badge">{{ grupo.semestre }}º Semestre</span>
        </div>

        <div class="card-body">
          <div class="card-item">
            <span class="label">Carrera:</span>
            <span class="value">{{ obtenerNombreCarrera(grupo.carrera_id) }}</span>
          </div>

          <div class="card-item">
            <span class="label">Materia:</span>
            <span class="value">{{ obtenerNombreMateria(grupo) }}</span>
          </div>

          <div class="card-item">
            <span class="label">Clave:</span>
            <span class="value">{{ grupo.materia_nombre }}</span>
          </div>
                    
          <div class="card-item">
            <span class="label">Alumnos:</span>
            <span class="value">{{ grupo.capacidad_alumnos }} estudiantes</span>
          </div>

          <div class="card-item">
            <span class="label">Aula:</span>
            <span class="value">{{ grupo.aula_id }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>No hay grupos disponibles</p>
    </div>
  </div>
</template>

<script setup>
import './Grupos.css'
import { computed, ref, onMounted, watch } from 'vue'
import * as examService from '../../services/examService'
import { obtenerGruposPorCarreraYPeriodo } from '../../services/backendService'

// Props que vienen del Dashboard
const props = defineProps({
  usuarioRol: {
    type: String,
    required: true
  },
  carreraSeleccionada: {
    // Acepta string (clave "06") o numero (id 1) dependiendo de la fuente
    type: [Number, String],
    default: null
  }
})

const gruposBackend = ref([])
const cargando = ref(false)
const error = ref(null)

// Mapa de carreras (fallback local)
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

// Función para cargar grupos desde el backend
const cargarGruposBackend = async () => {
  error.value = null
  console.log("Cargando grupos para carrera:", props.carreraSeleccionada)

  if (!props.carreraSeleccionada) {
    if (props.usuarioRol === 'jefe_carrera') {
        error.value = "No se ha identificado la carrera del usuario. Intente cerrar sesión e ingresar nuevamente."
    } else {
        // Para admin o servicios escolares que no han seleccionado carrera
        gruposBackend.value = []
    }
    console.warn("No hay carrera seleccionada para cargar grupos")
    return
  }
  
  const claveCarrera = String(props.carreraSeleccionada)
 
  const periodoFijo = "2526A" 

  cargando.value = true
  try {
    const data = await obtenerGruposPorCarreraYPeriodo(claveCarrera, periodoFijo)
    console.log("Grupos recibidos:", data)
    
    // Mapear los datos
    gruposBackend.value = data.map(g => ({
      id: g.idGrupo,
      nombre: g.nombre,  
      semestre: g.semestre, 
      carrera_id: g.claveCarrera || props.carreraSeleccionada, // Usar lo que venga o el seleccionado
      materia_nombre: g.clave, 
      capacidad_alumnos: g.alumnos || 0,
      aula_id: 'Por asignar' 
    }))
  } catch (err) {
    console.error("Error cargando grupos:", err)
    error.value = "Error al cargar los grupos del servidor."
    gruposBackend.value = []
  } finally {
    cargando.value = false
  }
}

// Cargar al montar y cuando cambie la carrera
onMounted(cargarGruposBackend)
watch(() => props.carreraSeleccionada, (newVal) => {
  if (newVal) cargarGruposBackend()
})
watch(() => props.usuarioRol, () => {
   // Recargar si cambia el rol (ej. login rapido)
   cargarGruposBackend()
})

// Filtrado por rol
const gruposVisibles = computed(() => {
  return gruposBackend.value
})

// Funciones auxiliares
const obtenerNombreCarrera = (id) => {
  // Manejo de ID que viene del backend como texto "LISI", "LIM", etc.
  // Podríamos tener un mapa inverso o extendido, pero por ahora mostramos si está en el mapa numérico
  if (mapCarreras[id]) return mapCarreras[id]
  
  // Si no, intentar servicio (mocks)
  const nombreServicio = examService.obtenerNombreCarrera(id)
  if (nombreServicio && nombreServicio !== 'Desconocida') return nombreServicio
  
  // Si no hay match, mostramos el código tal cual (ej "LISI")
  return id || 'Desconocida'
}



// Modificado para aceptar nombre directo si ya viene del backend
const obtenerNombreMateria = (grupo) =>{
  // Como el endpoint de grupos NO devuelve la materia, por ahora mostraremos la carrera o un texto genérico
  // Idealmente el endpoint debería devolver la materia asociada o el nombre de la materia.
  return "Materia del semestre " + grupo.semestre 
}
</script>

