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

const rangos = {
  parcial: generarRango('2025-12-01', '2025-12-08'),
  ordinario: generarRango('2026-01-19', '2026-01-26'),
  extraordinario: generarRango('2026-01-30', '2026-02-09')
}

//Carga
onMounted(() => {
  materias.value = examService.obtenerMateriasParaExamen(1)
  aulas.value = examService.obtenerAulas()
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

function generar() {
  if (!periodo.value || !tipo.value) {
    alert('Selecciona el periodo y el tipo de examen')
    return
  }

  if (tipo.value === 'parcial' && !parcial.value) {
    alert('Selecciona el parcial')
    return
  }

  if (!fechaInicio.value || !fechaFin.value) {
    alert('Selecciona el rango de fechas para los exámenes')
    return
  }
  
  // Validar que inicio no sea mayor que fin
  if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
    alert('La fecha de inicio no puede ser posterior a la fecha de fin')
    return
  }

  examenesPreview.value.forEach(examen => {
    examService.crearExamen({
      periodo: periodo.value,
      tipo: tipo.value,
      parcial: parcial.value || null,
      materia: examen.materia,
      grupo: examen.grupo,
      profesor: examen.profesor,
      fecha: examen.fecha,
      hora: examen.hora,
      aula: examen.aula,
      estado: 'pendiente'
    })
  })
  mostrarGenerar.value = true
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
