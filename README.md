# Sistema de Horarios de Exámenes - UNSIS

Un sistema web moderno para la gestión y programación de exámenes académicos en la Universidad del Noroeste (UNSIS). Desarrollado con Vue.js 3 y PrimeVue para una experiencia de usuario intuitiva y responsiva.

## Características

### Para Servicios Escolares
- **Panel de Control Completo**: Vista general de todos los exámenes, grupos y estadísticas
- **Gestión de Exámenes**: Crear, editar y eliminar exámenes
- **Vista de Calendario**: Programación visual de exámenes
- **Gestión de Grupos**: Administración de grupos académicos
- **Gestión de Materias**: Control de materias por carrera
- **Sistema de Sinodales**: Asignación de sinodales a materias
- **Auditoría**: Registro de todas las acciones realizadas

### Para Jefes de Carrera
- **Vista Filtrada**: Acceso limitado a su carrera específica
- **Generación Automática**: Herramientas para programar exámenes automáticamente
- **Gestión de Sinodales**: Administración de sinodales para su carrera
- **Estadísticas Específicas**: Métricas enfocadas en su área

## tecnologías Utilizadas

- **Frontend Framework**: Vue.js 3 (Composition API)
- **UI Library**: PrimeVue 3 + PrimeIcons
- **Router**: Vue Router 4
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3 con diseño moderno y responsivo

##  Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

## Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd sistemas-horarios
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**

   Ve a `http://localhost:5173` (o el puerto que indique la consola)

## Uso

### Usuarios de Demostración

El sistema incluye usuarios de demostración para probar todas las funcionalidades:

#### Servicios Escolares
- **Email**: `servicios@unsis.edu`
- **Contraseña**: `pass123`
- **Permisos**: Acceso completo a todas las funcionalidades

#### Jefes de Carrera
- **Informática**: `jefe.informatica@unsis.edu`
- **Medicina**: `jefe.medicina@unsis.edu`
- **Contraseña**: `pass123` (para ambos)

### Navegación Principal

1. **Login**: Autenticación con usuarios demo
2. **Dashboard**: Panel principal con estadísticas y accesos rápidos
3. **Calendario**: Vista mensual de exámenes programados
4. **Grupos**: Gestión de grupos académicos
5. **Materias**: Administración de materias
6. **Progreso**: Seguimiento del estado de exámenes
7. **Sinodales**: Gestión de sinodales (solo jefes de carrera)
8. **Generación Automática**: Herramientas de programación automática

## Estructura del Proyecto

```
Sistema-Horarios/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/            # Recursos estáticos
│   ├── components/        # Componentes reutilizables
│   │   ├── SideBar.vue    # Barra lateral de navegación
│   │   └── ...
│   ├── router/
│   │   └── index.js       # Configuración de rutas
│   ├── services/
│   │   ├── examService.js # Servicios de datos simulados
│   │   └── ...
│   ├── views/             # Páginas principales
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── ExamProgress/
│   │   ├── Sinodal/
│   │   └── ...
│   ├── App.vue            # Componente raíz
│   └── main.js            # Punto de entrada
├── package.json
├── vite.config.js
└── README.md
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción

## Características de UI/UX

- **Diseño Moderno**: Interfaz limpia con efectos glassmorphism
- **Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Accesible**: Navegación intuitiva y clara
- **Animaciones**: Transiciones suaves y efectos visuales
- **Tema Oscuro/Claro**: Soporte para diferentes temas

## Datos Simulados

El sistema incluye datos de demostración que simulan:
- Carreras académicas (Informática, Medicina, Administración)
- Materias por carrera y semestre
- Grupos académicos con capacidad y aulas asignadas
- Tipos de exámenes (Parciales, Ordinarios, Extraordinarios)
- Usuarios con diferentes roles y permisos

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Autores

- **Equipo de Desarrollo** - Desarrollo inicial

## Agradecimientos

- Universidad de la Sierra Sur (UNSIS) por el requerimiento del proyecto
- PrimeVue por la excelente librería de componentes
- Vue.js por el framework robusto y moderno

---

**Nota**: Este es un proyecto de demostración educativo. Los datos son simulados y no representan información real de la universidad.
