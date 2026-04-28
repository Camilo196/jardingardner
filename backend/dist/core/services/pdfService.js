import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { resolve } from 'path';
const C = {
    azul: '#1a56db',
    azulOscuro: '#0f3ea8',
    azulClaro: '#dbeafe',
    rojo: '#dc2626',
    rojoClaro: '#fee2e2',
    verde: '#15803d',
    verdeClaro: '#dcfce7',
    amarillo: '#b45309',
    amarilloClaro: '#fef3c7',
    tinta: '#1e293b',
    tintaSuave: '#64748b',
    gris: '#e2e8f0',
    grisClaro: '#f8fafc',
    blanco: '#ffffff',
    lineaBoletin: '#1d4ed8',
    lineaSuave: '#64748b',
    lineaFuerte: '#0f172a',
};
function normalizarTexto(valor) {
    return (valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
const CURSOS_PREESCOLAR = [
    'parvulos',
    'parvulo',
    'pre jardin',
    'prejardin',
    'jardin',
    'transicion',
];
const CURSOS_PRIMARIA = [
    'primero',
    'segundo',
    'tercero',
    'cuarto',
    'quinto',
];
function esCursoPreescolar(nombreCurso) {
    const curso = normalizarTexto(nombreCurso);
    return CURSOS_PREESCOLAR.some((clave) => curso.includes(clave));
}
function esCursoPrimaria(nombreCurso) {
    const curso = normalizarTexto(nombreCurso);
    return CURSOS_PRIMARIA.some((clave) => curso.includes(clave));
}
function obtenerRutaLogo() {
    const candidatos = [
        resolve(process.cwd(), '../frondend/src/app/assets/institution/pdf_image_2.jpg'),
        resolve(process.cwd(), 'frondend/src/app/assets/institution/pdf_image_2.jpg'),
        resolve(process.cwd(), '../frondend/src/app/assets/institution/pdf_image_1.jpg'),
        resolve(process.cwd(), 'frondend/src/app/assets/institution/pdf_image_1.jpg'),
    ];
    for (const ruta of candidatos) {
        if (existsSync(ruta))
            return ruta;
    }
    return null;
}
function obtenerRutaBanner() {
    const candidatos = [
        resolve(process.cwd(), '../frondend/src/app/assets/institution/pdf_image_2.jpg'),
        resolve(process.cwd(), 'frondend/src/app/assets/institution/pdf_image_2.jpg'),
        resolve(process.cwd(), '../frondend/src/app/assets/institution/pdf_image_1.jpg'),
        resolve(process.cwd(), 'frondend/src/app/assets/institution/pdf_image_1.jpg'),
    ];
    for (const ruta of candidatos) {
        if (existsSync(ruta))
            return ruta;
    }
    return null;
}
function nombreCompleto(estudiante) {
    return `${estudiante.nombre} ${estudiante.primerApellido} ${estudiante.segundoApellido || ''}`.trim();
}
function textoPeriodo(data) {
    return `Periodo ${data.periodo} - ${data.anio}`;
}
function partirTexto(items, fallback) {
    return items && items.length ? items : [fallback];
}
function extraerNotasResumen(resumen, notaActual) {
    const texto = resumen || '';
    const leer = (label) => {
        const match = texto.match(new RegExp(`${label}:\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i'));
        return match ? match[1] : '-';
    };
    const promedioFinal = leer('Promedio') !== '-'
        ? leer('Promedio')
        : leer('Nota final') !== '-'
            ? leer('Nota final')
            : Number(notaActual || 0).toFixed(2);
    return {
        p1: leer('P1'),
        p2: leer('P2'),
        p3: leer('P3'),
        promedio: promedioFinal,
    };
}
function numeroPeriodoSeguro(periodo) {
    const directo = parseInt(periodo, 10);
    if (!Number.isNaN(directo) && directo >= 1 && directo <= 3)
        return directo;
    const match = String(periodo).match(/([123])\D*$/);
    return match ? Number(match[1]) : 1;
}
function promedioSimple(valores) {
    const nums = valores.filter((n) => Number.isFinite(n));
    if (!nums.length)
        return null;
    return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}
function notaComportamiento(comp) {
    if (typeof comp?.nota === 'number' && Number.isFinite(comp.nota))
        return comp.nota;
    if (!comp?.nivel)
        return null;
    const mapa = { Superior: 5, Alto: 4, Basico: 3, Bajo: 2 };
    return mapa[comp.nivel] ?? null;
}
export class PDFService {
    logoPath = obtenerRutaLogo();
    bannerPath = obtenerRutaBanner();
    async crearBuffer(render, options = { margin: 0, size: 'A4' }) {
        return new Promise((resolvePromise, rejectPromise) => {
            try {
                const chunks = [];
                const doc = new PDFDocument(options);
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolvePromise(Buffer.concat(chunks)));
                doc.on('error', rejectPromise);
                render(doc);
                doc.end();
            }
            catch (error) {
                rejectPromise(error);
            }
        });
    }
    dibujarLogo(doc, x, y, size) {
        doc.roundedRect(x, y, size, size, 14).fill(C.blanco);
        if (this.logoPath) {
            try {
                doc.image(this.logoPath, x + 4, y + 4, {
                    fit: [size - 8, size - 8],
                    align: 'center',
                    valign: 'center',
                });
                return;
            }
            catch {
                // fallback textual below
            }
        }
        doc.fillColor(C.azul).font('Helvetica-Bold').fontSize(15).text('GD', x, y + size / 2 - 7, {
            width: size,
            align: 'center',
        });
    }
    dibujarBanner(doc, ml, y, width, height) {
        if (this.bannerPath) {
            try {
                doc.image(this.bannerPath, ml, y, {
                    fit: [width, height],
                    align: 'center',
                    valign: 'center',
                });
                return y + height;
            }
            catch {
                // fallback below
            }
        }
        doc.rect(ml, y, width, height).fill(C.blanco).stroke(C.gris);
        this.dibujarLogo(doc, ml + 10, y + 8, 60);
        doc.fillColor(C.azul).font('Helvetica-Bold').fontSize(14).text('Jardin Infantil', ml + 84, y + 16);
        doc.font('Helvetica-Bold').fontSize(34).fillColor('#f59e0b').text('GARDNER', ml + 84, y + 28);
        doc.font('Helvetica-Bold').fontSize(12).fillColor(C.rojo).text('Educacion Integral desde sus primeros pasos', ml + 84, y + 64);
        return y + height;
    }
    dibujarCabecera(doc, titulo, subtitulo, periodo, showInstitution = true) {
        const pw = doc.page.width;
        const ph = doc.page.height;
        const ml = 28;
        const cw = pw - ml * 2;
        doc.rect(0, 0, pw, 86).fill(C.azul);
        doc.rect(0, 80, pw, 6).fill(C.rojo);
        this.dibujarLogo(doc, ml, 16, 52);
        if (showInstitution) {
            doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(8).text('Jardin Infantil', ml + 66, 18);
            doc.font('Helvetica-Bold').fontSize(22).text('GARDNER', ml + 66, 28);
            doc.font('Helvetica').fontSize(8).fillColor('#dbeafe').text(subtitulo, ml + 66, 55);
        }
        const boxX = pw * 0.56;
        const boxW = pw - boxX - ml;
        doc.roundedRect(boxX, 16, boxW, 50, 8).fill('#2b69dd');
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(13).text(titulo, boxX, 26, {
            width: boxW,
            align: 'center',
        });
        doc.font('Helvetica').fontSize(9).fillColor('#dbeafe').text(periodo, boxX, 46, {
            width: boxW,
            align: 'center',
        });
        return { pw, ph, ml, cw, y: 98 };
    }
    dibujarDatosBasicos(doc, data, ml, cw, y) {
        doc.roundedRect(ml, y, cw, 54, 8).fill(C.grisClaro).stroke(C.gris);
        const campos = [
            { label: 'ESTUDIANTE', value: nombreCompleto(data.estudiante), width: 0.42 },
            { label: 'CURSO', value: data.curso.nombre, width: 0.16 },
            { label: 'CODIGO', value: data.estudiante.cedula, width: 0.18 },
            { label: 'DIRECTOR', value: data.director, width: 0.24 },
        ];
        let cursorX = ml;
        for (const campo of campos) {
            const width = cw * campo.width;
            if (cursorX > ml) {
                doc.moveTo(cursorX, y + 10).lineTo(cursorX, y + 44).stroke(C.gris);
            }
            doc.fillColor(C.tintaSuave).font('Helvetica-Bold').fontSize(7).text(campo.label, cursorX + 10, y + 10, {
                width: width - 20,
            });
            doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(9).text(campo.value, cursorX + 10, y + 24, {
                width: width - 20,
            });
            cursorX += width;
        }
        return y + 68;
    }
    dibujarPie(doc, data, label) {
        const pw = doc.page.width;
        const ph = doc.page.height;
        doc.rect(0, ph - 24, pw, 24).fill(C.azul);
        doc.rect(0, ph - 27, pw, 3).fill(C.rojo);
        doc.fillColor('#dbeafe').font('Helvetica').fontSize(7.5).text(`Jardin Infantil Gardner | ${label} | ${textoPeriodo(data)} | Sistema Learnscape`, 0, ph - 15, { width: pw, align: 'center' });
    }
    asegurarEspacio(doc, actualY, minHeight, data, headerTitle, headerSubtitle, footerLabel) {
        if (actualY + minHeight <= doc.page.height - 70)
            return actualY;
        this.dibujarPie(doc, data, footerLabel);
        doc.addPage();
        const layout = this.dibujarCabecera(doc, headerTitle, headerSubtitle, textoPeriodo(data));
        return this.dibujarDatosBasicos(doc, data, layout.ml, layout.cw, layout.y);
    }
    dibujarIndicadores(doc, x, y, width, titulo, items, color, fondo) {
        const texto = items.map((item) => `- ${item}`).join('\n');
        const labelW = 64;
        const textH = Math.max(34, doc.heightOfString(texto, { width: width - labelW - 18, align: 'left' }) + 12);
        doc.lineWidth(1.2);
        doc.rect(x, y, labelW, textH).fill(color).stroke(C.lineaFuerte);
        doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(8).text(titulo, x, y + textH / 2 - 4, {
            width: labelW,
            align: 'center',
        });
        doc.rect(x + labelW, y, width - labelW, textH).fill(fondo).stroke(C.lineaFuerte);
        doc.rect(x, y, width, textH).stroke(C.lineaFuerte);
        doc.fillColor(C.tinta).font('Helvetica').fontSize(8).text(texto, x + labelW + 8, y + 7, {
            width: width - labelW - 16,
        });
        return y + textH;
    }
    renderBoletinAcademico(data) {
        return this.crearBuffer((doc) => {
            doc.lineWidth(1.15);
            const headerTitle = 'INFORME EVALUATIVO';
            const headerSubtitle = 'Formato academico acumulado';
            const footerLabel = 'Boletin Academico';
            const periodoNumero = numeroPeriodoSeguro(data.periodo);
            const pw = doc.page.width;
            const ml = 26;
            const cw = pw - ml * 2;
            let y = 14;
            y = this.dibujarBanner(doc, ml, y, cw, 92) + 12;
            doc.rect(ml + 20, y, cw - 40, 20).fill('#f97316').stroke(C.lineaFuerte);
            doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(13).text(headerTitle, ml + 20, y + 4, {
                width: cw - 40,
                align: 'center',
            });
            y += 26;
            const infoH = 40;
            const leftW = cw * 0.72;
            const rightW = cw - leftW;
            doc.rect(ml + 20, y, leftW, infoH).fill('#fff7d6').stroke(C.lineaFuerte);
            doc.rect(ml + 20 + leftW, y, rightW, infoH).fill('#fff7d6').stroke(C.lineaFuerte);
            doc.moveTo(ml + 20, y + infoH / 2).lineTo(ml + 20 + leftW, y + infoH / 2).stroke(C.lineaFuerte);
            doc.moveTo(ml + 20 + leftW, y).lineTo(ml + 20 + leftW, y + infoH).stroke(C.lineaFuerte);
            doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8).text('Estudiante:', ml + 28, y + 7);
            doc.font('Helvetica').fontSize(8).text(nombreCompleto(data.estudiante), ml + 88, y + 7, { width: leftW - 96 });
            doc.font('Helvetica-Bold').fontSize(8).text('Grado:', ml + 28, y + 22);
            doc.font('Helvetica').fontSize(8).text(data.curso.nombre, ml + 62, y + 22, { width: leftW - 70 });
            doc.font('Helvetica-Bold').fontSize(8).text('Codigo:', ml + 20 + leftW + 8, y + 15);
            doc.font('Helvetica').fontSize(8).text(data.estudiante.cedula, ml + 20 + leftW + 48, y + 15, { width: rightW - 56 });
            y += infoH + 12;
            for (const materia of data.calificaciones) {
                if (y + 235 > doc.page.height - 48) {
                    this.dibujarPie(doc, data, footerLabel);
                    doc.addPage();
                    y = 18;
                    y = this.dibujarBanner(doc, ml, y, cw, 92) + 12;
                    doc.rect(ml + 20, y, cw - 40, 20).fill('#f97316').stroke(C.lineaFuerte);
                    doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(13).text(headerTitle, ml + 20, y + 4, {
                        width: cw - 40,
                        align: 'center',
                    });
                    y += 26;
                    doc.rect(ml + 20, y, leftW, infoH).fill('#fff7d6').stroke(C.lineaFuerte);
                    doc.rect(ml + 20 + leftW, y, rightW, infoH).fill('#fff7d6').stroke(C.lineaFuerte);
                    doc.moveTo(ml + 20, y + infoH / 2).lineTo(ml + 20 + leftW, y + infoH / 2).stroke(C.lineaFuerte);
                    doc.moveTo(ml + 20 + leftW, y).lineTo(ml + 20 + leftW, y + infoH).stroke(C.lineaFuerte);
                    doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8).text('Estudiante:', ml + 28, y + 7);
                    doc.font('Helvetica').fontSize(8).text(nombreCompleto(data.estudiante), ml + 88, y + 7, { width: leftW - 96 });
                    doc.font('Helvetica-Bold').fontSize(8).text('Grado:', ml + 28, y + 22);
                    doc.font('Helvetica').fontSize(8).text(data.curso.nombre, ml + 62, y + 22, { width: leftW - 70 });
                    doc.font('Helvetica-Bold').fontSize(8).text('Codigo:', ml + 20 + leftW + 8, y + 15);
                    doc.font('Helvetica').fontSize(8).text(data.estudiante.cedula, ml + 20 + leftW + 48, y + 15, { width: rightW - 56 });
                    y += infoH + 12;
                }
                const faltas = String(materia.faltas ?? 0);
                const notas = extraerNotasResumen(materia.resumenNotas, materia.nota);
                const sectionX = ml + 20;
                const sectionW = cw - 40;
                const subjectW = 138;
                const teacherW = sectionW - subjectW;
                const headerRowH = 22;
                const gradeRowH = 22;
                const tablaTop = y;
                const bloqueTop = y;
                doc.lineWidth(1.25);
                doc.moveTo(sectionX, tablaTop).lineTo(sectionX + sectionW, tablaTop).stroke(C.lineaFuerte);
                doc.rect(sectionX, tablaTop, subjectW, headerRowH + gradeRowH).fill('#ef1d1d').stroke(C.lineaFuerte);
                doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9.5).text(materia.asignaturaNombre, sectionX + 8, tablaTop + 15, {
                    width: subjectW - 16,
                    align: 'center',
                });
                doc.rect(sectionX + subjectW, tablaTop, teacherW, headerRowH).fill(C.blanco).stroke(C.lineaFuerte);
                doc.fillColor(C.tinta).font('Helvetica').fontSize(8.4).text(`Docente: ${materia.docenteNombre}`, sectionX + subjectW + 8, tablaTop + 6, {
                    width: teacherW - 16,
                });
                doc.moveTo(sectionX, tablaTop + headerRowH).lineTo(sectionX + sectionW, tablaTop + headerRowH).stroke(C.lineaFuerte);
                const cols = [
                    { key: 'promedio', label: periodoNumero >= 3 ? 'Nota final' : 'Promedio general', value: notas.promedio, width: 94 },
                    { key: 'p1', label: 'I periodo', value: notas.p1, width: 60 },
                    { key: 'p2', label: 'II periodo', value: notas.p2, width: 60 },
                    { key: 'p3', label: 'III periodo', value: notas.p3, width: 60 },
                    { key: 'faltas', label: 'No. faltas', value: faltas, width: 62 },
                ];
                const visibles = cols.filter((col) => {
                    if (col.key === 'p2')
                        return periodoNumero >= 2;
                    if (col.key === 'p3')
                        return periodoNumero >= 3;
                    return true;
                });
                const totalFijo = visibles.reduce((acc, col) => acc + col.width, 0);
                const ajuste = teacherW - totalFijo;
                visibles[0].width += ajuste;
                let x = sectionX + subjectW;
                visibles.forEach((col) => {
                    doc.rect(x, tablaTop + headerRowH, col.width, gradeRowH).fill(C.blanco).stroke(C.lineaFuerte);
                    doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(7.3).text(col.label.toUpperCase(), x, tablaTop + headerRowH + 4, {
                        width: col.width,
                        align: 'center',
                    });
                    doc.font('Helvetica-Bold').fontSize(col.key === 'promedio' ? 10 : 9.5).text(col.value, x, tablaTop + headerRowH + 13, {
                        width: col.width,
                        align: 'center',
                    });
                    x += col.width;
                });
                doc.rect(sectionX + subjectW, tablaTop, teacherW, headerRowH + gradeRowH).stroke(C.lineaFuerte);
                y += headerRowH + gradeRowH + 10;
                doc.rect(sectionX, y, sectionW, 20).fill('#dbeafe').stroke(C.lineaFuerte);
                doc.fillColor(C.azulOscuro).font('Helvetica-Bold').fontSize(8.2).text('INDICADORES DE DESEMPENO', ml, y + 6, {
                    width: cw,
                    align: 'center',
                });
                y += 20;
                y = this.dibujarIndicadores(doc, sectionX, y, sectionW, 'SABER', partirTexto(materia.indicadores?.saber, 'Sin indicadores registrados'), '#1da9e1', C.blanco);
                y += 2;
                y = this.dibujarIndicadores(doc, sectionX, y, sectionW, 'HACER', partirTexto(materia.indicadores?.hacer, 'Sin indicadores registrados'), '#f8f400', C.blanco);
                y += 2;
                y = this.dibujarIndicadores(doc, sectionX, y, sectionW, 'SER', partirTexto(materia.indicadores?.ser, 'Sin indicadores registrados'), '#22c55e', C.blanco);
                y += 8;
                if (materia.observacion) {
                    const obsH = Math.max(26, doc.heightOfString(materia.observacion, { width: sectionW - 100 }) + 12);
                    doc.rect(sectionX, y, sectionW, obsH).fill('#fff7ed').stroke(C.lineaFuerte);
                    doc.fillColor(C.amarillo).font('Helvetica-Bold').fontSize(8).text('OBSERVACION', sectionX + 10, y + 9);
                    doc.fillColor(C.tinta).font('Helvetica').fontSize(8).text(materia.observacion, sectionX + 100, y + 8, {
                        width: sectionW - 110,
                    });
                    y += obsH + 8;
                }
                doc.rect(sectionX, bloqueTop, sectionW, y - bloqueTop - 2).stroke(C.lineaFuerte);
                doc.moveTo(sectionX, y - 2).lineTo(sectionX + sectionW, y - 2).stroke(C.lineaSuave);
            }
            y += 8;
            const notasMaterias = data.calificaciones
                .map((materia) => Number(materia.nota))
                .filter((nota) => Number.isFinite(nota));
            const promedioMaterias = promedioSimple(notasMaterias);
            const notasComportamiento = data.calificaciones
                .map((materia) => notaComportamiento(materia.comportamiento))
                .filter((nota) => nota !== null);
            const promedioComportamiento = promedioSimple(notasComportamiento);
            const etiquetaPeriodo = periodoNumero === 1 ? 'Promedio general I periodo:' : periodoNumero === 2 ? 'Promedio general II periodo:' : 'Promedio general III periodo:';
            if (y + 86 > doc.page.height - 70) {
                this.dibujarPie(doc, data, footerLabel);
                doc.addPage();
                y = 18;
                y = this.dibujarBanner(doc, ml, y, cw, 92) + 12;
            }
            const resumenX = ml + 20;
            const resumenW = cw - 40;
            const labelW = 170;
            const rowH = 28;
            const colW = resumenW - labelW;
            doc.lineWidth(1.25);
            doc.rect(resumenX, y, labelW, rowH).fill('#ef1d1d').stroke(C.lineaFuerte);
            doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(10).text('Promedio comportamiento:', resumenX + 10, y + 8, {
                width: labelW - 20,
                align: 'center',
            });
            doc.rect(resumenX + labelW, y, colW, rowH).fill(C.blanco).stroke(C.lineaFuerte);
            doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(10).text(promedioComportamiento !== null ? promedioComportamiento.toFixed(2) : '-', resumenX + labelW, y + 8, { width: colW, align: 'center' });
            y += rowH;
            doc.rect(resumenX, y, labelW, rowH).fill('#ef1d1d').stroke(C.lineaFuerte);
            doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(10).text(etiquetaPeriodo, resumenX + 10, y + 8, {
                width: labelW - 20,
                align: 'center',
            });
            doc.rect(resumenX + labelW, y, colW, rowH).fill(C.blanco).stroke(C.lineaFuerte);
            doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(10).text(promedioMaterias !== null ? promedioMaterias.toFixed(2) : '-', resumenX + labelW, y + 8, { width: colW, align: 'center' });
            y += rowH;
            doc.rect(resumenX, y, labelW, rowH).fill('#ef1d1d').stroke(C.lineaFuerte);
            doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(10).text('Puesto en el curso:', resumenX + 10, y + 8, {
                width: labelW - 20,
                align: 'center',
            });
            doc.rect(resumenX + labelW, y, colW, rowH).fill(C.blanco).stroke(C.lineaFuerte);
            doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(10).text(data.puestoCurso ? `${data.puestoCurso}` : '-', resumenX + labelW, y + 8, { width: colW, align: 'center' });
            y += rowH + 14;
            const firmas = ['Director(a) de grupo', 'Coordinacion', 'Acudiente'];
            firmas.forEach((firma, index) => {
                const fw = cw / 3;
                const fx = ml + index * fw + fw * 0.12;
                const lw = fw * 0.76;
                doc.moveTo(fx, y + 26).lineTo(fx + lw, y + 26).stroke(C.gris);
                doc.fillColor(C.tintaSuave).font('Helvetica').fontSize(8).text(firma, ml + index * fw, y + 31, {
                    width: fw,
                    align: 'center',
                });
            });
            this.dibujarPie(doc, data, footerLabel);
        });
    }
    renderCartaPreescolar(data) {
        return this.crearBuffer((doc) => {
            doc.lineWidth(1.15);
            const headerTitle = 'CARTA INFORMATIVA';
            const footerLabel = 'Carta Informativa Preescolar';
            const periodoNumero = numeroPeriodoSeguro(data.periodo);
            const pw = doc.page.width;
            const ml = 26;
            const cw = pw - ml * 2;
            const sectionX = ml + 20;
            const sectionW = cw - 40;
            const dibujarEstructuraBase = (drawIntro = false) => {
                let localY = 14;
                localY = this.dibujarBanner(doc, ml, localY, cw, 92) + 12;
                doc.rect(sectionX, localY, sectionW, 20).fill('#ef1d1d').stroke(C.lineaFuerte);
                doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(13).text(headerTitle, sectionX, localY + 4, {
                    width: sectionW,
                    align: 'center',
                });
                localY += 26;
                const infoH = 40;
                const leftW = sectionW * 0.72;
                const rightW = sectionW - leftW;
                doc.rect(sectionX, localY, leftW, infoH).fill('#fff7d6').stroke(C.lineaFuerte);
                doc.rect(sectionX + leftW, localY, rightW, infoH).fill('#fff7d6').stroke(C.lineaFuerte);
                doc.moveTo(sectionX, localY + infoH / 2).lineTo(sectionX + leftW, localY + infoH / 2).stroke(C.lineaFuerte);
                doc.moveTo(sectionX + leftW, localY).lineTo(sectionX + leftW, localY + infoH).stroke(C.lineaFuerte);
                doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8).text('Estudiante:', sectionX + 8, localY + 7);
                doc.font('Helvetica').fontSize(8).text(nombreCompleto(data.estudiante), sectionX + 68, localY + 7, {
                    width: leftW - 76,
                });
                doc.font('Helvetica-Bold').fontSize(8).text('Grado:', sectionX + 8, localY + 22);
                doc.font('Helvetica').fontSize(8).text(data.curso.nombre, sectionX + 40, localY + 22, {
                    width: leftW - 48,
                });
                doc.font('Helvetica-Bold').fontSize(8).text('Codigo:', sectionX + leftW + 8, localY + 15);
                doc.font('Helvetica').fontSize(8).text(data.estudiante.cedula, sectionX + leftW + 46, localY + 15, {
                    width: rightW - 54,
                });
                localY += infoH + 12;
                if (drawIntro) {
                    const saludo = 'Estimadas familias:';
                    const intro = `Reciban un cordial saludo. Durante este ${textoPeriodo(data).toLowerCase()} hemos acompanado a ${nombreCompleto(data.estudiante)} en un proceso lleno de descubrimientos, juegos y aprendizajes significativos. ` +
                        `A continuacion, compartimos algunos avances observados, teniendo en cuenta las diferentes formas en que aprende.`;
                    doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(12).text(saludo, sectionX, localY, { width: sectionW });
                    localY += 20;
                    doc.font('Helvetica').fontSize(9).text(intro, sectionX, localY, {
                        width: sectionW,
                        align: 'justify',
                    });
                    localY += doc.heightOfString(intro, { width: sectionW, align: 'justify' }) + 14;
                }
                return localY;
            };
            let y = dibujarEstructuraBase(true);
            for (const materia of data.calificaciones) {
                const saberItems = partirTexto(materia.indicadores?.saber, 'Sin seguimiento registrado');
                const hacerItems = partirTexto(materia.indicadores?.hacer, 'Sin seguimiento registrado');
                const serItems = partirTexto(materia.indicadores?.ser, 'Sin seguimiento registrado');
                const resumenDestacado = saberItems.join('\n');
                const objetivo = hacerItems[0] || 'Fortalecer el desarrollo integral del estudiante.';
                const actividadesLista = (hacerItems.length > 1 ? hacerItems.slice(1) : ['Acompanamiento pedagogico en aula.']).map((item) => `- ${item}`);
                const actividadesTexto = actividadesLista.join('\n');
                const observacionesLista = serItems.length ? serItems.map((item) => `- ${item}`) : ['- Sin observaciones adicionales.'];
                const observacionesTextoBase = observacionesLista.join('\n');
                const comportamiento = materia.comportamiento?.descripcion
                    ? `${materia.comportamiento.nivel}: ${materia.comportamiento.descripcion}`
                    : materia.comportamiento?.nivel;
                const observacionFinal = [observacionesTextoBase, materia.observacion, comportamiento].filter(Boolean).join('\n');
                const resumenH = Math.max(30, doc.heightOfString(resumenDestacado, { width: sectionW - 20, align: 'center' }) + 12);
                const objetivoH = Math.max(20, doc.heightOfString(`-Objetivo: ${objetivo}`, { width: sectionW - 20 }) + 8);
                const actividadesH = Math.max(38, doc.heightOfString(`Actividades:\n${actividadesTexto}`, { width: sectionW - 20 }) + 12);
                const observacionesH = Math.max(42, doc.heightOfString(`Observaciones:\n${observacionFinal || '- Sin observaciones adicionales.'}`, { width: sectionW - 20 }) + 12);
                const blockH = 24 + resumenH + objetivoH + actividadesH + observacionesH;
                if (y + blockH > doc.page.height - 70) {
                    this.dibujarPie(doc, data, footerLabel);
                    doc.addPage();
                    y = dibujarEstructuraBase(false);
                }
                const topY = y;
                const materiaW = 165;
                const docenteW = 190;
                const periodoW = sectionW - materiaW - docenteW;
                doc.lineWidth(1.25);
                doc.rect(sectionX, topY, materiaW, 24).fill('#ef1d1d').stroke(C.lineaFuerte);
                doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(9.5).text(materia.asignaturaNombre, sectionX + 8, topY + 7, {
                    width: materiaW - 16,
                    align: 'center',
                });
                doc.rect(sectionX + materiaW, topY, docenteW, 24).fill(C.blanco).stroke(C.lineaFuerte);
                doc.fillColor(C.tinta).font('Helvetica').fontSize(8.3).text(`Docente: ${materia.docenteNombre}`, sectionX + materiaW + 8, topY + 7, {
                    width: docenteW - 16,
                });
                doc.rect(sectionX + materiaW + docenteW, topY, periodoW, 24).fill('#d9f99d').stroke(C.lineaFuerte);
                doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.5).text(periodoNumero === 1 ? 'Primer periodo' : periodoNumero === 2 ? 'Segundo periodo' : 'Tercer periodo', sectionX + materiaW + docenteW, topY + 7, { width: periodoW, align: 'center' });
                let bodyY = topY + 24;
                doc.rect(sectionX, bodyY, sectionW, resumenH).fill('#18a9e1').stroke(C.lineaFuerte);
                doc.fillColor(C.blanco).font('Helvetica-Bold').fontSize(8.6).text(resumenDestacado, sectionX + 8, bodyY + 6, {
                    width: sectionW - 16,
                    align: 'center',
                });
                bodyY += resumenH;
                const cuerpoTop = bodyY;
                const cuerpoH = objetivoH + actividadesH + observacionesH;
                doc.rect(sectionX, cuerpoTop, sectionW, cuerpoH).fill(C.blanco).stroke(C.lineaFuerte);
                doc.moveTo(sectionX, bodyY).lineTo(sectionX + sectionW, bodyY).stroke(C.lineaFuerte);
                doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.6).text('-Objetivo:', sectionX + 8, bodyY + 6);
                doc.font('Helvetica').fontSize(8.4).text(objetivo, sectionX + 58, bodyY + 6, { width: sectionW - 66 });
                bodyY += objetivoH;
                doc.moveTo(sectionX, bodyY).lineTo(sectionX + sectionW, bodyY).stroke(C.lineaFuerte);
                doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.8).text('Actividades:', sectionX + 8, bodyY + 6);
                doc.font('Helvetica').fontSize(8.2).text(actividadesTexto, sectionX + 10, bodyY + 20, { width: sectionW - 20 });
                bodyY += actividadesH;
                doc.moveTo(sectionX, bodyY).lineTo(sectionX + sectionW, bodyY).stroke(C.lineaFuerte);
                doc.fillColor(C.tinta).font('Helvetica-Bold').fontSize(8.8).text('Observaciones:', sectionX + 8, bodyY + 6);
                doc.font('Helvetica').fontSize(8.2).text(observacionFinal || '- Sin observaciones adicionales.', sectionX + 10, bodyY + 20, {
                    width: sectionW - 20,
                });
                y = topY + blockH + 12;
            }
            const firmas = ['Docente titular', 'Coordinacion', 'Acudiente'];
            firmas.forEach((firma, index) => {
                const fw = cw / 3;
                const fx = ml + index * fw + fw * 0.12;
                const lw = fw * 0.76;
                doc.moveTo(fx, y + 26).lineTo(fx + lw, y + 26).stroke(C.gris);
                doc.fillColor(C.tintaSuave).font('Helvetica').fontSize(8).text(firma, ml + index * fw, y + 31, {
                    width: fw,
                    align: 'center',
                });
            });
            this.dibujarPie(doc, data, footerLabel);
        });
    }
    async generateBoletinGardner(data) {
        if (esCursoPreescolar(data.curso.nombre)) {
            return this.renderCartaPreescolar(data);
        }
        if (esCursoPrimaria(data.curso.nombre)) {
            return this.renderBoletinAcademico(data);
        }
        return this.renderBoletinAcademico(data);
    }
    async generateBoletinPDF(boletin, estudiante, curso, calificaciones) {
        const data = {
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
            calificaciones: calificaciones.map((cal) => ({
                asignaturaId: cal.asignaturaId,
                asignaturaNombre: cal.asignaturaNombre || cal.asignaturaId,
                docenteNombre: 'Docente',
                valoracion: cal.nota >= 4.5 ? 'Superior' : cal.nota >= 4.0 ? 'Alto' : cal.nota >= 3.0 ? 'Basico' : 'Bajo',
                nota: cal.nota,
                faltas: 0,
                observacion: cal.observaciones,
            })),
        };
        return this.generateBoletinGardner(data);
    }
}
export const pdfService = new PDFService();
//# sourceMappingURL=pdfService.js.map