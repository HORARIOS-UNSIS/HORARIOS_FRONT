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

            <!-- SOLO PARCIAL -->
            <div v-if="tipo === 'parcial'" class="form-group">
              <label>Parcial</label>
              <select v-model="parcial">
                <option disabled value="">Selecciona</option>
                <option v-for="n in 3" :key="n">Parcial {{ n }}</option>
              </select>
            </div>

          </div>
        </div>

        <!-- PASO 2 -->
        <div v-if="paso === 2" class="step-content">
          <h3>Materias</h3>

          <div class="form-grid">
            <div>
              <h4>Materias Normales</h4>
              <label v-for="m in materiasNormales" :key="m.id">
                <input type="checkbox" v-model="materiasSeleccionadas" :value="m" />
                {{ m.nombre }}
              </label>
            </div>

            <div>
              <h4>Academia</h4>
              <label v-for="m in materiasAcademia" :key="m.id">
                <input type="checkbox" v-model="materiasSeleccionadas" :value="m" />
                {{ m.nombre }}
              </label>
            </div>
          </div>

          <div v-if="mostrarAviso" class="sinodal-info">
            ⚠ Las materias de academia no son aplicadas por el profesor titular
          </div>
        </div>

        <!-- PASO 3 -->
        <div v-if="paso === 3" class="step-content">
          <h3>Configuración del Examen</h3>

          <div class="form-grid">
            <div class="form-group">
              <label>Aula</label>
              <select v-model="aula">
                <option disabled value="">Selecciona aula</option>
                <option v-for="a in aulas" :key="a.id">
                  {{ a.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo de Aplicación</label>
              <select v-model="modalidad">
                <option disabled value="">Selecciona</option>
                <option value="escrito">Escrito</option>
                <option value="computadora">Computadora</option>
              </select>
            </div>
          </div>
        </div>

        <!-- PASO 4 -->
        <div v-if="paso === 4" class="step-content">
          <h3>Vista Previa</h3>

          <ul class="preview-list">
            <li><strong>Periodo:</strong> {{ periodo }}</li>
            <li><strong>Tipo:</strong> {{ tipo }}</li>
            <li v-if="parcial"><strong>{{ parcial }}</strong></li>
            <li><strong>Aula:</strong> {{ aula }}</li>
            <li><strong>Modalidad:</strong> {{ modalidad }}</li>
            <li>
              <strong>Materias:</strong>
              <ul>
                <li v-for="m in materiasSeleccionadas" :key="m.id">
                  {{ m.nombre }}
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <!-- FOOTER -->
        <div class="form-footer">
          <button class="btn-secondary" @click="paso--" v-if="paso > 1">
            Atrás
          </button>

          <button class="btn-primary" v-if="paso < 4" @click="siguientePaso">
            Continuar
          </button>

          <button class="btn-success" v-if="paso === 4" @click="generar">
            Generar Exámenes
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import './GenerateExams.css'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as examService from '../../services/examService'

const router = useRouter()

const paso = ref(1)
const periodo = ref('')
const tipo = ref('')
const parcial = ref('')
const aula = ref('')
const modalidad = ref('')

const materiasSeleccionadas = ref([])
const mostrarAviso = ref(false)

const periodos = ['2024-2025B', '2025-2026A', '2025-2026B']
const materiasNormales = ref([])
const materiasAcademia = ref([])
const aulas = ref([])

const rangos = {
  parcial: generarRango('2025-12-01', '2025-12-08'),
  ordinario: generarRango('2026-01-19', '2026-01-26'),
  extraordinario: generarRango('2026-01-30', '2026-02-09')
}

onMounted(() => {
  const materias = examService.obtenerMaterias()
  materiasNormales.value = materias.filter(m => !m.es_academico)
  materiasAcademia.value = materias.filter(m => m.es_academico)
  aulas.value = examService.obtenerAulas()
})

function siguientePaso() {
  if (paso.value === 2) {
    mostrarAviso.value = materiasSeleccionadas.value.some(m => m.es_academico)
  }
  paso.value++
}

function generar() {
  materiasSeleccionadas.value.forEach((materia, index) => {
    examService.crearExamen({
      periodo: periodo.value,
      tipo: tipo.value,
      parcial: parcial.value || null,
      materia_id: materia.id,
      fecha: rangos[tipo.value][index % rangos[tipo.value].length],
      aula: aula.value,
      modalidad: modalidad.value,
      estado: 'pendiente',
      es_academico: materia.es_academico
    })
  })

  alert('Exámenes generados correctamente')
  router.push('/dashboard')
}

function generarRango(inicio, fin) {
  const fechas = []
  let actual = new Date(inicio)
  const fechaFin = new Date(fin)

  while (actual <= fechaFin) {
    fechas.push(actual.toISOString().split('T')[0])
    actual.setDate(actual.getDate() + 1)
  }
  return fechas
}
</script>
