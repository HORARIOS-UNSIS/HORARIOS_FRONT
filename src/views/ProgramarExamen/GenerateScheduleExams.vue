<template>
  <div class="container">
    <h2>Horario de Exámenes</h2>

    <table v-if="examenes.length > 0">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Aula</th>
          <th>Materia</th>
          <th>Aplica</th>
          <th>Sinodal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in examenes" :key="e.id">
          <td>{{ e.fecha }}</td>
          <td>{{ e.hora }}</td>
          <td>{{ e.aula }}</td>
          <td>{{ e.materia }}</td>
          <td>
            <span v-if="e.es_academico">Jefe de Carrera</span>
            <span v-else>Profesor Titular</span>
          </td>
          <td>{{ e.sinodal }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="empty">No hay exámenes generados</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const examenes = ref([]);

onMounted(() => {
  const data = JSON.parse(localStorage.getItem('examenes_generados')) || [];

  // Completar datos faltantes (simulación)
  examenes.value = data.map((e, index) => ({
    ...e,
    hora: generarHora(index),
    aula: `Aula ${index + 1}`,
    sinodal: e.es_academico ? 'Asignado por Jefe de Carrera' : 'Profesor Titular'
  }));
});


function generarHora(index) {
  const horas = ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00'];
  return horas[index % horas.length];
}
</script>

<style scoped>
.container {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

th {
  background: #f4f4f4;
}

.empty {
  margin-top: 20px;
  font-style: italic;
}
</style>
