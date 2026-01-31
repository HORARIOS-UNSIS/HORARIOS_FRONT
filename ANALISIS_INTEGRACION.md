# Análisis de Integración Frontend-Backend

## Estructura del Proyecto

### Frontend (Vue.js 3 + Vite)
- **Framework:** Vue 3 (Composition API)
- **Router:** Vue Router 4
- **UI:** PrimeVue 3
- **HTTP Client:** Axios
- **Puerto:** 5171 (desarrollo) → 8080 (Docker)

### Backend (Spring Boot 3)
- **Framework:** Spring Boot 3.5.7
- **ORM:** Hibernate/JPA
- **Database:** PostgreSQL 15
- **Security:** JWT + Spring Security
- **API Docs:** Swagger/OpenAPI
- **Puerto:** 8080

---

## Estructura de Directorios

```
HORARIOS_FRONT/
├── src/
│   ├── services/
│   │   ├── apiClient.js          ← Cliente Axios con interceptores
│   │   ├── authService.js        ← Autenticación JWT
│   │   ├── backendService.js     ← Servicios de datos (profesores, materias, etc)
│   │   ├── examService.js        ← Lógica de exámenes (antiguo - a actualizar)
│   │   ├── examSchedulerService.js ← Programación de exámenes
│   │   └── pdfService.js         ← Generación de PDFs
│   ├── views/
│   │   ├── Login/                ← Autenticación (actualizado para usar API)
│   │   ├── Dashboard/            ← Panel principal
│   │   ├── ExamProgress/         ← Progreso de exámenes
│   │   ├── Sinodal/              ← Gestión de sinodales
│   │   ├── ProgramarExamen/      ← Programación de exámenes
│   │   ├── AdminUsuarios/        ← Administración de usuarios
│   │   ├── Materias/             ← Gestión de materias
│   │   ├── Grupos/               ← Gestión de grupos
│   │   └── Calendario/           ← Vista de calendario
│   ├── components/
│   ├── router/                   ← Rutas y guards de autenticación
│   └── main.js
├── .env                          ← Variables de entorno
├── .env.development              ← Config desarrollo
├── .env.production               ← Config producción (Docker)
├── docker-compose.yml            ← Orquestación de servicios
└── Dockerfile                    ← Construcción del contenedor

HORARIOS-BACK/
├── src/
│   ├── main/java/com/horarios/horarios_unsis/
│   │   ├── config/               ← Security, JWT, Swagger
│   │   ├── data/                 ← Modelos por dominio (teachers, subjects, etc)
│   │   ├── integration/          ← Clientes para APIs externas
│   │   ├── schedule/             ← Lógica de horarios de exámenes
│   │   └── shared/               ← Servicios compartidos
│   └── resources/
│       ├── db/seeddata.sql       ← Datos iniciales (ahora con hash BCrypt correcto)
│       └── application.properties
├── docker-compose.yml            ← Contenedores (BD + Backend)
└── Dockerfile                    ← Construcción del JAR

```

---

## Flujo de Autenticación

### 1. Login (Usuario ingresa credenciales)
```
Frontend: Login.vue
  ↓
authService.loginUser(username, password)
  ↓
apiClient.post('/auth/login', { username, password })
  ↓
Backend: POST /api/auth/login
  ↓
AuthController → AuthenticationManager (Spring Security)
  ↓
UserService → UserDetailsService → BD
  ↓
Valida password con BCryptPasswordEncoder
  ↓
Genera JWT token (JwtTokenUtil)
  ↓
Retorna: { token, role, username, idUsuario }
  ↓
Frontend: Almacena token en localStorage
  ↓
Router redirige a /dashboard
```

### 2. Solicitudes Autenticadas
Todas las solicitudes posteriores incluyen el token en el header:
```
Authorization: Bearer <JWT_TOKEN>
```

El interceptor en `apiClient.js` lo agrega automáticamente.

---

## Endpoints Consumidos por el Frontend

### Autenticación
- `POST /api/auth/login` - Login del usuario

### Catálogos (GET)
- `GET /api/teachers` - Listar profesores
- `GET /api/subjects` - Listar materias
- `GET /api/classrooms` - Listar aulas
- `GET /api/school-hours` - Listar horarios escolares
- `GET /api/synodals` - Listar sinodales

### Gestión de Exámenes/Horarios
- `GET /api/schedules` - Listar horarios de exámenes
- `POST /api/schedules` - Crear nuevo horario
- `PUT /api/schedules/{id}` - Actualizar horario
- `DELETE /api/schedules/{id}` - Eliminar horario
- `GET /api/schedules/profesor/{id}` - Horarios por profesor
- `GET /api/schedules/materia/{id}` - Horarios por materia

### Filtros por Entidad
- `GET /api/synodals/materia/{id}` - Sinodales de una materia
- `GET /api/synodals/profesor/{id}` - Sinodales de un profesor

---

## Servicios Implementados

### `apiClient.js`
- Configuración centralizada de Axios
- Interceptor para agregar token JWT
- Interceptor para manejar errores 401
- Base URL configurable por variable de entorno

### `authService.js`
- `loginUser(username, password)` - Autentica y almacena token
- `logoutUser()` - Limpia tokens y datos de usuario
- `getUser()` - Obtiene datos del usuario autenticado
- `isAuthenticated()` - Verifica si hay sesión activa
- `getToken()` - Obtiene el JWT token

### `backendService.js`
- `obtenerProfesores()` - Mapea respuesta del backend
- `obtenerMaterias()` - Mapea respuesta del backend
- `obtenerAulas()` - Mapea respuesta del backend
- `obtenerHorariosEscolares()` - Obtiene períodos de clase
- `obtenerSinodales()` - Obtiene asignaciones de sinodales
- `obtenerHorarios()` - Obtiene horarios de exámenes
- `crearHorario(datos)` - Crea nuevo horario de examen
- `actualizarHorario(id, datos)` - Modifica horario existente
- `eliminarHorario(id)` - Elimina horario

---

## Variables de Entorno

### `.env` (General)
```
VITE_API_URL=http://localhost:8080/api
```

### `.env.development` (Desarrollo local)
```
VITE_API_URL=http://localhost:8080/api
```

### `.env.production` (Docker)
```
VITE_API_URL=http://horarios-backend:8080/api
```

---

## Vistas del Frontend

### 1. **Login** (`/`)
- Consume: `POST /api/auth/login`
- Almacena token y redirige a `/dashboard`

### 2. **Dashboard** (`/dashboard`)
- Require autenticación
- Consume: `/api/teachers`, `/api/subjects`, `/api/schedules`
- Muestra: Panel principal, accesos rápidos, estadísticas

### 3. **Progreso de Exámenes** (`/progreso`)
- Require autenticación
- Consume: `/api/schedules`, `/api/schedules/profesor/{id}`
- Muestra: Estado de exámenes, gráficas de progreso

### 4. **Gestor de Sinodales** (`/sinodales`)
- Require autenticación
- Consume: `/api/synodals`, `/api/synodals/materia/{id}`, `/api/synodals/profesor/{id}`
- Muestra: Asignación y gestión de sinodales

### 5. **Generar Exámenes** (`/new-exam`)
- Require autenticación
- Consume: Todos los catálogos + `POST /api/schedules`
- Permite: Programar nuevos exámenes

### 6. **Admin Usuarios** (`/admin/usuarios`)
- Require autenticación + rol ADMIN
- Consume: `/api/users`
- Permite: CRUD de usuarios

---

## Router Guards

En `src/router/index.js`:
```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/') // Redirige a login
  } else {
    next()
  }
})
```

---

## Mapeo de Datos (Frontend ↔ Backend)

### Profesores
```javascript
Backend:
{
  idProfesor: 1,
  nombre: "Dr. Juan Pérez López",
  sabatico: false
}

Frontend (backendService.obtenerProfesores):
{
  id: 1,
  nombre: "Dr. Juan Pérez López",
  sabatico: false
}
```

### Materias
```javascript
Backend:
{
  idMateria: 1,
  nombre: "Matemáticas Discretas",
  esAcademia: false
}

Frontend (backendService.obtenerMaterias):
{
  id: 1,
  nombre: "Matemáticas Discretas",
  esAcademia: false
}
```

### Aulas
```javascript
Backend:
{
  idAula: 1,
  nombre: "A-101",
  capacidad: 30
}

Frontend (backendService.obtenerAulas):
{
  id: 1,
  nombre: "A-101",
  capacidad: 30
}
```

### Horarios Escolares
```javascript
Backend:
{
  id: 1,
  periodNumber: 1,
  startTime: "08:00:00",
  endTime: "09:00:00",
  isBreak: false,
  description: "Período 1"
}

Frontend (backendService.obtenerHorariosEscolares):
{
  id: 1,
  periodo: 1,
  inicio: "08:00:00",
  fin: "09:00:00",
  esReceso: false,
  descripcion: "Período 1"
}
```

### Sinodales
```javascript
Backend:
{
  idSinodal: 1,
  idProfesorSinodal: 2,
  idProfesorTitular: 1,
  idMateria: 1
}

Frontend (backendService.obtenerSinodales):
{
  id: 1,
  idProfesorSinodal: 2,
  idProfesorTitular: 1,
  idMateria: 1
}
```

---

## Docker Compose

El archivo `docker-compose.yml` en HORARIOS_FRONT orquesta:

1. **Frontend** (Port 5171:8080)
   - Construye la app Vue
   - Sirve archivos estáticos con http-server
   - Variable de entorno: `VITE_API_URL=http://horarios-backend:8080/api`

2. **Backend** (Port 8080:8080)
   - JAR de Spring Boot
   - Conectado a PostgreSQL

3. **PostgreSQL** (Port 5434:5432)
   - Base de datos con datos semilla (seeddata.sql)

Todos en la red: `horarios-network`

---

## Próximos Pasos

1. ✅ Actualizar `Login.vue` para usar `authService`
2. ✅ Crear `apiClient.js` con interceptores JWT
3. ✅ Crear `authService.js` para autenticación
4. ✅ Crear `backendService.js` para consumir datos
5. ⏳ Actualizar `Dashboard.vue` para consumir datos reales
6. ⏳ Actualizar otras vistas (Sinodales, Exámenes, etc)
7. ⏳ Ejecutar docker-compose para levantar todos los servicios
8. ⏳ Probar flujo completo frontend-backend

---

## Credenciales de Prueba

**Usuario:** jefe  
**Contraseña:** password123  
**Rol:** JEFE

Hash BCrypt: `$2a$10$/99mAN.4oLVYUGNLJYyMo.oTEhNBTw8nDT3ZwDebKtBtQCXgp2pRW`

---

## Notas Importantes

- El token JWT expira en 86400000ms (24 horas)
- Si el token expira, el usuario es redirigido a login
- Las solicitudes sin token reciben 401 Unauthorized
- Los datos mock en `examService.js` pueden mantenerse para caché local
- El frontend debe manejar errores de conexión elegantemente
- CORS debe estar configurado en el backend (actualmente permitido en las rutas públicas)
