import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { resolve } from 'path';

// ─── Paleta de colores ───────────────────────────────────────────────────────
const C = {
  rojo:          '#dc2626',
  rojoOscuro:    '#b91c1c',
  azul:          '#1a56db',
  azulOscuro:    '#1e3a8a',
  azulMedio:     '#2563eb',
  azulClaro:     '#bfdbfe',
  cianClaro:     '#38bdf8',
  amarillo:      '#f59e0b',
  amarilloClaro: '#fef3c7',
  verde:         '#22c55e',
  verdeOscuro:   '#15803d',
  tinta:         '#1e293b',
  tintaSuave:    '#475569',
  gris:          '#cbd5e1',
  grisClaro:     '#f1f5f9',
  blanco:        '#ffffff',
  negro:         '#000000',
};

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface CalificacionBoletinData {
  asignaturaId: string;
  asignaturaNombre: string;
  docenteNombre: string;
  valoracion: string;
  nota: number;
  resumenNotas?: string;
  faltas: number;
  observacion?: string;
  indicadores?: { saber: string[]; hacer: string[]; ser: string[] };
  comportamiento?: { nota?: number; nivel: string; descripcion?: string };
}

export interface BoletinData {
  estudiante: {
    nombre: string;
    primerApellido: string;
    segundoApellido?: string;
    cedula: string;
  };
  curso: { nombre: string };
  director: string;
  periodo: string;
  anio: string;
  calificaciones: CalificacionBoletinData[];
  observacionGeneral?: string;
  faltasJustificadas?: number;
  faltasInjustificadas?: number;
  puestoCurso?: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizarTexto(valor: string): string {
  return (valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const CURSOS_PREESCOLAR = ['parvulos', 'parvulo', 'pre jardin', 'prejardin', 'jardin', 'transicion'];
const CURSOS_PRIMARIA   = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto'];

function esCursoPreescolar(nombreCurso: string): boolean {
  const c = normalizarTexto(nombreCurso);
  return CURSOS_PREESCOLAR.some((k) => c.includes(k));
}

function obtenerRutaBanner(): string | null {
  const candidatos = [
    resolve(process.cwd(), '../frondend/src/app/assets/institution/pdf_image_2.jpg'),
    resolve(process.cwd(), 'frondend/src/app/assets/institution/pdf_image_2.jpg'),
    resolve(process.cwd(), '../frondend/src/app/assets/institution/pdf_image_1.jpg'),
    resolve(process.cwd(), 'frondend/src/app/assets/institution/pdf_image_1.jpg'),
  ];
  for (const ruta of candidatos) {
    if (existsSync(ruta)) return ruta;
  }
  return null;
}

function nombreCompleto(e: BoletinData['estudiante']): string {
  return `${e.nombre} ${e.primerApellido} ${e.segundoApellido || ''}`.trim();
}

function textoPeriodo(data: BoletinData): string {
  return `Periodo ${data.periodo} - ${data.anio}`;
}

function numeroPeriodo(periodo: string): number {
  const n = parseInt(periodo, 10);
  if (!isNaN(n) && n >= 1 && n <= 3) return n;
  const m = String(periodo).match(/([123])\D*$/);
  return m ? Number(m[1]) : 1;
}

function extraerNotas(resumen: string | undefined, notaActual: number) {
  const t = resumen || '';
  const leer = (label: string) => {
    const m = t.match(new RegExp(`${label}:\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i'));
    return m ? m[1] : '-';
  };
  const promedio =
    leer('Promedio') !== '-' ? leer('Promedio') :
    leer('Nota final') !== '-' ? leer('Nota final') :
    Number(notaActual || 0).toFixed(2);
  return { p1: leer('P1'), p2: leer('P2'), p3: leer('P3'), promedio };
}

function promedioSimple(vals: number[]): number | null {
  const nums = vals.filter(Number.isFinite);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function notaComportamiento(comp?: { nota?: number; nivel: string }): number | null {
  if (typeof comp?.nota === 'number' && Number.isFinite(comp.nota)) return comp.nota;
  if (!comp?.nivel) return null;
  const m: Record<string, number> = { Superior: 5, Alto: 4, Basico: 3, Bajo: 2 };
  return m[comp.nivel] ?? null;
}

function labelPeriodo(n: number): string {
  return n === 1 ? 'Primer periodo' : n === 2 ? 'Segundo periodo' : 'Tercer periodo';
}

function itemsArr(items: string[] | undefined, fallback: string): string[] {
  return items && items.length ? items : [fallback];
}

// ─── Clase principal ──────────────────────────────────────────────────────────
export class PDFService {
  private readonly bannerPath = obtenerRutaBanner();

  // ── Crear buffer ────────────────────────────────────────────────────────────
  private crearBuffer(
    render: (doc: PDFKit.PDFDocument) => void,
    options: PDFKit.PDFDocumentOptions = { margin: 0, size: 'A4' },
  ): Promise<Buffer> {
    return new Promise((res, rej) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument(options);
        doc.on('data', (c: Buffer) => chunks.push(c));
        doc.on('end', () => res(Buffer.concat(chunks)));
        doc.on('error', rej);
        render(doc);
        doc.end();
      } catch (e) { rej(e); }
    });
  }

  // ── Banner superior (imagen o fallback) ─────────────────────────────────────
  private dibujarBanner(doc: PDFKit.PDFDocument, x: number, y: number, w: number): number {
    const h = 90;
    if (this.bannerPath) {
      try {
        doc.image(this.bannerPath, x, y, { width: w, height: h });
        // Línea roja decorativa bajo el banner
        doc.rect(x, y + h, w, 4).fill(C.rojo);
        return y + h + 4;
      } catch { /* fallback */ }
    }
    // ── Fallback visual fiel al diseño ──
    // Fondo blanco con borde fino
    doc.rect(x, y, w, h).fill(C.blanco).stroke(C.gris);
    // Logo circular izquierda
    const logoX = x + 16;
    const logoY = y + 8;
    const logoR = 36;
    doc.circle(logoX + logoR, logoY + logoR, logoR).fill(C.azulOscuro);
    doc.circle(logoX + logoR, logoY + logoR, logoR - 3).fill(C.blanco);
    doc.circle(logoX + logoR, logoY + logoR, logoR - 8).fill(C.azulOscuro);
    doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9)
       .text('JARDIN', logoX, logoY + logoR - 10, { width: logoR * 2, align: 'center' });
    doc.fillColor(C.blanco).font('Helvetica').fontSize(7)
       .text('INFANTIL', logoX, logoY + logoR + 1, { width: logoR * 2, align: 'center' });
    // Texto "Jardín Infantil" pequeño
    const txtX = logoX + logoR * 2 + 14;
    doc.fillColor(C.azulOscuro).font('Helvetica-Bold').fontSize(11)
       .text('Jardin Infantil', txtX, y + 14);
    // GARDNER grande con color
    doc.fillColor(C.amarillo).font('Helvetica-Bold').fontSize(42)
       .text('GARDNER', txtX - 2, y + 26);
    // Subtítulo
    doc.fillColor(C.azulOscuro).font('Helvetica').fontSize(9)
       .text('Educacion Integral desde sus primeros pasos', txtX, y + 70);
    // Línea roja decorativa
    doc.rect(x, y + h, w, 4).fill(C.rojo);
    return y + h + 4;
  }

  // ── Pie de página ───────────────────────────────────────────────────────────
  private dibujarPie(doc: PDFKit.PDFDocument, data: BoletinData, label: string): void {
    const pw = doc.page.width;
    const ph = doc.page.height;
    doc.rect(0, ph - 22, pw, 22).fill(C.azulOscuro);
    doc.fillColor(C.azulClaro).font('Helvetica').fontSize(7)
       .text(
         `Jardin Infantil Gardner | ${label} | ${textoPeriodo(data)} | Sistema Learnscape`,
         0, ph - 13, { width: pw, align: 'center' },
       );
  }

  // ── Tabla de datos del estudiante (amarilla) ────────────────────────────────
  private dibujarTablaEstudiante(
    doc: PDFKit.PDFDocument,
    data: BoletinData,
    x: number, y: number, w: number,
    _conPeriodo = false,
  ): number {
    // Tabla fiel a la imagen: dos filas en columna izquierda, Codigo en derecha
    // Fila 1 izq: "Estudiante:" en negrita (label) + nombre a la derecha del label
    // Fila 2 izq: "Grado:" en negrita + valor
    // Columna derecha: "Codigo:" en negrita + valor
    const col1 = w * 0.68;
    const col2 = w - col1;
    const h    = 40;

    doc.lineWidth(1);
    doc.rect(x, y, w, h).fill(C.amarilloClaro).stroke(C.amarillo);
    // Divisor vertical entre col izq y col derecha
    doc.moveTo(x + col1, y + 2).lineTo(x + col1, y + h - 2)
       .lineWidth(0.7).stroke(C.amarillo);

    // Fila 1 izquierda: "Estudiante:" bold + nombre bold
    doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.5)
       .text('Estudiante:', x + 8, y + 7);
    doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(9)
       .text(nombreCompleto(data.estudiante), x + 72, y + 6, { width: col1 - 80 });

    // Fila 2 izquierda: "Grado:" bold + valor
    doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.5)
       .text('Grado: ', x + 8, y + 22, { continued: true });
    doc.font('Helvetica').fontSize(9)
       .text(data.curso.nombre, { width: col1 - 70 });

    // Columna derecha: "Codigo:" bold centrado + valor
    doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.5)
       .text('Codigo:', x + col1 + 8, y + 7, { width: col2 - 16 });
    doc.font('Helvetica').fontSize(9)
       .text(data.estudiante.cedula, x + col1 + 8, y + 20, { width: col2 - 16 });

    return y + h + 10;
  }

  // ── Firmas ──────────────────────────────────────────────────────────────────
  private dibujarFirmas(
    doc: PDFKit.PDFDocument,
    ml: number, cw: number, y: number,
    etiquetas: string[],
  ): void {
    const fw = cw / etiquetas.length;
    etiquetas.forEach((label, i) => {
      const fx = ml + i * fw;
      const lineX1 = fx + fw * 0.1;
      const lineX2 = fx + fw * 0.9;
      doc.moveTo(lineX1, y + 28).lineTo(lineX2, y + 28)
         .lineWidth(0.8).stroke(C.tintaSuave);
      doc.fillColor(C.tintaSuave).font('Helvetica').fontSize(8)
         .text(label, fx, y + 32, { width: fw, align: 'center' });
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CARTA INFORMATIVA — PREESCOLAR
  // ════════════════════════════════════════════════════════════════════════════
  private renderCartaPreescolar(data: BoletinData): Promise<Buffer> {
    return this.crearBuffer((doc) => {
      const pw  = doc.page.width;
      const ml  = 30;
      const mr  = 30;
      const cw  = pw - ml - mr;
      const sX  = ml;          // section X
      const sW  = cw;          // section width
      const pNum = numeroPeriodo(data.periodo);
      const footerLabel = 'Carta Informativa Preescolar';

      // ── Función para dibujar estructura base de página ──────────────────────
      const paginaBase = (esFirst: boolean): number => {
        let y = 14;
        y = this.dibujarBanner(doc, ml, y, cw) + 8;

        // Título rojo
        doc.lineWidth(1);
        doc.rect(sX, y, sW, 22).fill(C.rojo);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(13)
           .text('CARTA INFORMATIVA', sX, y + 6, { width: sW, align: 'center' });
        y += 28;

        y = this.dibujarTablaEstudiante(doc, data, sX, y, sW, true);

        if (esFirst) {
          // Texto introductorio
          const saludo = 'Estimadas familias:';
          doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(12)
             .text(saludo, sX, y);
          y += 20;

          const intro =
            `Reciban un cordial saludo. Durante este ${textoPeriodo(data).toLowerCase()} hemos acompanado a ` +
            `${nombreCompleto(data.estudiante)} en un proceso lleno de descubrimientos, juegos y aprendizajes significativos. ` +
            `A continuacion, queremos compartir algunos de los avances observados, teniendo en cuenta las diferentes ` +
            `formas en que los ninos aprenden:`;

          doc.fillColor(C.tinta).font('Helvetica').fontSize(9)
             .text(intro, sX, y, { width: sW, align: 'justify' });
          y += doc.heightOfString(intro, { width: sW }) + 14;
        }
        return y;
      };

      let y = paginaBase(true);

      // ── Bloques de materias ──────────────────────────────────────────────────
      for (const mat of data.calificaciones) {
        const saber = itemsArr(mat.indicadores?.saber, 'Sin seguimiento registrado.');
        const hacer = itemsArr(mat.indicadores?.hacer, 'Sin seguimiento registrado.');
        const ser   = itemsArr(mat.indicadores?.ser,   'Sin seguimiento registrado.');

        // Resumen de desempeño (primer ítem de saber con viñeta ✓)
        const resumenTexto = saber.map((s) => `\u2713 ${s}`).join('\n');

        // Objetivo: primer ítem de hacer
        const objetivo = hacer[0] || 'Fortalecer el desarrollo integral del estudiante.';

        // Actividades: resto de hacer o fallback
        const actividadesItems = hacer.length > 1
          ? hacer.slice(1)
          : ['Acompanamiento pedagogico en aula.'];

        // Observaciones: ser + observacion + comportamiento
        const compTexto = mat.comportamiento?.descripcion
          ? `${mat.comportamiento.nivel}: ${mat.comportamiento.descripcion}`
          : mat.comportamiento?.nivel || '';
        const obsLines = [
          ...ser.map((s) => `- ${s}`),
          ...(mat.observacion ? [`- ${mat.observacion}`] : []),
          ...(compTexto ? [`- ${compTexto}`] : []),
        ];
        if (!obsLines.length) obsLines.push('- Sin observaciones adicionales.');
        // Calcular alturas
        const resumenH = Math.max(36,
          doc.heightOfString(resumenTexto, { width: sW - 20 }) + 18);

        // Objetivo + Actividades en una sola sección blanca
        const objActTexto =
          `-Objetivo: ${objetivo}\n\nActividades:\n` +
          actividadesItems.map((a) => `- ${a}`).join('\n');
        const objActH = Math.max(56,
          doc.heightOfString(objActTexto, { width: sW - 20 }) + 18);

        // Observaciones: label fijo + texto (fondo blanco liso)
        const obsText = obsLines.join('\n');
        const observacionesH = Math.max(30,
          doc.heightOfString(obsText, { width: sW - 20 }) + 18);

        const bloqueTotalH = 24 + resumenH + objActH + observacionesH + 6;

        if (y + bloqueTotalH > doc.page.height - 60) {
          this.dibujarPie(doc, data, footerLabel);
          doc.addPage();
          y = paginaBase(false);
        }

        const top = y;

        // ── Encabezado de materia (3 celdas) ──────────────────────────────────
        const mW  = 165;
        const dW  = Math.floor((sW - mW) * 0.62);
        const pW  = sW - mW - dW;

        doc.lineWidth(1.2);
        doc.rect(sX, top, mW, 24).fill(C.rojo).stroke(C.azulOscuro);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9.5)
           .text(mat.asignaturaNombre, sX + 6, top + 7, { width: mW - 12, align: 'center' });

        doc.rect(sX + mW, top, dW, 24).fill(C.azulMedio).stroke(C.azulOscuro);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(8.3)
           .text(`Docente: ${mat.docenteNombre}`, sX + mW + 8, top + 7, { width: dW - 16 });

        doc.rect(sX + mW + dW, top, pW, 24).fill(C.amarillo).stroke(C.azulOscuro);
        doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.5)
           .text(labelPeriodo(pNum), sX + mW + dW, top + 7, { width: pW, align: 'center' });

        let bY = top + 24;

        // ── Resumen de desempeño — fondo azul brillante, texto blanco negrita (fiel imagen) ─
        doc.rect(sX, bY, sW, resumenH).fill('#1d6fce').stroke(C.azulOscuro);
        // Texto con ✓ en blanco negrita, lineHeight más apretado como en la imagen
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9)
           .text(resumenTexto, sX + 8, bY + 8, { width: sW - 16, lineGap: 1 });
        bY += resumenH;

        // ── Objetivo + Actividades — sección blanca unificada (fiel imagen) ──────
        doc.rect(sX, bY, sW, objActH).fill(C.blanco).stroke(C.azulOscuro);
        let tyOA = bY + 7;
        // "-Objetivo:" bold inline + texto normal
        doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(9)
           .text('-Objetivo: ', sX + 8, tyOA, { continued: true });
        doc.font('Helvetica').fontSize(9)
           .text(objetivo, { width: sW - 80 });
        tyOA += doc.heightOfString(`-Objetivo: ${objetivo}`, { width: sW - 16 }) + 4;
        // "Actividades:" bold
        doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(9)
           .text('Actividades:', sX + 8, tyOA);
        tyOA += 14;
        // ítems con "- " normal
        doc.font('Helvetica').fontSize(9)
           .text(actividadesItems.map((a) => `- ${a}`).join('\n'),
             sX + 8, tyOA, { width: sW - 16 });
        bY += objActH;

        // ── Observaciones — borde gris fino, solo label bold (fiel imagen) ───────
        doc.rect(sX, bY, sW, observacionesH).fill(C.blanco).stroke(C.gris);
        doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(9)
           .text('Observaciones:', sX + 8, bY + 7);
        // Texto de observaciones si existe
        if (obsText.replace(/- \n?/g, '').trim()) {
          doc.font('Helvetica').fontSize(8.5)
             .text(obsText, sX + 8, bY + 20, { width: sW - 16 });
        }

        // Borde exterior del bloque completo
        doc.lineWidth(1.4);
        doc.rect(sX - 1, top - 1, sW + 2, bloqueTotalH + 2).stroke(C.azulOscuro);

        y = top + bloqueTotalH + 14;
      }

      // ── Firmas ─────────────────────────────────────────────────────────────
      if (y + 55 > doc.page.height - 60) {
        this.dibujarPie(doc, data, footerLabel);
        doc.addPage();
        y = 30;
      }
      y += 6;
      this.dibujarFirmas(doc, ml, cw, y, ['Docente titular', 'Coordinacion', 'Acudiente']);
      this.dibujarPie(doc, data, footerLabel);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INFORME EVALUATIVO — PRIMARIA / BACHILLERATO
  // ════════════════════════════════════════════════════════════════════════════
  private renderInformeEvaluativo(data: BoletinData): Promise<Buffer> {
    return this.crearBuffer((doc) => {
      const pw   = doc.page.width;
      const ml   = 30;
      const mr   = 30;
      const cw   = pw - ml - mr;
      const sX   = ml;
      const sW   = cw;
      const pNum = numeroPeriodo(data.periodo);
      const footerLabel = 'Informe Evaluativo';

      // ── Estructura base de página ──────────────────────────────────────────
      const paginaBase = (): number => {
        let y = 14;
        y = this.dibujarBanner(doc, ml, y, cw) + 8;

        // Título
        doc.lineWidth(1);
        doc.rect(sX, y, sW, 22).fill(C.rojo);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(13)
           .text('INFORME EVALUATIVO', sX, y + 6, { width: sW, align: 'center' });
        y += 28;

        y = this.dibujarTablaEstudiante(doc, data, sX, y, sW, false);
        return y;
      };

      let y = paginaBase();

      // ── Bloques de materias ──────────────────────────────────────────────────
      for (const mat of data.calificaciones) {
        const notas  = extraerNotas(mat.resumenNotas, mat.nota);
        const saber  = itemsArr(mat.indicadores?.saber, 'Sin indicadores registrados.');
        const hacer  = itemsArr(mat.indicadores?.hacer, 'Sin indicadores registrados.');
        const ser    = itemsArr(mat.indicadores?.ser,   'Sin indicadores registrados.');

        // Alturas de filas de indicadores
        const bulletH = (items: string[]) => {
          const txt = items.map((s) => `\u2022 ${s}`).join('\n');
          return Math.max(34, doc.heightOfString(txt, { width: sW - 80 }) + 14);
        };
        const saberH  = bulletH(saber);
        const hacerH  = bulletH(hacer);
        const serH    = bulletH(ser);

        // Observacion opcional
        const hasObs = !!mat.observacion;
        const obsH   = hasObs
          ? Math.max(26, doc.heightOfString(mat.observacion!, { width: sW - 80 }) + 12)
          : 0;

        // Altura bloque completo:
        // fila1H(20) + fila2H(18) + encabezado indicadores(20) + saber + hacer + ser + obs + margen
        const bloqueTotalH = 20 + 18 + 20 + saberH + hacerH + serH + obsH + 8;

        if (y + bloqueTotalH > doc.page.height - 60) {
          this.dibujarPie(doc, data, footerLabel);
          doc.addPage();
          y = paginaBase();
        }

        const top = y;

        // ── Fila 1: Nombre asignatura | Docente + Valoración ──────────────────
        // Fila superior: asignatura (rojo) | celda derecha con 2 líneas
        const nomW  = 155;
        const docW  = sW - nomW;
        const fila1H = 20; // "Docente: ..."  y  "Valoración integral"
        const fila2H = 18; // columnas de notas (labels + valores comprimidos)

        doc.lineWidth(1.2);
        // Celda asignatura — abarca 2 filas de alto
        doc.rect(sX, top, nomW, fila1H + fila2H).fill(C.rojo).stroke(C.azulOscuro);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9.5)
           .text(mat.asignaturaNombre, sX + 6, top + (fila1H + fila2H) / 2 - 6,
             { width: nomW - 12, align: 'center' });

        // Celda docente (fila 1 derecha)
        doc.rect(sX + nomW, top, docW, fila1H).fill(C.blanco).stroke(C.azulOscuro);
        doc.fillColor(C.tinta).font('Helvetica').fontSize(8.5)
           .text(`Docente: ${mat.docenteNombre}`, sX + nomW + 8, top + 4, { width: docW - 16 });

        // Fila 2: columnas de notas — solo periodos acumulados + faltas + promedio
        const gradeY = top + fila1H;
        const gradeH = fila2H;

        type Col = { label: string; value: string; w: number };

        // Columnas de periodos: solo los transcurridos hasta pNum
        const periodosCols: Col[] = [
          { label: 'I Periodo',  value: notas.p1, w: 72 },
          ...(pNum >= 2 ? [{ label: 'II Periodo',  value: notas.p2, w: 72 } as Col] : []),
          ...(pNum >= 3 ? [{ label: 'III Periodo', value: notas.p3, w: 72 } as Col] : []),
        ];

        const faltasW   = 58;
        const periW     = periodosCols.reduce((a, c) => a + c.w, 0);
        const promedioW = docW - periW - faltasW;

        const finalCols: Col[] = [
          ...periodosCols,
          { label: 'No. Faltas',       value: String(mat.faltas ?? 0), w: faltasW },
          { label: 'Promedio general', value: notas.promedio,           w: promedioW },
        ];

        // Línea separadora entre fila docente y fila columnas (dentro de la celda derecha)
        doc.moveTo(sX + nomW, gradeY).lineTo(sX + sW, gradeY)
           .lineWidth(0.6).stroke(C.azulOscuro);

        let cx = sX + nomW;
        finalCols.forEach((col, idx) => {
          const isPromedio = idx === finalCols.length - 1;
          // Solo dibujar fondo y borde de cada celda de la fila 2
          doc.rect(cx, gradeY, col.w, gradeH)
             .fill(isPromedio ? '#dbeafe' : C.blanco)
             .stroke(C.azulOscuro);
          doc.fillColor(C.azulOscuro).font('Helvetica-Bold').fontSize(6.2)
             .text(col.label, cx + 1, gradeY + 2, { width: col.w - 2, align: 'center' });
          if (col.value) {
            doc.fillColor(C.tinta).font('Helvetica-Bold')
               .fontSize(isPromedio ? 9 : 8)
               .text(col.value, cx, gradeY + 9, { width: col.w, align: 'center' });
          }
          cx += col.w;
        });

        // ── Fila 3: Encabezado "INDICADORES DE DESEMPEÑO" ────────────────────
        const indHeaderY = gradeY + gradeH;
        doc.rect(sX, indHeaderY, sW, 20).fill(C.cianClaro).stroke(C.azulOscuro);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9)
           .text('INDICADORES DE DESEMPENO', sX, indHeaderY + 6, { width: sW, align: 'center' });

        let iY = indHeaderY + 20;

        // ── Filas SABER / HACER / SER ─────────────────────────────────────────
        const dibujarFila = (
          etiqueta: string,
          items: string[],
          fondo: string,
          fondoTexto: string,
          alto: number,
        ) => {
          const etW = 64;
          const txW = sW - etW;
          const txt = items.map((s) => `\u2022 ${s}`).join('\n');

          doc.rect(sX, iY, etW, alto).fill(fondo).stroke(C.azulOscuro);
          doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9)
             .text(etiqueta, sX, iY + alto / 2 - 6, { width: etW, align: 'center' });

          doc.rect(sX + etW, iY, txW, alto).fill(fondoTexto).stroke(C.azulOscuro);
          doc.fillColor(C.tinta).font('Helvetica').fontSize(8.2)
             .text(txt, sX + etW + 8, iY + 7, { width: txW - 16 });

          iY += alto;
        };

        dibujarFila('SABER', saber, C.cianClaro, C.blanco, saberH);
        dibujarFila('HACER', hacer, C.amarillo,  C.blanco, hacerH);
        dibujarFila('SER',   ser,   C.verde,     C.blanco, serH);

        // ── Observación (opcional) ────────────────────────────────────────────
        if (hasObs) {
          doc.rect(sX, iY, sW, obsH).fill(C.blanco).stroke(C.azulOscuro);
          doc.fillColor(C.tintaSuave).font('Helvetica-Bold').fontSize(8)
             .text('Observacion:', sX + 10, iY + 8);
          doc.fillColor(C.tinta).font('Helvetica').fontSize(8)
             .text(mat.observacion!, sX + 88, iY + 7, { width: sW - 98 });
          iY += obsH;
        }

        // Borde exterior bloque
        doc.lineWidth(1.6);
        doc.rect(sX - 1, top - 1, sW + 2, iY - top + 2).stroke(C.azulOscuro);

        y = iY + 14;
      }

      // ── Resumen general ─────────────────────────────────────────────────────
      const notasMats = data.calificaciones.map((m) => Number(m.nota)).filter(Number.isFinite);
      const promMats  = promedioSimple(notasMats);
      const notasComp = data.calificaciones
        .map((m) => notaComportamiento(m.comportamiento))
        .filter((n): n is number => n !== null);
      const promComp  = promedioSimple(notasComp);

      const labelProm =
        pNum === 1 ? 'Promedio general I periodo:' :
        pNum === 2 ? 'Promedio general II periodo:' :
                    'Promedio general III periodo:';

      if (y + 92 > doc.page.height - 60) {
        this.dibujarPie(doc, data, footerLabel);
        doc.addPage();
        y = paginaBase();
      }

      const resX  = sX;
      const resW  = sW;
      const lbW   = 190;
      const valW  = resW - lbW;
      const rowH  = 28;

      const filaResumen = (label: string, valor: string, yR: number) => {
        doc.lineWidth(1);
        doc.rect(resX, yR, lbW, rowH).fill(C.rojo).stroke(C.negro);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9)
           .text(label, resX + 8, yR + 8, { width: lbW - 16, align: 'center' });
        doc.rect(resX + lbW, yR, valW, rowH).fill(C.blanco).stroke(C.negro);
        doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(11)
           .text(valor, resX + lbW, yR + 7, { width: valW, align: 'center' });
      };

      filaResumen('Promedio comportamiento:', promComp !== null ? promComp.toFixed(2) : '-', y);
      y += rowH;
      filaResumen(labelProm, promMats !== null ? promMats.toFixed(2) : '-', y);
      y += rowH;
      filaResumen('Puesto en el curso:', data.puestoCurso ? `${data.puestoCurso}` : '-', y);
      y += rowH + 20;

      // ── Firmas ─────────────────────────────────────────────────────────────
      if (y + 55 > doc.page.height - 60) {
        this.dibujarPie(doc, data, footerLabel);
        doc.addPage();
        y = 30;
      }
      this.dibujarFirmas(doc, ml, cw, y, ['Docente(a)', 'Coordinacion', 'Acudiente']);
      this.dibujarPie(doc, data, footerLabel);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ════════════════════════════════════════════════════════════════════════════
  async generateBoletinGardner(data: BoletinData): Promise<Buffer> {
    if (esCursoPreescolar(data.curso.nombre)) {
      return this.renderCartaPreescolar(data);
    }
    return this.renderInformeEvaluativo(data);
  }

  async generateBoletinPDF(
    boletin: any,
    estudiante: any,
    curso: any,
    calificaciones: any[],
  ): Promise<Buffer> {
    const data: BoletinData = {
      estudiante: {
        nombre:          estudiante.nombre,
        primerApellido:  estudiante.primerApellido,
        segundoApellido: estudiante.segundoApellido,
        cedula:          estudiante.cedula,
      },
      curso:    { nombre: curso.nombre },
      director: curso.profesorNombre || 'Docente',
      periodo:  boletin.periodo,
      anio:     new Date().getFullYear().toString(),
      observacionGeneral: boletin.observaciones,
      calificaciones: calificaciones.map((cal: any) => ({
        asignaturaId:    cal.asignaturaId,
        asignaturaNombre: cal.asignaturaNombre || cal.asignaturaId,
        docenteNombre:   cal.docenteNombre || 'Docente',
        valoracion:
          cal.nota >= 4.5 ? 'Superior' :
          cal.nota >= 4.0 ? 'Alto'     :
          cal.nota >= 3.0 ? 'Basico'   : 'Bajo',
        nota:        cal.nota,
        resumenNotas: cal.resumenNotas,
        faltas:      cal.faltas ?? 0,
        observacion: cal.observaciones,
        indicadores: cal.indicadores,
        comportamiento: cal.comportamiento,
      })),
      faltasJustificadas:   boletin.faltasJustificadas,
      faltasInjustificadas: boletin.faltasInjustificadas,
      puestoCurso:          boletin.puestoCurso,
    };
    return this.generateBoletinGardner(data);
  }
}

export const pdfService = new PDFService();