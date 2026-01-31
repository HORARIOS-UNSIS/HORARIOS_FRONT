<template>
  <div class="login-container">
    <!-- Fondo decorativo -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <!-- Contenido principal -->
    <div class="login-content">
      <!-- Bienvenida -->
      <div class="welcome-section">
      <LogoApp/>
        <!--h1 class="welcome-title">Bienvenido</h1>
        <p class="welcome-subtitle">Inicia tu gestión de exámenes...</p-->
      </div>

      <!-- Formulario -->
      <div class="form-section">
        <div class="form-header">
          <div class="logo">
            <span class="logo-icon">◊</span>
            <span class="logo-text">UNSIS</span>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Usuario</label>
            <div class="input-wrapper">
              <input
                v-model="email"
                type="email"
                id="email"
                placeholder="usuario@unsis.edu"
                required
              />
              <i class="pi pi-user"></i>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <input
                v-model="password"
                type="password"
                id="password"
                placeholder="••••••••"
                required
              />
              <i class="pi pi-lock"></i>
            </div>
          </div>

          <div class="remember-forgot">
            <label class="remember-checkbox">
              <input type="checkbox" v-model="rememberMe" />
              <span>Recuérdame</span>
            </label>
            <a href="#" class="forgot-password">Olvidé mi contraseña</a>
          </div>

          <button type="submit" class="login-btn">INICIAR SESIÓN</button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <div class="login-footer">
          <p>¿No tienes cuenta? <a href="#">Contacta a Servicios Escolares</a></p>
        </div>
      </div>
    </div>

    <!-- Usuarios demo 
    <div class="demo-info">
      <div class="demo-header">📋 Usuarios de Demostración</div>

      <div class="demo-users">
        <div class="demo-item">
          <span class="demo-role">Servicios Escolares</span>
          <span class="demo-email">servicios@unsis.edu</span>
        </div>
        <div class="demo-item">
          <span class="demo-role">Jefe de Carrera (Informática)</span>
          <span class="demo-email">jefe.informatica@unsis.edu</span>
        </div>
        <div class="demo-item">
          <span class="demo-role">Jefe de Carrera (Medicina)</span>
          <span class="demo-email">jefe.medicina@unsis.edu</span>
        </div>
      </div>

      <p class="demo-password">
        Contraseña para todos: <strong>password123</strong>
      </p>
    </div>-->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoApp from '../../components/LogoApp.vue'
import { loginUser } from '../../services/authService'

const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  if (!email.value || !password.value) {
    error.value = 'Todos los campos son obligatorios'
    loading.value = false
    return
  }

  try {
    // Llamar al servicio de autenticación del backend
    const result = await loginUser(email.value, password.value)

    if (result.success) {
      // Guardar datos adicionales si es necesario
      const userData = {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
        logged_at: new Date().toISOString()
      }
      localStorage.setItem('user', JSON.stringify(userData))

      // Redireccionar al dashboard
      router.push('/dashboard')
    } else {
      error.value = result.error || 'Error al iniciar sesión'
    }
  } catch (err) {
    console.error('Error en login:', err)
    error.value = 'Error de conexión con el servidor. Verifica que el backend esté disponible.'
  } finally {
    loading.value = false
  }
}
</script>

<style src="./Login.css" scoped></style>