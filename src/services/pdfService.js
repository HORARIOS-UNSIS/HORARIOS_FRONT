import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const pdfService = {
  generarPDFHorarioExamenes(examenes, options = {}) {
    // Crear instancia de jsPDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración del documento
    const titulo = options.titulo || 'Calendario de Evaluaciones Parciales';
    const institucion = options.institucion || 'UNSIS';
    const fechaInicio = options.fechaInicio || '';
    const fechaFin = options.fechaFin || '';
    const licenciatura = options.licenciatura || '';
    const semestre = options.semestre || '';

    // Función para dibujar el encabezado
    const dibujarEncabezado = () => {
      let yPos = 15;
      
      // Título principal
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(titulo, 148.5, yPos, { align: 'center' });
      yPos += 6;

      // Subtítulo con fechas
      if (fechaInicio && fechaFin) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`EVALUACIÓN ORDINARIA DEL ${fechaInicio} AL ${fechaFin}`, 148.5, yPos, { align: 'center' });
        yPos += 6;
      }

      // Licenciatura
      if (licenciatura) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(licenciatura, 148.5, yPos, { align: 'center' });
        yPos += 6;
      }

      // Semestre
      if (semestre) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`SEMESTRE ${semestre}`, 148.5, yPos, { align: 'center' });
        yPos += 10;
      }

      return yPos;
    };

    // Dibujar encabezado inicial
    let yPos = dibujarEncabezado();

    // Agrupar exámenes por grupo
    const examenesPorGrupo = examenes.reduce((acc, examen) => {
      const grupo = examen.grupo || 'SIN GRUPO';
      if (!acc[grupo]) {
        acc[grupo] = [];
      }
      acc[grupo].push(examen);
      return acc;
    }, {});

    const grupos = Object.keys(examenesPorGrupo);
    const alturaMaximaPagina = 190; // Altura máxima antes de nueva página

    // Generar tabla por cada grupo
    grupos.forEach((grupo, index) => {
      const examenesGrupo = examenesPorGrupo[grupo];

      // Calcular altura aproximada de la tabla
      const filas = examenesGrupo.length;
      const alturaEstimada = 10 + (filas * 8) + 5; // header + filas + margen

      // Si no cabe en la página actual, crear nueva página
      if (yPos + alturaEstimada > alturaMaximaPagina) {
        doc.addPage();
        yPos = dibujarEncabezado();
      }

      // Preparar datos para la tabla
      const headers = ['GRUPO', 'MATERIA', 'ACADÉMICO TITULAR', 'FECHA', 'HORA', 'AULA'];

      const data = examenesGrupo.map(examen => [
        examen.grupo || 'N/A',
        examen.materia || 'N/A',
        examen.academico_titular || 'N/A',
        examen.fecha || 'N/A',
        examen.hora || 'N/A',
        examen.aula || 'N/A'
      ]);

      // Generar tabla con autoTable
      doc.autoTable({
        head: [headers],
        body: data,
        startY: yPos,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },  // GRUPO
          1: { cellWidth: 70, halign: 'left' },    // MATERIA
          2: { cellWidth: 70, halign: 'left' },    // ACADÉMICO TITULAR
          3: { cellWidth: 30, halign: 'center' },  // FECHA
          4: { cellWidth: 30, halign: 'center' },  // HORA
          5: { cellWidth: 25, halign: 'center' }   // AULA
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function(data) {
          // Actualizar yPos después de dibujar la tabla
          yPos = data.cursor.y + 8; // +8 para espacio entre tablas
        }
      });

      // Actualizar yPos después de cada tabla
      yPos = doc.lastAutoTable.finalY + 8;
    });

    // PIE DE PÁGINA
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount}`,
        148.5,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Guardar el PDF
    const nombreArchivo = options.nombreArchivo || 
      `Calendario_Examenes_${this.obtenerTimestamp()}.pdf`;
    doc.save(nombreArchivo);

    return {
      success: true,
      message: 'PDF generado exitosamente',
      nombreArchivo
    };
  },
 
  // Métodos auxiliares 
  obtenerFechaActual() {
    const fecha = new Date();
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  obtenerPeriodoActual() {
    const fecha = new Date();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();
    
    // Determinar si es periodo Ene-Jun o Ago-Dic
    if (mes >= 0 && mes <= 5) {
      return `Enero-Junio ${año}`;
    } else {
      return `Agosto-Diciembre ${año}`;
    }
  },

  obtenerTimestamp() {
    const fecha = new Date();
    return fecha.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .substring(0, 19);
  },

  agruparPorFecha(examenes) {
    return examenes.reduce((acc, examen) => {
      const fecha = examen.fecha || 'Sin fecha';
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});
  }
};

export default pdfService;
