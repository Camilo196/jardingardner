import PDFDocument from 'pdfkit';

const C = {
  azul:         '#1a56db',
  azulOscuro:   '#1040b0',
  rojo:         '#e02222',
  azulClaro:    '#dbeafe',
  grisClaro:    '#f8f9fa',
  grisMedio:    '#e2e8f0',
  negro:        '#1e293b',
  blanco:       '#ffffff',
  verde:        '#15803d',
  verdeClaro:   '#dcfce7',
  amarillo:     '#d97706',
  amarilloClaro:'#fef3c7',
  saberColor:   '#2563eb',
  hacerColor:   '#d97706',
  serColor:     '#16a34a',
};

export interface CalificacionBoletinData {
  asignaturaId: string;
  asignaturaNombre: string;
  docenteNombre: string;
  valoracion: string;
  nota: number;
  faltas: number;
  observacion?: string;
  indicadores?: { saber: string[]; hacer: string[]; ser: string[] };
  comportamiento?: { nivel: string; descripcion?: string };
}

export interface BoletinData {
  estudiante: { nombre: string; primerApellido: string; segundoApellido?: string; cedula: string };
  curso: { nombre: string };
  director: string;
  periodo: string;
  anio: string;
  calificaciones: CalificacionBoletinData[];
  observacionGeneral?: string;
  faltasJustificadas?: number;
  faltasInjustificadas?: number;
}

const VALCOLORS: Record<string, { text: string; bg: string }> = {
  'Superior': { text: '#15803d', bg: '#dcfce7' },
  'Alto':     { text: '#1a56db', bg: '#dbeafe' },
  'Básico':   { text: '#d97706', bg: '#fef3c7' },
  'Bajo':     { text: '#e02222', bg: '#fee2e2' },
};

export class PDFService {

  async generateBoletinGardner(data: BoletinData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({ margin: 0, size: 'A4' });
        doc.on('data', (c: Buffer) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const PW = doc.page.width;
        const PH = doc.page.height;
        const ML = 28;
        const CW = PW - ML * 2;
        let Y = 0;

        // ─── CABECERA ───────────────────────────────────────────
        doc.rect(0, 0, PW, 72).fill(C.azul);
        doc.rect(0, 68, PW, 4).fill(C.rojo);

        // Círculo logo
        doc.circle(ML + 28, 36, 24).fill('rgba(255,255,255,0.15)');
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(14).text('GD', ML + 17, 29);

        // Nombre jardín
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(8).text('Jardín Infantil', ML + 62, 12);
        doc.font('Helvetica-Bold').fontSize(20).text('GARDNER', ML + 62, 20);
        doc.font('Helvetica').fontSize(7.5).fillColor('rgba(255,255,255,0.70)')
           .text('Educación Integral desde sus primeros pasos', ML + 62, 46);

        // Bloque derecho
        const bx = PW * 0.58;
        const bw = PW - bx - ML;
        doc.rect(bx, 10, bw, 52).roundedRect(bx, 10, bw, 52, 5).fill('rgba(255,255,255,0.12)');
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(12)
           .text('INFORME EVALUATIVO', bx, 22, { width: bw, align: 'center' });
        doc.font('Helvetica').fontSize(8.5).fillColor('rgba(255,255,255,0.75)')
           .text(`Período ${data.periodo}   ·   Año ${data.anio}`, bx, 42, { width: bw, align: 'center' });

        Y = 82;

        // ─── DATOS ESTUDIANTE ────────────────────────────────────
        doc.rect(ML, Y, CW, 44).roundedRect(ML, Y, CW, 44, 5).fill(C.grisClaro);
        doc.rect(ML, Y, CW, 44).roundedRect(ML, Y, CW, 44, 5).stroke(C.grisMedio);

        const nombreCompleto = `${data.estudiante.nombre} ${data.estudiante.primerApellido} ${data.estudiante.segundoApellido || ''}`.trim();
        const campos = [
          { l: 'ESTUDIANTE',  v: nombreCompleto,          x: ML + 10,        w: CW * 0.38 },
          { l: 'GRADO',       v: data.curso.nombre,       x: ML + CW * 0.41, w: CW * 0.18 },
          { l: 'CÓDIGO',      v: data.estudiante.cedula,  x: ML + CW * 0.61, w: CW * 0.18 },
          { l: 'DIRECTOR(A)', v: data.director,           x: ML + CW * 0.81, w: CW * 0.18 },
        ];
        campos.forEach((c, i) => {
          if (i > 0) doc.moveTo(ML + CW * [0, 0.41, 0.61, 0.81][i] - 2, Y + 7)
                        .lineTo(ML + CW * [0, 0.41, 0.61, 0.81][i] - 2, Y + 37).stroke(C.grisMedio);
          doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#64748b').text(c.l, c.x, Y + 8, { width: c.w });
          doc.font('Helvetica-Bold').fontSize(9).fillColor(C.negro).text(c.v, c.x, Y + 20, { width: c.w, lineBreak: false });
        });

        Y += 54;

        // ─── MATERIAS ────────────────────────────────────────────
        for (const mat of data.calificaciones) {
          const encH = 40;
          doc.rect(ML, Y, CW, encH).fill(C.rojo);

          // Nombre + docente
          doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(11)
             .text(mat.asignaturaNombre, ML + 10, Y + 6, { width: CW * 0.50 });
          doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.70)')
             .text(`Docente: ${mat.docenteNombre}`, ML + 10, Y + 22, { width: CW * 0.50 });

          // Columnas: Valoración | Nota | Faltas
          const cols = [
            { label: 'VALORACIÓN', val: mat.valoracion, x: ML + CW * 0.52, w: CW * 0.18 },
            { label: 'NOTA',       val: mat.nota.toFixed(1), x: ML + CW * 0.71, w: CW * 0.14 },
            { label: 'FALTAS',     val: String(mat.faltas), x: ML + CW * 0.86, w: CW * 0.13 },
          ];
          cols.forEach(col => {
            doc.font('Helvetica-Bold').fontSize(8).fillColor(C.blanco)
               .text(col.label, col.x, Y + 6, { width: col.w, align: 'center' });
            doc.font('Helvetica-Bold').fontSize(col.label === 'VALORACIÓN' ? 10 : 14).fillColor(C.blanco)
               .text(col.val, col.x, Y + (col.label === 'VALORACIÓN' ? 20 : 17), { width: col.w, align: 'center' });
          });

          Y += encH;

          // Banner indicadores
          doc.rect(ML, Y, CW, 17).fill(C.azulClaro);
          doc.font('Helvetica-Bold').fontSize(8).fillColor(C.azulOscuro)
             .text('INDICADORES DE DESEMPEÑO', ML, Y + 4, { width: CW, align: 'center' });
          Y += 17;

          // Filas SABER / HACER / SER — siempre se muestran
          const indData = mat.indicadores ?? { saber: [], hacer: [], ser: [] };
          const tiposConfig = [
            { tipo: 'SABER', items: indData.saber.length ? indData.saber : ['Sin indicadores registrados'], color: C.saberColor },
            { tipo: 'HACER', items: indData.hacer.length ? indData.hacer : ['Sin indicadores registrados'], color: C.hacerColor },
            { tipo: 'SER',   items: indData.ser.length   ? indData.ser   : ['Sin indicadores registrados'], color: C.serColor   },
          ];
          const tipoW = 42;
          const txtW  = CW - tipoW;

          for (const { tipo, items, color } of tiposConfig) {
            const lineas = items.length;
            const rowH = Math.max(26, lineas * 13 + 8);

            doc.rect(ML, Y, tipoW, rowH).fill(color);
            doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(8)
               .text(tipo, ML, Y + rowH / 2 - 5, { width: tipoW, align: 'center' });

            doc.rect(ML + tipoW, Y, txtW, rowH).fill(C.blanco);
            doc.rect(ML + tipoW, Y, txtW, rowH).stroke(C.grisMedio);
            doc.rect(ML, Y, tipoW, rowH).stroke(color);

            const txt = items.map(i => `• ${i}`).join('\n');
            doc.fillColor(C.negro).font('Helvetica').fontSize(8)
               .text(txt, ML + tipoW + 8, Y + 7, { width: txtW - 14 });

            Y += rowH;
          }

          // Comportamiento del estudiante
          if (mat.comportamiento) {
            const colMap: Record<string, string> = {
              'Excelente': C.verde, 'Bueno': C.azul,
              'Regular': C.amarillo, 'Deficiente': C.rojo,
            };
            const compColor = colMap[mat.comportamiento.nivel] ?? '#64748b';
            const compH = 22;
            doc.rect(ML, Y, CW, compH).fill('#f8fafc');
            doc.rect(ML, Y, CW, compH).stroke(C.grisMedio);
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(compColor)
               .text('COMPORTAMIENTO:', ML + 8, Y + 7);
            doc.font('Helvetica-Bold').fontSize(9).fillColor(compColor)
               .text(mat.comportamiento.nivel, ML + 110, Y + 6);
            if (mat.comportamiento.descripcion) {
              doc.font('Helvetica').fontSize(7.5).fillColor(C.negro)
                 .text(mat.comportamiento.descripcion, ML + 195, Y + 7,
                   { width: CW - 205, lineBreak: false });
            }
            Y += compH;
          }

          // Observación materia
          if (mat.observacion) {
            doc.rect(ML, Y, CW, 20).fill('#fffbeb');
            doc.rect(ML, Y, CW, 20).stroke(C.grisMedio);
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.amarillo).text('Obs: ', ML + 8, Y + 6);
            doc.font('Helvetica').fontSize(7.5).fillColor(C.negro)
               .text(mat.observacion, ML + 32, Y + 6, { width: CW - 42, lineBreak: false });
            Y += 20;
          }

          Y += 8;

          if (Y > PH - 120) {
            doc.addPage();
            Y = 20;
          }
        }

        // ─── RESUMEN ASISTENCIA + OBS GENERAL ───────────────────
        const resH = 54;
        doc.rect(ML, Y, CW, resH).roundedRect(ML, Y, CW, resH, 5).fill(C.grisClaro);
        doc.rect(ML, Y, CW, resH).roundedRect(ML, Y, CW, resH, 5).stroke(C.grisMedio);

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#64748b').text('FALTAS JUSTIFICADAS', ML + 10, Y + 8);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(C.negro).text(String(data.faltasJustificadas ?? 0), ML + 10, Y + 20);

        doc.moveTo(ML + CW * 0.19, Y + 8).lineTo(ML + CW * 0.19, Y + resH - 8).stroke(C.grisMedio);

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#64748b').text('FALTAS INJUSTIFICADAS', ML + CW * 0.21, Y + 8);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(C.rojo).text(String(data.faltasInjustificadas ?? 0), ML + CW * 0.21, Y + 20);

        doc.moveTo(ML + CW * 0.41, Y + 8).lineTo(ML + CW * 0.41, Y + resH - 8).stroke(C.grisMedio);

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#64748b').text('OBSERVACIONES GENERALES', ML + CW * 0.43, Y + 8);
        doc.font('Helvetica').fontSize(8.5).fillColor(C.negro)
           .text(data.observacionGeneral || 'Sin observaciones adicionales.', ML + CW * 0.43, Y + 20, { width: CW * 0.55 });

        Y += resH + 16;

        // ─── FIRMAS ─────────────────────────────────────────────
        const firmas = ['Director(a) de Grupo', 'Coordinador(a)', 'Acudiente / Padre de Familia'];
        firmas.forEach((nombre, i) => {
          const fw = CW / 3;
          const fx = ML + i * fw + fw * 0.1;
          const lw = fw * 0.8;
          doc.moveTo(fx, Y + 28).lineTo(fx + lw, Y + 28).stroke('#cbd5e1');
          doc.font('Helvetica').fontSize(8).fillColor('#64748b')
             .text(nombre, ML + i * fw, Y + 32, { width: fw, align: 'center' });
        });

        // ─── PIE DE PÁGINA ───────────────────────────────────────
        doc.rect(0, PH - 22, PW, 22).fill(C.azul);
        doc.rect(0, PH - 25, PW, 3).fill(C.rojo);
        doc.font('Helvetica').fontSize(7.5).fillColor('rgba(255,255,255,0.65)')
           .text(
             `Jardín Infantil Gardner  ·  Informe Evaluativo Período ${data.periodo}  ·  ${data.anio}  ·  Sistema LEARNSCAPE`,
             0, PH - 15, { width: PW, align: 'center' }
           );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Retrocompatibilidad con llamadas anteriores
  async generateBoletinPDF(boletin: any, estudiante: any, curso: any, calificaciones: any[]): Promise<Buffer> {
    const data: BoletinData = {
      estudiante: {
        nombre: estudiante.nombre,
        primerApellido: estudiante.primerApellido,
        segundoApellido: estudiante.segundoApellido,
        cedula: estudiante.cedula,
      },
      curso: { nombre: curso.nombre },
      director: curso.profesorNombre || 'Docente',
      periodo: boletin.periodo,
      anio: new Date().getFullYear().toString(),
      observacionGeneral: boletin.observaciones,
      calificaciones: calificaciones.map((cal: any) => ({
        asignaturaId: cal.asignaturaId,
        asignaturaNombre: cal.asignaturaNombre || cal.asignaturaId,
        docenteNombre: 'Docente',
        valoracion: cal.nota >= 4.5 ? 'Superior' : cal.nota >= 4.0 ? 'Alto' : cal.nota >= 3.0 ? 'Básico' : 'Bajo',
        nota: cal.nota,
        faltas: 0,
        observacion: cal.observaciones,
      })),
    };
    return this.generateBoletinGardner(data);
  }
}

export const pdfService = new PDFService();