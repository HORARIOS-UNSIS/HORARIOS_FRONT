
  <!--<div class="view-container">
    -<div class="title-hero">
      <div class="hero-content">
        <h1 class="page-title">Gestión de Sinodales</h1>
        <p class="page-subtitle">Administra los sinodales asignados a cada materia y su estatus académico.</p>
      </div>
    </div>
    
    <div class="dashboard-hero purple-hero">
      <div class="hero-content">
        <h1>Gestión de Sinodales</h1>
        <p>Administra los sinodales asignados a cada materia y su estatus académico.</p>
      </div>
    </div>
-->
<template>
  <div class="view-container">

    <!-- HEADER  -->
    <div class="section-header">
      <div class="section-title">
        <h3>Gestión de Sinodales</h3>
        <span class="count-badge">{{ materias.length }}</span>
      </div>

      <span class="section-subtitle">
        Administra los sinodales asignados a cada materia
      </span>
    </div>

    <!-- TABLA -->
    <div v-if="materias.length" class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Profesor titular</th>
            <th>Sinodales</th>
            <th class="center">Asignar Sinodal</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="materia in materias"
            :key="materia.id"
            :class="{ pendiente: !materia.sinodales.length }"
          >
            <!-- Materia -->
            <td>
              <strong>{{ materia.nombre }}</strong><br>
              <small class="text-muted">
                {{ materia.semestre }}º semestre
              </small>
            </td>

            <!-- Profesor -->
            <td>
              {{ materia.profesor_titular || 'No asignado' }}
            </td>

            <!-- Sinodales -->
            <td>
              <div class="sinodales-list">
                <template v-if="materia.sinodales.length">
                  <div
                    v-for="(s, index) in materia.sinodales"
                    :key="index"
                    class="sinodal-chip"
                  >
                    <span>{{ s.nombre }}</span>
                    <button
                      class="remove-btn"
                      title="Quitar"
                      @click="removerSinodal(materia.id, index)"
                    >
                      ✕
                    </button>
                  </div>
                </template>

                <span v-else class="status-pending">
                  Sin asignar
                </span>
              </div>
            </td>

            <!-- Acciones -->
            <td class="center">
              <button
                class="btn-icon"
                title="Agregar sinodal"
                @click="abrirModal(materia)"
              >
                +
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- VACÍO -->
    <div v-else class="empty-state">
      No hay materias registradas
    </div>

    <!-- MODAL -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Agregar sinodal – {{ materiaSeleccionada?.nombre }}</h3>
          <button class="close-btn" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Profesor</label>

            <div
              class="dropdown-input"
              @click="toggleProfesores"
            >
              <span v-if="!nuevoSinodal.nombre" class="placeholder">
                Seleccionar profesor
              </span>
              <span v-else>
                {{ nuevoSinodal.nombre }}
              </span>
            </div>

            <div v-if="mostrarProfesores" class="sugerencias">
              <div
                v-for="prof in profesoresDisponibles"
                :key="prof.id"
                class="sugerencia-item"
                @click="seleccionarProfesor(prof)"
              >
                <strong>{{ prof.nombre }}</strong><br>
                <small>{{ prof.email }}</small>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Rol</label>
            <select v-model="nuevoSinodal.rol">
              <option value="">Seleccionar...</option>
              <option value="Sinodal 1">Sinodal 1</option>
              <option value="Sinodal 2">Sinodal 2</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="cerrarModal">Cancelar</button>
          <button
            class="btn-save"
            :disabled="!nuevoSinodal.nombre || !nuevoSinodal.rol"
            @click="agregarSinodal"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>
  import './SinodalManager.css'
  import { ref, onMounted, watch } from 'vue'
  import { 
    obtenerAsignacionesSinodales, 
    obtenerProfesores, 
    asignarSinodal,
    eliminarSinodal 
  } from '../../services/backendService'

  const props = defineProps({
    usuarioRol: String,
    carreraSeleccionada: [String, Number]
  })

  const modalVisible = ref(false)
  const materiaSeleccionada = ref(null)
  const mostrarProfesores = ref(false)
  
  const materias = ref([])
  const profesoresDisponibles = ref([])
  
  const nuevoSinodal = ref({
    nombre: '',
    idProfesor: null,
    rol: '',
    email: ''
  })

  // Cargar datos al montar
  const cargarDatos = async () => {
    if (!props.carreraSeleccionada) return

    const claveCarrera = String(props.carreraSeleccionada)
    const periodoFijo = "2526A" 

    try {
      // 1. Cargar Materias y Sinodales
      const data = await obtenerAsignacionesSinodales(claveCarrera, periodoFijo)
      
      // Mapear respuesta del back a estructura de la vista
      materias.value = data.map(m => ({
        id: m.idMateria,
        idProfesorTitular: m.idProfesorTitular, // Necesario para el POST
        nombre: m.nombreMateria,
        semestre: m.semestre,
        profesor_titular: m.nombreProfesorTitular || 'No asignado',
        sinodales: m.sinodales || [] 
      }))

    } catch (error) {
      console.error("Error cargando asignaciones:", error)
    }
  }

  const cargarProfesores = async () => {
    try {
      const data = await obtenerProfesores()
      profesoresDisponibles.value = data.map(p => ({
        id: p.id,
        nombre: p.nombre,
        email: 'consultar@uni.edu' // El back no mandaba email, mockeamos o ajustamos
      }))
    } catch (error) {
      console.error("Error cargando profesores:", error)
    }
  }

  onMounted(() => {
    cargarDatos()
    cargarProfesores()
  })

  watch(() => props.carreraSeleccionada, () => {
    cargarDatos()
  })

  const abrirModal = (materia) => {
    materiaSeleccionada.value = materia
    modalVisible.value = true
    nuevoSinodal.value = { nombre: '', idProfesor: null, rol: '', email: '' }
    mostrarProfesores.value = false
  }

  const cerrarModal = () => {
    modalVisible.value = false
    materiaSeleccionada.value = null
    mostrarProfesores.value = false
  }
  
  const toggleProfesores = () => {
    mostrarProfesores.value = !mostrarProfesores.value
  }
  
  const seleccionarProfesor = (prof) => {
    nuevoSinodal.value.nombre = prof.nombre
    nuevoSinodal.value.idProfesor = prof.id
    nuevoSinodal.value.email = prof.email
    nuevoSinodal.value.rol = '' // Reset rol si se cambia
    mostrarProfesores.value = false
  }
  
  const agregarSinodal = async () => {
    if (!materiaSeleccionada.value || !nuevoSinodal.value.idProfesor) return

    try {
      const payload = {
        idMateria: materiaSeleccionada.value.id,
        idProfesorTitular: materiaSeleccionada.value.idProfesorTitular,
        idProfesorSinodal: nuevoSinodal.value.idProfesor
      }

      // Backend Call
      await asignarSinodal(payload)

      // Éxito: Recargar la tabla
      await cargarDatos()
      cerrarModal()

    } catch (error) {
      alert("Error al asignar sinodal")
      console.error(error)
    }
  }

  const removerSinodal = async (materiaId, index) => {
    const materia = materias.value.find(m => m.id === materiaId)
    if (!materia) return

    const sinodal = materia.sinodales[index]
    if (!sinodal || !sinodal.idSinodal) return

    if(!confirm(`¿Quitar a ${sinodal.nombre}?`)) return

    try {
      await eliminarSinodal(sinodal.idSinodal)
      // Recargar tabla
      await cargarDatos()
    } catch (error) {
      console.error("Error eliminando sinodal:", error)
      alert("No se pudo eliminar el sinodal")
    }
  }

</script>

    <!--<div class="title-hero">
      <div class="hero-content">
        <h1 class="page-title">Gestión de Sinodales</h1>
        <p class="page-subtitle">Administra los sinodales asignados a cada materia y su estatus académico.</p>
      </div>
    </div>
    -->
    