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
            <th>Carrera</th>
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
          <span v-if="u.rol === 'JEFE'">
          {{ mapCarreras[u.claveCarrera] || u.claveCarrera }}
        </span>
          <span v-else class="text-muted">
    —
  </span>
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

        <!-- CARRERA (SOLO JEFE DE CARRERA) -->
      <div
  class="form-group"
  v-if="nuevoUsuario.rol === 'JEFE'"
>
  <label>Carrera</label>
  <select v-model="nuevoUsuario.carrera">
    <option disabled value="">Seleccione una carrera</option>
    <option
      v-for="carrera in carrerasDisponibles"
      :key="carrera"
      :value="carrera"
    >
      {{ carrera }}
    </option>
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
        <div v-if="errorModal" class="error-message">
           {{ errorModal }}
             </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import './AdminUsuarios.css'
import { ref, computed, onMounted } from 'vue'
import { crearUsuario as crearUsuarioService, obtenerUsuarios as obtenerUsuariosService } from '../../services/backendService'

/* ===== CARRERAS Y CLAVES ===== */
const mapCarreras = {
  "01": "LICENCIATURA EN ADMINISTRACIÓN MUNICIPAL",
  "03": "LICENCIATURA EN ENFERMERÍA",
  "04": "LICENCIATURA EN CIENCIAS EMPRESARIALES",
  "05": "LICENCIATURA EN ADMINISTRACIÓN PÚBLICA",
  "06": "LICENCIATURA EN INFORMÁTICA",
  "07": "LICENCIATURA EN NUTRICIÓN",
  "08": "MAESTRÍA EN PLANEACIÓN ESTRATÉGICA MUNICIPAL",
  "09": "MAESTRÍA EN SALUD PÚBLICA",
  "10": "MAESTRÍA EN GOBIERNO ELECTRÓNICO",
  "11": "DOCTORADO EN GOBIERNO ELECTRÓNICO",
  "12": "INGLÉS",
  "14": "LICENCIATURA EN ODONTOLOGÍA",
  "15": "LICENCIATURA EN MEDICINA",
  "15POS": "MAESTRÍA EN ADMINISTRACIÓN UNIVERSITARIA",
  "16A": "LICENCIATURA EN CIENCIAS BIOMÉDICAS"
}

const carreras = Object.values(mapCarreras)

/* ===== USUARIOS ===== */
const usuarios = ref([])

onMounted(async () => {
  try {
    usuarios.value = await obtenerUsuariosService()
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
})

const mostrarModal = ref(false)
const errorModal = ref('')

/* ===== NUEVO USUARIO ===== */
const nuevoUsuario = ref({
  nombre: '',
  email: '',
  username: '',
  password: '',
  rol: 'SERV',
  carrera: null,
  activo: true
})

/* ===== CARRERAS DISPONIBLES (NO DUPLICADAS) ===== */
const carrerasDisponibles = computed(() => {
  const ocupadas = usuarios.value
    .filter(u => u.rol === 'JEFE')
    .map(u => u.carrera)

  return carreras.filter(c => !ocupadas.includes(c))
})

/* ===== CREAR USUARIO ===== */
const crearUsuario = async () => {
  errorModal.value = ''

  // Campos obligatorios
  if (
    !nuevoUsuario.value.nombre ||
    !nuevoUsuario.value.email ||
    !nuevoUsuario.value.username ||
    !nuevoUsuario.value.password
  ) {
    errorModal.value = 'Todos los campos son obligatorios'
    return
  }

  // Validar correo
  if (!emailValido(nuevoUsuario.value.email)) {
    errorModal.value = 'El correo no es válido'
    return
  }

  // Validar contraseña
  if (nuevoUsuario.value.password.length < 6) {
    errorModal.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  // Validar carrera si es JEFE y obtener clave
  let claveCarrera = null
  if (nuevoUsuario.value.rol === 'JEFE') {
    if (!nuevoUsuario.value.carrera) {
      errorModal.value = 'Debe seleccionar una carrera'
      return
    }
    // Encontrar clave (key) por valor (nombre)
    claveCarrera = Object.keys(mapCarreras).find(key => mapCarreras[key] === nuevoUsuario.value.carrera)
  }

  try {
    // Payload para el backend
    const payload = {
      nombre: nuevoUsuario.value.nombre,
      email: nuevoUsuario.value.email,
      username: nuevoUsuario.value.username,
      password: nuevoUsuario.value.password,
      rol: nuevoUsuario.value.rol,
      claveCarrera: claveCarrera
    }

    // Llamada al servicio
    const res = await crearUsuarioService(payload)

    // Actualizar lista local
    usuarios.value.push({
      idUsuario: res.idUsuario || res.id || usuarios.value.length + 1,
      nombre: payload.nombre,
      email: payload.email,
      username: payload.username,
      rol: payload.rol,
      claveCarrera: payload.claveCarrera,
      activo: true
    })

    cerrarModal()

  } catch (error) {
    console.error(error)
    errorModal.value = 'Error al guardar usuario en el servidor'
  }
}



/* ===== CERRAR MODAL ===== */
const cerrarModal = () => {
  mostrarModal.value = false
  errorModal.value = ''
  nuevoUsuario.value = {
    nombre: '',
    email: '',
    username: '',
    password: '',
    rol: 'SERV',
    carrera: null,
    activo: true
  }
}


/* ===== TEXTO DE ROL ===== */
const obtenerRol = (rol) => {
  if (rol === 'ADMIN') return 'Administrador'
  if (rol === 'SERV') return 'Servicios Escolares'
  return 'Jefe de Carrera'
}

const emailValido = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}


</script>
