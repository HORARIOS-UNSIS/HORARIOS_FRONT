<template>
  <div class="sidebar-modern" :class="{ expanded: isExpanded }">
    <!-- Main Sidebar Content -->
    <div class="sidebar-content">
      <!-- Header with Logo -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon-wrapper">
            <div class="logo-icon">
              <span class="icon-text">◊</span>
            </div>
          </div>
          <transition name="logo-fade">
            <div v-if="isExpanded" class="logo-text-container">
              <h1 class="logo-title">UNSIS</h1>
              <p class="logo-subtitle">Sistema de Exámenes</p>
            </div>
          </transition>
        </div>
        
        <button class="toggle-btn" @click="toggleSidebar">
          <span class="toggle-icon">
            <i class="pi" :class="isExpanded ? 'pi-angle-left' : 'pi-angle-right'"></i>
          </span>
        </button>
      </div>

      <!-- User Info Panel -->
      <transition name="slide-down">
        <div v-if="isExpanded" class="user-panel">
          <div class="user-avatar">
            <i class="pi pi-user"></i>
            <div class="avatar-status"></div>
          </div>
          <div class="user-info">
            <p class="user-name">{{ getRoleName() }}</p>
            <span class="user-badge">{{ userRole === 'jefe_carrera' ? 'Jefe' : 'Admin' }}</span>
          </div>
        </div>
      </transition>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <transition name="fade">
            <span v-if="isExpanded" class="section-title">MENÚ PRINCIPAL</span>
          </transition>
          
          <div 
            v-for="item in allMenuItems" 
            :key="item.id"
            class="nav-item-wrapper"
          >
            <div 
              class="nav-item" 
              :class="{ active: currentView === item.id, 'has-badge': item.badge }"
              @click="handleItemClick(item)"
              @mouseenter="hoveredItem = item.id"
              @mouseleave="hoveredItem = null"
            >
              <!-- Active Indicator -->
              <div class="active-indicator"></div>
              
              <!-- Icon with Badge -->
              <div class="nav-icon-container">
                <i class="pi" :class="item.icon"></i>
                <transition name="badge-pop">
                  <span v-if="item.badge" class="icon-badge">{{ item.badge }}</span>
                </transition>
              </div>
              
              <!-- Text Content -->
              <transition name="slide-fade">
                <div v-if="isExpanded" class="nav-content">
                  <span class="nav-title">{{ item.title }}</span>
                  <span class="nav-desc">{{ item.description }}</span>
                </div>
              </transition>
            </div>
            
            <!-- Tooltip for Collapsed State -->
            <transition name="tooltip-fade">
              <div v-if="!isExpanded && hoveredItem === item.id" class="nav-tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-content">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                  <span v-if="item.badge" class="tooltip-badge">{{ item.badge }} nuevo(s)</span>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Settings Section -->
        <div class="nav-section">
          <transition name="fade">
            <span v-if="isExpanded" class="section-title">SISTEMA</span>
          </transition>
          
          <div class="nav-item-wrapper">
            <div 
              class="nav-item" 
              :class="{ active: currentView === 'auditoria' }"
              @click="handleItemClick({ id: 'auditoria', title: 'Auditoría', description: 'Registro de cambios', icon: 'pi-history' })"
              @mouseenter="hoveredItem = 'auditoria'"
              @mouseleave="hoveredItem = null"
            >
              <div class="active-indicator"></div>
              <div class="nav-icon-container">
                <i class="pi pi-history"></i>
              </div>
              
              <transition name="slide-fade">
                <div v-if="isExpanded" class="nav-content">
                  <span class="nav-title">Auditoría</span>
                  <span class="nav-desc">Registro de cambios</span>
                </div>
              </transition>
            </div>
            
            <!-- Tooltip for Auditoria -->
            <transition name="tooltip-fade">
              <div v-if="!isExpanded && hoveredItem === 'auditoria'" class="nav-tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-content">
                  <strong>Auditoría</strong>
                  <span>Registro de cambios</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </nav>

      <!-- Footer with Logout -->
      <div class="sidebar-footer">
        <div 
          class="logout-btn" 
          @click="handleLogout"
          @mouseenter="hoveredItem = 'logout'"
          @mouseleave="hoveredItem = null"
        >
          <div class="nav-icon-container">
            <i class="pi pi-sign-out"></i>
          </div>
          
          <transition name="slide-fade">
            <div v-if="isExpanded" class="nav-content">
              <span class="nav-title">Cerrar Sesión</span>
              <span class="nav-desc">Salir del sistema</span>
            </div>
          </transition>

          <transition name="tooltip-fade">
            <div v-if="!isExpanded && hoveredItem === 'logout'" class="nav-tooltip logout-tooltip">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-content">
                <strong>Cerrar Sesión</strong>
                <span>Salir del sistema</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'


const props = defineProps({
  currentView: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  }
})


const emit = defineEmits(['update:currentView', 'logout'])

const router = useRouter()

//  estado
const isExpanded = ref(true)
const hoveredItem = ref(null)

// menu 
const allMenuItems = computed(() => {
  const items = [
    {
      id: 'examenes',
      title: 'Dashboard',
      description: 'Panel principal',
      icon: 'pi-home',
  
    },
    {
      id: 'calendario',
      title: 'Calendario',
      description: 'Programación',
      icon: 'pi-calendar',
      
    },
    {
      id: 'grupos',
      title: 'Grupos',
      description: 'Gestión de grupos',
      icon: 'pi-users'
    },
    {
      id: 'materias',
      title: 'Materias',
      description: 'Catálogo',
      icon: 'pi-book'
    },
    {
      id: 'progreso',
      title: 'Progreso',
      description: 'Estadísticas',
      icon: 'pi-chart-line'
    }
  ]

  // Opciones extra para Jefe de Carrera
  if (props.userRole === 'jefe_carrera') {
    items.push(
      {
        id: 'sinodales',
        title: 'Sinodales',
        description: 'Asignar evaluadores',
        icon: 'pi-user-plus'
      },
      {
        id: 'generacion-auto',
        title: 'Auto-Generar',
        description: 'Creación rápida',
        icon: 'pi-bolt'
      }
    )
  }

  return items
})

// metodos
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
}

const handleItemClick = (item) => {
  if (item.route) {
    router.push(item.route)
  } else if (item.action) {
    item.action()
  } else {
    emit('update:currentView', item.id)
  }
}

const handleLogout = () => {
  emit('logout')
}

const getRoleName = () => {
  return props.userRole === 'jefe_carrera'
    ? 'Jefe de Carrera'
    : 'Servicios Escolares'
}
</script>

<style scoped src="./Sidebar.css"></style>