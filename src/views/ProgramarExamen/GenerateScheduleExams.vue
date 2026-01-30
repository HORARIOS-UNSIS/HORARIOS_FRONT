<template>
  <div class="container">
    <div v-if="examenes.length > 0">
      <!-- Encabezado del calendario -->
      <div class="header-calendario">
        <h2>CALENDARIO DE EVALUACIONES PARCIALES</h2>
        <h3>EVALUACIÓN ORDINARIA DEL {{ fechaInicio }} AL {{ fechaFin }}</h3>
        <h3>{{ licenciatura }}</h3>
        <h4>SEMESTRE {{ semestre }}</h4>
      </div>

      <button class="btn-pdf" @click="generarPDF">
        Generar PDF
      </button>

      <!-- Tabla por cada grupo -->
      <div v-for="(examenesGrupo, grupo) in examenesPorGrupo" :key="grupo" class="tabla-grupo">
        <table>
          <thead>
            <tr>
              <th>GRUPO</th>
              <th>MATERIA</th>
              <th>ACADÉMICO TITULAR</th>
              <th>FECHA</th>
              <th>HORA</th>
              <th>AULA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in examenesGrupo" :key="e.id">
              <td>{{ e.grupo }}</td>
              <td>{{ e.materia }}</td>
              <td>{{ e.academico_titular }}</td>
              <td>{{ e.fecha }}</td>
              <td>{{ e.hora }}</td>
              <td>{{ e.aula }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-else class="empty">No hay exámenes generados</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import pdfService from '../../services/pdfService';

const examenes = ref([]);
const fechaInicio = ref('03 DE FEBRERO');
const fechaFin = ref('09 DE FEBRERO DE 2026');
const licenciatura = ref('LICENCIATURA EN CIENCIAS EMPRESARIALES');
const semestre = ref('2025-2026 A');

// Agrupar exámenes por grupo
const examenesPorGrupo = computed(() => {
  const grupos = {};
  examenes.value.forEach(examen => {
    const grupo = examen.grupo || 'SIN GRUPO';
    if (!grupos[grupo]) {
      grupos[grupo] = [];
    }
    grupos[grupo].push(examen);
  });
  return grupos;
});

onMounted(async () => {
  // Primero intentar cargar desde localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const dataLocal = localStorage.getItem('examenes_generados');
      
      if (dataLocal) {
        const data = JSON.parse(dataLocal);
        examenes.value = data.map((e, index) => ({
          ...e,
          hora: e.hora || generarHora(index),
          aula: e.aula || `Aula ${index + 1}`,
          grupo: e.grupo || '104A',
          academico_titular: e.academico_titular || e.sinodal || 'Por asignar'
        }));
        return;
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
    }
  }

  // Si no hay datos en localStorage, cargar desde el JSON
  try {
    const response = await fetch('/examenes_ejemplo.json');
    if (response.ok) {
      const data = await response.json();
      examenes.value = data;
      console.log('Exámenes cargados desde JSON:', data);
    }
  } catch (error) {
    console.error('Error al cargar exámenes desde JSON:', error);
    examenes.value = [];
  }
});

function generarHora(index) {
  const horas = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '16:00-18:00'];
  return horas[index % horas.length];
}

function generarPDF() {
  try {
    const resultado = pdfService.generarPDFHorarioExamenes(examenes.value, {
      titulo: 'Calendario de Evaluaciones Parciales',
      institucion: 'UNSIS - Sistema de Horarios',
      nombreArchivo: `Calendario_Examenes_${Date.now()}.pdf`,
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      licenciatura: licenciatura.value,
      semestre: semestre.value
    });
    
    if (resultado.success) {
      alert(`${resultado.message}\nArchivo: ${resultado.nombreArchivo}`);
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor, intente nuevamente.');
  }
}

</script>
 
<style scoped>
.container {
  padding: 20px;
}

.header-calendario {
  text-align: center;
  margin-bottom: 20px;
}

.header-calendario h2 {
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.header-calendario h3 {
  font-size: 14px;
  font-weight: bold;
  margin: 5px 0;
}

.header-calendario h4 {
  font-size: 13px;
  font-weight: bold;
  margin: 5px 0;
}

.btn-pdf {
  margin: 20px 0;
  padding: 10px 18px;
  background: #6a5acd;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-pdf:hover {
  background: #5a4acb;
}

.tabla-grupo {
  margin-bottom: 40px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #333;
  padding: 8px;
  text-align: center;
  font-size: 12px;
}

th {
  background: #f4f4f4;
  font-weight: bold;
}

td {
  text-align: left;
}

td:first-child,
td:nth-child(4),
td:nth-child(5),
td:nth-child(6) {
  text-align: center;
}

.empty {
  margin-top: 20px;
  font-style: italic;
}
</style>
