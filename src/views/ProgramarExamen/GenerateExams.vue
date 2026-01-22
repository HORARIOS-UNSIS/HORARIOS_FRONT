<template>
  <div class="form-container">
    <div class="form-card">

      <!-- HEADER -->
      <div class="form-header">
        <button class="back-btn" @click="router.push('/dashboard')">←</button>
        <div>
          <h2>Generar Exámenes</h2>
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
          </div>
        </div>

        <!-- PASO 2 -->
        <div v-if="paso === 2" class="step-content">
          <h3>Resumen de Materias</h3>
          <p class="step-description">
            Las aulas se asignan automáticamente. Puedes modificarlas si lo deseas.
          </p>

          <div class="table-actions">
            <button
              v-if="!modoEdicionAulas"
              class="btn-secondary"
              @click="activarEdicionAulas"
            >
              Editar aulas
            </button>

            <button
              v-if="modoEdicionAulas"
              class="btn-success"
              @click="mostrarConfirmacion = true"
            >
              Confirmar cambios
            </button>

            <button
              v-if="modoEdicionAulas"
              class="btn-secondary"
              @click="cancelarEdicionAulas"
            >
              Cancelar
            </button>
          </div>

          <table class="exam-table">
            <thead>
              <tr>
                <th>Semestre</th>
                <th>Materia</th>
                <th>Aplicación</th>
                <th>Aula</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in materias" :key="m.id">
                <td>Semestre {{ m.semestre }}</td>
                <td>{{ m.nombre }}</td>
                <td>
                  <span class="badge" :class="m.tipo_aplicacion">
                    {{ m.tipo_aplicacion }}
                  </span>
                </td>
                <td>
                  <span v-if="!modoEdicionAulas">{{ m.aula }}</span>
                  <select v-else v-model="m.aula">
                    <option
                      v-for="a in aulas"
                      :key="a.id"
                      :value="a.nombre"
                    >
                      {{ a.nombre }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- MODAL -->
          <div v-if="mostrarConfirmacion" class="modal-overlay">
            <div class="modal-success">
              <h3>Confirmar cambios</h3>
              <p>¿Estás seguro de modificar las aulas asignadas?</p>

              <div class="form-footer">
                <button class="btn-secondary" @click="mostrarConfirmacion = false">
                  Cancelar
                </button>
                <button class="btn-success" @click="confirmarCambios">
                  Sí, confirmar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 3 -->
        <div v-if="paso === 3" class="step-content">
          <h3>Vista Previa de Exámenes</h3>
          <p class="step-description">
            Revisa cómo quedarán programados los exámenes antes de confirmarlos.
          </p>

          <table class="exam-table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Materia</th>
                <th>Profesor</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Aula</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ex in examenesPreview" :key="ex.id">
                <td>{{ ex.grupo }}</td>
                <td>{{ ex.materia }}</td>
                <td>{{ ex.profesor }}</td>
                <td>{{ ex.fecha }}</td>
                <td>{{ ex.hora }}</td>
                <td>{{ ex.aula }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- FOOTER -->
        <div class="form-footer">
          <button v-if="paso > 1" 
            class="btn-secondary" 
            @click="pasoAtras">
          </button>

          <button
            v-if="paso ===1 || paso ===2"
            class="btn-primary"
            @click="siguientePaso"
          >
            Siguiente
          </button>

          <button
            v-if="paso === 3"
            class="btn-success"
            @click="generar"
          >
            Generar Exámenes
          </button>
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

/* ===== ESTADO ===== */
const paso = ref(1)
const periodo = ref('')
const tipo = ref('')
const parcial = ref('')
const materias = ref([])
const aulas = ref([])

const modoEdicionAulas = ref(false)
const mostrarConfirmacion = ref(false)
let respaldoAulas = []

/* ===== DATOS ===== */
const periodos = ['2024-2025B', '2025-2026A', '2025-2026B']

const rangos = {
  parcial: generarRango('2025-12-01', '2025-12-08'),
  ordinario: generarRango('2026-01-19', '2026-01-26'),
  extraordinario: generarRango('2026-01-30', '2026-02-09')
}

/* ===== CARGA ===== */
onMounted(() => {
  materias.value = examService.obtenerMaterias().map(m => ({
    ...m,
    aula: m.aula || 'Aula 101'
  }))
  aulas.value = examService.obtenerAulas()
})

/* ===== FUNCIONES ===== */
function siguientePaso() {
  if (paso.value === 1 && (!periodo.value || !tipo.value)) {
    alert('Completa periodo y tipo de examen')
    return
  }
  if (tipo.value === 'parcial' && !parcial.value) {
    alert('Selecciona el parcial')
    return
  }
  paso.value++
}

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

  alert('Exámenes generados correctamente')
  router.push('/dashboard')
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

  return materias.value.map((materia, index) => ({
    id: materia.id,
    grupo: materia.grupo,
    materia: materia.nombre,
    profesor: materia.profesor,
    fecha: rangos[tipo.value][index % rangos[tipo.value].length],
    hora: materia.hora_clase || '08:00',
    aula: materia.aula
  }))
})

function pasoAtras() {
  if (paso.value > 1) paso.value--
}

</script>
