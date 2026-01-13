import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login/Login.vue'
import Dashboard from '../views/Dashboard/Dashboard.vue'
import ExamProgress from '../views/ExamProgress/ExamProgress.vue'
import SinodalManager from '../views/Sinodal/SinodalManager.vue'
import GenerateExams from '../views/ProgramarExamen/GenerateExams.vue'
import NewExam from '../views/NewExam/NewExam.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/progreso',
    name: 'exam-progress',
    component: ExamProgress,
    meta: { requiresAuth: true }
  },
  {
    path: '/sinodales',
    name: 'sinodales',
    component: SinodalManager,
    meta: { requiresAuth: true }
  },
  {
    path: '/generar-examenes',
    name: 'generar-examenes',
    component: GenerateExams,
    meta: { requiresAuth: true }
  },
  {
    path: '/new-exam',
    name: 'nuevo-exam',
    component: GenerateExams,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user') || sessionStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
