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


    <div v-if="materias.length" class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Materia</th>
            <th>Profesor</th>
            <th>Tipo de aplicación</th>
            <th>¿Es academia?</th>
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
            <td>
              <select v-model="m.tipo_aplicacion" class="select-input">
                <option value="">Sin asignar</option>
                <option value="escrito">Escrito</option>
                <option value="computadora">Computadora</option>
              </select>
            </td>

            <!-- ACADEMIA -->
            <td class="center">
              <div class="toggle-group">
                <button
                  class="toggle-btn"
                  :class="{ active: m.es_academia === true }"
                  @click="m.es_academia = true"
                >
                  Sí
                </button>

                <button
                  class="toggle-btn"
                  :class="{ active: m.es_academia === false }"
                  @click="m.es_academia = false"
                >
                  No
                </button>
              </div>

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
import { ref, onMounted, computed } from 'vue'
import * as examService from '../../services/examService'

const materias = ref([])
const examenesGenerados = ref(false)

onMounted(() => {
  materias.value = examService.obtenerMateriasParaExamen().map(m => ({
    ...m,
    tipo_aplicacion: m.tipo_aplicacion || '',
    es_academia: null
  }))
  // verificr si ya hay examenes programados
  //examenesGenerados.value = examService.obtenerExamenes().length > 0
  // Simulación: NO hay exámenes programados
  examenesGenerados.value = false
})

const bloqueado = computed(() => examenesGenerados.value)

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
</script>
