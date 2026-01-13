<template>
  <div class="view-container">
    <div class="dashboard-hero purple-hero">
      <div class="hero-content">
        <h1>Grupos Académicos</h1>
        <p>Administración de grupos y asignaciones académicas.</p>
      </div>
    </div>
    <!--<div class="section-header dashboard-style">
  <div>
    <h2 class="dashboard-title">Grupos Académicos</h2>
    <p class="dashboard-subtitle">
      Administración de grupos y asignaciones
    </p>
  </div>
</div>-->


    <div v-if="gruposVisibles.length > 0" class="cards-grid">
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
            <span class="value">{{ obtenerNombreMateria(grupo.materia_id) }}</span>
          </div>

          <div class="card-item">
            <span class="label">Capacidad:</span>
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
import { computed } from 'vue'
import * as examService from '../../services/examService'

// Props que vienen del Dashboard
const props = defineProps({
  grupos: {
    type: Array,
    required: true
  },
  usuarioRol: {
    type: String,
    required: true
  },
  carreraSeleccionada: {
    type: Number,
    default: null
  }
})

// Filtrado por rol
const gruposVisibles = computed(() => {
  if (props.usuarioRol === 'servicios_escolares') {
    return props.grupos
  }
  return props.grupos.filter(
    g => g.carrera_id === props.carreraSeleccionada
  )
})

// Funciones auxiliares
const obtenerNombreCarrera = (id) =>
  examService.obtenerNombreCarrera(id)

const obtenerNombreMateria = (id) =>
  examService.obtenerNombreMateria(id)
</script>

