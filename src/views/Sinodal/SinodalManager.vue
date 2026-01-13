<template>
  <div class="view-container">
    <!--<div class="title-hero">
      <div class="hero-content">
        <h1 class="page-title">Gestión de Sinodales</h1>
        <p class="page-subtitle">Administra los sinodales asignados a cada materia y su estatus académico.</p>
      </div>
    </div>
    -->
    <div class="dashboard-hero purple-hero">
      <div class="hero-content">
        <h1>Gestión de Sinodales</h1>
        <p>Administra los sinodales asignados a cada materia y su estatus académico.</p>
      </div>
    </div>

    <div class="table-container">
      <table class="sinodales-table">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Profesor Titular</th>
            <th>Sinodales</th>
            <th>¿Es Academia?</th>
            <th>Añadir Sinodal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="materia in materias" :key="materia.id">
            <!-- Materia -->
            <td>
              <div class="materia-info">
                <strong>{{ materia.nombre }}</strong><br>
                <small class="text-muted">{{ materia.clave }} • {{ materia.semestre }}º semestre</small>
              </div>
            </td>

            <!-- Profesor Titular -->
            <td>
              <span class="profesor-titular">
                {{ materia.profesor_titular || 'No asignado' }}
              </span>
            </td>

            <!-- Sinodales -->
            <td>
              <div class="sinodales-list">
                <template v-if="materia.sinodales && materia.sinodales.length > 0">
                  <div v-for="(s, index) in materia.sinodales" :key="index" class="sinodal-chip">
                    <span>{{ s.nombre }}</span>
                    <button @click="removerSinodal(materia.id, index)" class="remove-btn" title="Quitar">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                </template>
                <span v-else class="no-asignado">Sin asignar</span>
              </div>
            </td>

            <!-- ¿Es Académico? (Toggle Sí/No) -->
            <td class="text-center">
              <button
                @click="toggleAcademico(materia)"
                :class="['toggle-btn', materia.es_academico ? 'academico' : 'externo']"
              >
                {{ materia.es_academico ? 'Sí' : 'No' }}
              </button>
            </td>

            <!-- Acciones -->
            <td class="actions">
              <button @click="abrirModal(materia)" class="btn-add" title="Agregar sinodal">
                <i class="pi pi-plus"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Agregar Sinodal -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Agregar Sinodal - {{ materiaSeleccionada?.nombre }}</h3>
          <button @click="cerrarModal" class="close-btn"><i class="pi pi-times"></i></button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Buscar profesor (nombre o correo)</label>
            <input
              type="text"
              v-model="busqueda"
              @input="mostrarSugerencias = true"
              @focus="mostrarSugerencias = true"
              placeholder="Ej: Juan Pérez..."
              autocomplete="off"
            />
            <div v-if="mostrarSugerencias && sugerencias.length" class="sugerencias">
              <div
                v-for="prof in sugerencias"
                :key="prof.id"
                @click="seleccionarProfesor(prof)"
                class="sugerencia-item"
              >
                <strong>{{ prof.nombre }}</strong><br>
                <small>{{ prof.email }}</small>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Rol en el sinodal</label>
            <select v-model="nuevoSinodal.rol">
              <option value="">Seleccionar rol...</option>
              <option value="Sinodal_1">Sinodal 1</option>
              <option value="Sinodal_2">Sinodal 2</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-cancel">Cancelar</button>
          <button
            @click="agregarSinodal"
            :disabled="!nuevoSinodal.nombre || !nuevoSinodal.rol"
            class="btn-save"
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
import { ref, computed } from 'vue';

//Estado
const materias = ref([
  {
    id: 1,
    nombre: 'Programación Orientada a Objetos',
    clave: 'POO-301',
    semestre: 3,
    profesor_titular: 'Dr. Ana Martínez',
    sinodales: [
      {
        nombre: 'Dr. Juan Pérez García',
        rol: 'Presidente',
        email: 'juan.perez@uni.edu'
      }
    ],
    es_academico: true
  },
  {
    id: 2,
    nombre: 'Base de Datos Avanzada',
    clave: 'BDA-401',
    semestre: 4,
    profesor_titular: 'Mtra. Laura Gómez',
    sinodales: [],
    es_academico: false
  },
  {
    id: 3,
    nombre: 'Inteligencia Artificial',
    clave: 'IA-501',
    semestre: 5,
    profesor_titular: 'Dr. Roberto Castillo',
    sinodales: [
      { nombre: 'Dra. María López', rol: 'Secretario' },
      { nombre: 'Dr. Carlos Ramírez', rol: 'Vocal' }
    ],
    es_academico: true
  }
]);

const profesoresDisponibles = ref([
  { id: 1, nombre: 'Dr. Juan Pérez García', email: 'juan.perez@uni.edu' },
  { id: 2, nombre: 'Dra. María López', email: 'maria.lopez@uni.edu' },
  { id: 3, nombre: 'Mtro. Carlos Ramírez', email: 'carlos.ramirez@uni.edu' },
  { id: 4, nombre: 'Dr. Fernando Sánchez', email: 'fernando.externo@empresa.com' },
  { id: 5, nombre: 'Dra. Patricia González', email: 'patricia.gonzalez@uni.edu' }
]);


const modalVisible = ref(false);
const materiaSeleccionada = ref(null);
const busqueda = ref('');
const mostrarSugerencias = ref(false);

const nuevoSinodal = ref({
  nombre: '',
  rol: '',
  email: ''
});


const sugerencias = computed(() => {
  if (!busqueda.value) return [];

  const query = busqueda.value.toLowerCase();

  return profesoresDisponibles.value.filter(p =>
    p.nombre.toLowerCase().includes(query) ||
    p.email.toLowerCase().includes(query)
  );
});

//metodos
const abrirModal = (materia) => {
  materiaSeleccionada.value = materia;
  modalVisible.value = true;
  busqueda.value = '';
  nuevoSinodal.value = { nombre: '', rol: '', email: '' };
  mostrarSugerencias.value = true;
};

const cerrarModal = () => {
  modalVisible.value = false;
  materiaSeleccionada.value = null;
  busqueda.value = '';
  mostrarSugerencias.value = false;
};

const seleccionarProfesor = (prof) => {
  nuevoSinodal.value.nombre = prof.nombre;
  nuevoSinodal.value.email = prof.email;
  busqueda.value = prof.nombre;
  mostrarSugerencias.value = false;
};

const agregarSinodal = () => {
  if (
    !materiaSeleccionada.value ||
    !nuevoSinodal.value.nombre ||
    !nuevoSinodal.value.rol
  ) return;

  materiaSeleccionada.value.sinodales.push({
    nombre: nuevoSinodal.value.nombre,
    rol: nuevoSinodal.value.rol,
    email: nuevoSinodal.value.email
  });

  cerrarModal();
};

const removerSinodal = (materiaId, index) => {
  if (!confirm('¿Quitar este sinodal?')) return;

  const materia = materias.value.find(m => m.id === materiaId);
  if (materia) {
    materia.sinodales.splice(index, 1);
  }
};

const toggleAcademico = (materia) => {
  materia.es_academico = !materia.es_academico;
};
</script>
