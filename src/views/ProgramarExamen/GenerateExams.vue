<template>
  <div class="form-container">
    <div class="form-card">

      <!-- HEADER -->
      <div class="form-header">
        <button class="back-btn" @click="router.push('/dashboard')">←</button>
        <div>
          <h2>Generar Horarios de Exámenes</h2>
          <p>Configuración y generación automática</p>
        </div>
      </div>

      <!-- BODY -->
      <div class="form-body">

        <!-- PASO 1 -->
        <div v-if="paso === 1" class="step-content">
          <h3>Datos del Examen</h3>

          <div class="form-grid">
            <div class="form-group">
              <label>Periodo</label>
              <select v-model="periodo">
                <option disabled value="">Selecciona periodo</option>
                <option v-for="p in periodos" :key="p">{{ p }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo de Examen</label>
              <select v-model="tipo">
                <option disabled value="">Selecciona</option>
                <option value="parcial">Parcial</option>
                <option value="ordinario">Ordinario</option>
                <option value="extraordinario">Extraordinario</option>
              </select>
            </div>

            <div v-if="tipo === 'parcial'" class="form-group">
              <label>Parcial</label>
              <select v-model="parcial">
                <option disabled value="">Selecciona</option>
                <option v-for="n in 3" :key="n" :value="n">
                  Parcial {{ n }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Fecha de Inicio</label>
              <input type="date" v-model="fechaInicio" />
            </div>

            <div class="form-group">
              <label>Fecha de Fin</label>
              <input type="date" v-model="fechaFin" />
            </div>
          </div>
        </div>
        <!-- FOOTER -->
        <div class="form-footer">
          <button class="btn-success" @click="generar">
            Generar Exámenes
          </button>
        </div>

          <!-- MODAL EXITO -->
        <div v-if="mostrarGenerar" class="modal-overlay">
          <div class="modal-success">
            <h3>Horarios generados</h3>
            <p>Los horarios de los exámenes fueron generados correctamente.</p>

            <div class="form-footer">
              <button class="btn-success" @click="cerrarModal">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<script setup>
import './GenerateExams.css'
import { ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import * as examService from '../../services/examService'
import { generarHorariosAuto, obtenerGruposPorCarreraYPeriodo } from '../../services/backendService'

const router = useRouter()
const mostrarGenerar = ref(false)

const paso = ref(1)
const periodo = ref('')
const tipo = ref('')
const parcial = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')
const materias = ref([])
const aulas = ref([])

const modoEdicionAulas = ref(false)
const mostrarConfirmacion = ref(false)
let respaldoAulas = []

//Datos
const periodos = ['2024-2025B', '2025-2026A', '2025-2026B']

const carrerasMap = {
  "06": "LICENCIATURA EN INFORMÁTICA",
  "12": "INGLÉS",
  "14": "LICENCIATURA EN ODONTOLOGÍA",
  "15": "LICENCIATURA EN MEDICINA",
  "15POS": "MAESTRÍA EN ADMINISTRACIÓN UNIVERSITARIA",
  "16A": "LICENCIATURA EN CIENCIAS BIOMÉDICAS"
}

const rangos = {
  parcial: generarRango('2025-12-01', '2025-12-08'),
  ordinario: generarRango('2026-01-19', '2026-01-26'),
  extraordinario: generarRango('2026-01-30', '2026-02-09')
}

//Carga
onMounted(() => {
  // materias.value = examService.obtenerMateriasParaExamen(1) // Mock
})

//Funciones

function activarEdicionAulas() {
  respaldoAulas = materias.value.map(m => ({ id: m.id, aula: m.aula }))
  modoEdicionAulas.value = true
}

function cancelarEdicionAulas() {
  respaldoAulas.forEach(r => {
    const m = materias.value.find(x => x.id === r.id)
    if (m) m.aula = r.aula
  })
  modoEdicionAulas.value = false
}

function confirmarCambios() {
  modoEdicionAulas.value = false
  mostrarConfirmacion.value = false
}

async function generar() {
  if (!periodo.value || !tipo.value) {
    alert('Selecciona el periodo y el tipo de examen')
    return
  }

  if (tipo.value === 'parcial' && !parcial.value) {
    // Si es parcial, requerimos el número, pero el schema de usuario no lo menciona explícitamente en el ejemplo
    // Asumiremos que si es parcial se maneja en "tipo" o similar, o se envía aparte
    alert('Selecciona el parcial')
    return
  }

  if (!fechaInicio.value || !fechaFin.value) {
    alert('Selecciona el rango de fechas para los exámenes')
    return
  }
  
  if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
    alert('La fecha de inicio no puede ser posterior a la fecha de fin')
    return
  }

  // Obtener datos de sesión
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const claveCarrera = user.carrera_id || user.claveCarrera
  
  if (!claveCarrera) {
    alert("No se identificó la carrera del usuario logueado.")
    return
  }
  
  // Transformar periodo para backend (Si es necesario)
  // El frontend muestra '2025-2026A', backend espera '2526A'?
  // Basado en Grupos.vue: "2526A"
  let periodoBackend = periodo.value
  if (periodo.value === '2025-2026A') periodoBackend = '2526A'
  if (periodo.value === '2024-2025B') periodoBackend = '2425B'
  // etc...

  
  try {
    // 1. Obtener grupos del backend
    const gruposData = await obtenerGruposPorCarreraYPeriodo(claveCarrera, periodoBackend)
    // Extraer solo CLAVES de grupo como array de strings (ej: ["706", "705"])
    // En Grupos.vue se usa 'g.nombre' para el identificador del grupo
    const gruposList = gruposData.map(g => g.nombre).filter(g => g)

    // 2. Construir Payload
    const payload = {
      licenciatura: carrerasMap[claveCarrera] || "CARRERA DESCONOCIDA",
      grupos: gruposList,
      periodo: periodoBackend,
      start: fechaInicio.value,
      end: fechaFin.value,
      tipo: tipo.value.toUpperCase() // ORDINARIO, PARCIAL, EXTRAORDINARIO
    }
    
    // Si es parcial, tal vez el backend lo necesite en el tipo "PARCIAL 1"? 
    // Por ahora enviamos lo que pide el esquema base.

    console.log("Enviando payload generación:", payload)

    // 3. Enviar al backend
    const resultados = await generarHorariosAuto(payload)
    
    // Guardar resultados para visualización
    if (resultados && Array.isArray(resultados)) {
       localStorage.setItem('examenes_generados', JSON.stringify(resultados))
    }

    mostrarGenerar.value = true

  } catch (error) {
    console.error(error)
    alert("Ocurrió un error al generar los horarios.")
  }
}


function generarRango(inicio, fin) {
  const fechas = []
  let actual = new Date(inicio)
  const finFecha = new Date(fin)

  while (actual <= finFecha) {
    fechas.push(actual.toISOString().split('T')[0])
    actual.setDate(actual.getDate() + 1)
  }
  return fechas
}

const examenesPreview = computed(() => {
  if (!tipo.value) return []

  let fechasDisponibles = []
  
  // Usar rango seleccionado si existe
  if (fechaInicio.value && fechaFin.value) {
    if (new Date(fechaInicio.value) <= new Date(fechaFin.value)) {
      fechasDisponibles = generarRango(fechaInicio.value, fechaFin.value)
    }
  } 
  
  // Fallback a rangos predefinidos (opcional)
  if (fechasDisponibles.length === 0 && rangos[tipo.value]) {
    fechasDisponibles = rangos[tipo.value]
  }

  // Si no hay fechas, no se genera nada (o se maneja el error en guardar)
  if (fechasDisponibles.length === 0) return []

  return materias.value.map((materia, index) => ({
    id: materia.id,
    grupo: materia.grupo,
    materia: materia.nombre,
    profesor: materia.profesor,
    fecha: fechasDisponibles[index % fechasDisponibles.length],
    hora: materia.hora_clase || '08:00',
    aula: materia.aula
  }))
})

function cerrarModal() {
  mostrarGenerar.value = false
  router.push('/dashboard')
}

</script>
