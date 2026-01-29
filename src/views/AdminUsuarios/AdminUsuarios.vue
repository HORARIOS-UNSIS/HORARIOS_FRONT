<template>
  <div class="view-container">
    <!-- HERO -->
    <div class="dashboard-hero purple-hero">
      <div class="hero-content">
        <h1>Configuración de Usuarios</h1>
        <p>Administración de usuarios del sistema</p>
      </div>
    </div>

    <!-- HEADER -->
    <div class="section-header">
      <div class="section-title">
        <h3>Usuarios registrados</h3>
        <span class="count-badge">{{ usuarios.length }}</span>
      </div>

      <button class="primary-btn" @click="mostrarModal = true">
        <i class="pi pi-plus"></i>
        Crear usuario
      </button>
    </div>

    <!-- TABLA -->
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Activo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.idUsuario">
            <td>{{ u.idUsuario }}</td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.username }}</td>
            <td>
              <span class="role-badge">{{ obtenerRol(u.rol) }}</span>
            </td>
            <td>
             <label class="switch">
              <input type="checkbox" v-model="u.activo" />
              <span class="slider"></span>
            </label>       
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal">
        <h3>Crear Usuario</h3>

        <div class="form-group">
          <label>Nombre</label>
          <input v-model="nuevoUsuario.nombre" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="nuevoUsuario.email" />
        </div>

        <div class="form-group">
          <label>Usuario</label>
          <input v-model="nuevoUsuario.username" />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" v-model="nuevoUsuario.password" />
        </div>

        <div class="form-group">
          <label>Rol</label>
          <select v-model="nuevoUsuario.rol">
            <option value="ADMIN">Administrador</option>
            <option value="SERV">Servicios Escolares</option>
            <option value="JEFE">Jefe de Carrera</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" @click="cerrarModal">
            Cancelar
          </button>
          <button class="primary-btn" @click="crearUsuario">
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import './AdminUsuarios.css'
import { ref } from 'vue'

const usuarios = ref([
  {
    idUsuario: 1,
    nombre: 'Administrador',
    email: 'admin@uni.edu',
    username: 'admin',
    password: '',
    rol: 'ADMIN',
    activo: true
  }
])

const mostrarModal = ref(false)

const nuevoUsuario = ref({
  nombre: '',
  email: '',
  username: '',
  password: '',
  rol: 'SERV',
  activo: true
})

const crearUsuario = () => {
  usuarios.value.push({
    idUsuario: usuarios.value.length + 1,
    ...nuevoUsuario.value
  })
  cerrarModal()
}

const cerrarModal = () => {
  mostrarModal.value = false
  nuevoUsuario.value = {
    nombre: '',
    email: '',
    username: '',
    password: '',
    rol: 'SERV',
    activo: true
  }
}

const obtenerRol = (rol) => {
  if (rol === 'ADMIN') return 'Administrador'
  if (rol === 'SERV') return 'Servicios Escolares'
  return 'Jefe de Carrera'
}
</script>