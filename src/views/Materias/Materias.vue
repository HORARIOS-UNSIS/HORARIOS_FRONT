<template>
  <div class="view-container">

    <!-- HEADER -->
    <div class="section-header">
      <div class="section-title">
        <h3>Configuración de Materias</h3>
        <span class="count-badge">{{ materias.length }}</span>
      </div>

      <button
        class="btn-primary"
        :disabled="bloqueado"
        @click="guardarConfiguracion"
      >
        Guardar configuración
      </button>
    </div>

    <div v-if="bloqueado" class="alert-warning">
      Ya existen exámenes programados. La configuración de materias está bloqueada.
    </div>
    
    <div v-if="cargando" class="empty-state">
       <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
       <p>Cargando materias...</p>
    </div>

    <div v-else-if="error" class="empty-state">
       <i class="pi pi-exclamation-circle" style="color: #e53e3e;"></i>
       <p>{{ error }}</p>
    </div>


    <div v-else-if="materias.length" class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Materia</th>
            <th>Profesor</th>
            <th>
              <div class="th-inline">
                <span>Tipo de aplicación</span>
                <div class="check-all" 
                @click="aplicarTipoTodos = !aplicarTipoTodos"
                title="Asignar a computadora todas las materias"
                >
                  <span class="checkbox" :class="{ checked: aplicarTipoTodos }">
                    <span v-if="aplicarTipoTodos">✓</span>
                  </span>
                </div>
              </div>
            </th>
            <th>
              <div class="th-inline">
                <span>¿Es academia?</span>
                <div class="check-all" 
                @click="aplicarAcademiaTodos = !aplicarAcademiaTodos"
                title="Asignar Academia a todas las materias"
                >
                  <span class="checkbox" :class="{ checked: aplicarAcademiaTodos }">
                    <span v-if="aplicarAcademiaTodos">✓</span>
                  </span>
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(m, i) in materias"
            :key="i"
            :class="{ pendiente: !m.tipo_aplicacion || m.es_academia === null }"
          >
            <td>{{ m.grupo }}</td>
            <td>{{ m.nombre }}</td>
            <td>{{ m.profesor }}</td>

            <!-- TIPO D EXAMEN -->
            <td class="center">
              <button
                class="chip"
                :class="m.tipo_aplicacion"
                @click="toggleTipo(m)"
              >
                {{ m.tipo_aplicacion === 'computadora'? 'Computadora': 'Escrito' }}
              </button>
            </td>

            <!-- ACADEMIA -->
            <td class="center">
              <button
                class="chip"
                :class="{ active: m.es_academia }"
                @click="toggleAcademia(m)"
              >
                {{ m.es_academia ? 'Sí' : 'No' }}
              </button>
              <span v-if="m.es_academia === null" class="status-pending">
                Sin asignar
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- VACÍO -->
    <div v-else class="empty-state">
      <p>No hay materias registradas</p>
    </div>

  </div>
</template>

<script setup>
import './Materias.css'
import { ref, onMounted, computed, watch } from 'vue'
import * as examService from '../../services/examService'
import { obtenerMateriasPorCarreraYPeriodo } from '../../services/backendService'

const props = defineProps({
  usuarioRol: {
    type: String,
    required: true
  },
  carreraSeleccionada: {
    type: [Number, String],
    default: null
  }
})

const materias = ref([])
const examenesGenerados = ref(false)

const aplicarTipoTodos = ref(false)
const aplicarAcademiaTodos = ref(false)

const cargando = ref(false)
const error = ref(null)

const cargarMateriasBackend = async () => {
  error.value = null
  
  // Si no hay carrera seleccionada, no hacer nada (o limpiar)
  if (!props.carreraSeleccionada) {
    return
  }
  
  const claveCarrera = String(props.carreraSeleccionada)
  const periodoFijo = "2526A" // Mismo periodo que Grupos.vue

  cargando.value = true
  try {
    const data = await obtenerMateriasPorCarreraYPeriodo(claveCarrera, periodoFijo)
    
    // Mapeo: 
    // { "nombre": "Programación I", "esAcademia": true, "claveGrupo": "106", "nombreProfesor": "Juan Perez" }
    
    materias.value = data.map((m, i) => ({
      id: i, // No viene ID, usamos índice temporalmente
      grupo: m.claveGrupo,
      nombre: m.nombre,
      profesor: m.nombreProfesor,
      tipo_aplicacion: 'computadora', // Default
      es_academia: m.esAcademia
    }))
    
  } catch (err) {
    console.error("Error cargando materias:", err)
    error.value = "Error al cargar materias"
    materias.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarMateriasBackend()
  
  // verificr si ya hay examenes programados
  //examenesGenerados.value = examService.obtenerExamenes().length > 0
  // Simulación: NO hay exámenes programados
  examenesGenerados.value = false
})

watch(() => props.carreraSeleccionada, (newVal) => {
  if (newVal) cargarMateriasBackend()
})
watch(() => props.usuarioRol, () => {
   cargarMateriasBackend()
})

const bloqueado = computed(() => examenesGenerados.value)

//funciones
function guardarConfiguracion() {
  const pendientes = materias.value.filter(
    m => !m.tipo_aplicacion || m.es_academia === null
  )

  if (pendientes.length > 0) {
    alert('Hay materias sin configurar (tipo de aplicación o academia)')
    return
  }

  console.log('Configuración guardada:', materias.value)
  alert('Configuración de materias guardada correctamente ✅')
}

//funcion para aplicar los cambios a todas las materias


function aplicarAcademiaATodos(valor) {
  materias.value.forEach(m => (m.es_academia = valor))
}

watch(aplicarTipoTodos, (val) => {
  if (val) {
    materias.value.forEach(m => {
      m.tipo_aplicacion = 'computadora'
    })
  }
})

watch(aplicarAcademiaTodos, (val) => {
  if (val) {
    materias.value.forEach(m => {
      m.es_academia = false
    })
  }
})

function toggleTipo(m) {
  aplicarTipoTodos.value = false
  m.tipo_aplicacion =
    m.tipo_aplicacion === 'computadora' ? 'escrito' : 'computadora'
}

function toggleAcademia(m) {
  aplicarAcademiaTodos.value = false
  m.es_academia = !m.es_academia
}


</script>
