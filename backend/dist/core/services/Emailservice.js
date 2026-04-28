"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarConexionEmail = verificarConexionEmail;
exports.enviarCredenciales = enviarCredenciales;
exports.enviarPasswordRecuperacion = enviarPasswordRecuperacion;
exports.notificarNuevaCalificacion = notificarNuevaCalificacion;
exports.enviarConfirmacionMatricula = enviarConfirmacionMatricula;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GMAIL_USER = process.env.GMAIL_USER?.trim() || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '').trim() || '';
// Crear transporter usando Gmail
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});
const FROM_EMAIL = GMAIL_USER;
const APP_URL = process.env.APP_URL || 'http://localhost:4200';
// Verificar conexiÃ³n al iniciar
async function verificarConexionEmail() {
    try {
        await transporter.verify();
    }
    catch (error) {
        console.error('âš ï¸ Advertencia: No se pudo verificar el servicio de correo:', error);
        console.error('   Revisa GMAIL_USER y GMAIL_APP_PASSWORD en el archivo .env');
    }
}
// Plantilla base HTML
function plantillaBase(contenido) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background-color: #4a69bd; padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">LearnScape</h1>
        <p style="color: #ccd6f6; margin: 5px 0 0 0; font-size: 14px;">Sistema de GestiÃ³n Educativa</p>
      </div>
      <div style="padding: 25px; background-color: #ffffff;">
        ${contenido}
      </div>
      <div style="background-color: #f5f6fa; padding: 15px; border-radius: 0 0 6px 6px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">Este correo fue enviado automÃ¡ticamente por LearnScape. No respondas a este mensaje.</p>
      </div>
    </div>
  `;
}
// Enviar credenciales a usuario nuevo (estudiante o profesor)
async function enviarCredenciales(params) {
    const { email, nombre, apellido, cedula, password, rol } = params;
    const rolTexto = rol === 'PROFESOR' ? 'profesor/a' : 'estudiante';
    const contenido = `
    <h2 style="color: #4a69bd;">Â¡Bienvenido/a a LearnScape!</h2>
    <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
    <p>Se han generado tus credenciales de acceso al sistema acadÃ©mico como <strong>${rolTexto}</strong>:</p>
    <div style="background-color: #f5f6fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4a69bd;">
      <p style="margin: 5px 0;"><strong>Usuario:</strong> ${cedula}</p>
      <p style="margin: 5px 0;"><strong>ContraseÃ±a temporal:</strong> <code style="background:#e8eaf6;padding:2px 6px;border-radius:3px;">${password}</code></p>
    </div>
    <p>Al ingresar por primera vez, el sistema te pedirÃ¡ que establezcas tu propia contraseÃ±a.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${APP_URL}" style="background-color: #4a69bd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Acceder al sistema</a>
    </div>
    <p style="color: #666; font-size: 13px;">Si tienes algÃºn problema para acceder, contacta al administrador del sistema.</p>
    <p>Saludos cordiales,<br><strong>Equipo LearnScape</strong></p>
  `;
    try {
        await transporter.sendMail({
            from: `"LearnScape" <${FROM_EMAIL}>`,
            to: email,
            subject: 'Credenciales de acceso - LearnScape',
            html: plantillaBase(contenido),
        });
        return true;
    }
    catch (error) {
        console.error(`âŒ Error al enviar correo a ${email}:`, error.message);
        return false;
    }
}
// Enviar nueva contraseÃ±a temporal (recuperaciÃ³n)
async function enviarPasswordRecuperacion(params) {
    const { email, nombre, cedula, passwordTemporal } = params;
    const contenido = `
    <h2 style="color: #4a69bd;">RecuperaciÃ³n de contraseÃ±a</h2>
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Recibimos una solicitud para restablecer tu contraseÃ±a en LearnScape. AquÃ­ estÃ¡n tus credenciales temporales:</p>
    <div style="background-color: #f5f6fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
      <p style="margin: 5px 0;"><strong>Usuario:</strong> ${cedula}</p>
      <p style="margin: 5px 0;"><strong>ContraseÃ±a temporal:</strong> <code style="background:#ffeaea;padding:2px 6px;border-radius:3px;">${passwordTemporal}</code></p>
    </div>
    <p>Al ingresar con esta contraseÃ±a, el sistema te pedirÃ¡ que establezcas una nueva contraseÃ±a de tu elecciÃ³n.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${APP_URL}" style="background-color: #4a69bd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Ingresar ahora</a>
    </div>
    <p style="color: #e74c3c; font-size: 13px;">âš ï¸ Si no solicitaste este cambio, contacta al administrador inmediatamente.</p>
    <p>Saludos cordiales,<br><strong>Equipo LearnScape</strong></p>
  `;
    try {
        await transporter.sendMail({
            from: `"LearnScape" <${FROM_EMAIL}>`,
            to: email,
            subject: 'RecuperaciÃ³n de contraseÃ±a - LearnScape',
            html: plantillaBase(contenido),
        });
        return true;
    }
    catch (error) {
        console.error(`âŒ Error al enviar correo de recuperaciÃ³n a ${email}:`, error.message);
        return false;
    }
}
// Notificar al estudiante que se registrÃ³ una nueva calificaciÃ³n
async function notificarNuevaCalificacion(params) {
    const { email, nombre, apellido, asignaturaNombre, cursoNombre, tipoActividad, nombreActividad, nota, periodo, corte, observaciones } = params;
    const colorNota = nota >= 4.0 ? '#15803d' : nota >= 3.0 ? '#d97706' : '#dc2626';
    const bgNota = nota >= 4.0 ? '#dcfce7' : nota >= 3.0 ? '#fef3c7' : '#fee2e2';
    const tipoLabel = {
        TRABAJO: 'Trabajo', EXAMEN: 'Examen', QUIZ: 'Quiz',
        PARTICIPACION: 'ParticipaciÃ³n', TALLER: 'Taller',
    };
    const corteLabel = { 1: 'Primer Corte (30%)', 2: 'Segundo Corte (30%)', 3: 'Tercer Corte (40%)' };
    const contenido = `
    <h2 style="color:#4a69bd;margin-top:0;">Nueva calificaciÃ³n registrada</h2>
    <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
    <p>Tu docente ha registrado una nueva nota para ti. AquÃ­ estÃ¡n los detalles:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;width:140px;">Asignatura:</td><td style="padding:8px 0;font-weight:600;">${asignaturaNombre}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Curso:</td><td style="padding:8px 0;">${cursoNombre}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Actividad:</td><td style="padding:8px 0;">${nombreActividad}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Tipo:</td><td style="padding:8px 0;">${tipoLabel[tipoActividad] || tipoActividad}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Corte:</td><td style="padding:8px 0;">${corteLabel[corte] || `Corte ${corte}`}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">PerÃ­odo:</td><td style="padding:8px 0;">${periodo}</td></tr>
      </table>
      <div style="margin-top:16px;text-align:center;">
        <div style="display:inline-block;background:${bgNota};color:${colorNota};border-radius:12px;padding:12px 32px;">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Tu nota</div>
          <div style="font-size:36px;font-weight:800;line-height:1;">${nota.toFixed(1)}</div>
          <div style="font-size:12px;margin-top:4px;">${nota >= 3.0 ? 'âœ” Aprobado' : 'âœ˜ Por mejorar'}</div>
        </div>
      </div>
      ${observaciones ? `<p style="margin-top:16px;padding:12px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:4px;font-size:13px;color:#374151;"><strong>ObservaciÃ³n del docente:</strong> ${observaciones}</p>` : ''}
    </div>
    <p style="color:#64748b;font-size:13px;">Puedes ver todas tus calificaciones ingresando al sistema en cualquier momento.</p>
    <div style="text-align:center;margin:25px 0;">
      <a href="${APP_URL}" style="background:#4a69bd;color:white;padding:12px 25px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">Ver mis calificaciones</a>
    </div>
    <p>Saludos,<br><strong>Equipo LearnScape</strong></p>
  `;
    try {
        await transporter.sendMail({
            from: `"LearnScape" <${FROM_EMAIL}>`,
            to: email,
            subject: `Nueva nota registrada â€” ${asignaturaNombre} (${nota.toFixed(1)}/5.0)`,
            html: plantillaBase(contenido),
        });
        return true;
    }
    catch (error) {
        // No lanzar error â€” el email es best-effort, no debe bloquear la respuesta
        console.error(`Error al notificar calificaciÃ³n a ${email}:`, error.message);
        return false;
    }
}
// Enviar confirmaciÃ³n de matrÃ­cula
async function enviarConfirmacionMatricula(params) {
    const { email, nombre, apellido, curso, asignaturas } = params;
    const listaAsignaturas = asignaturas.map(a => `<li style="margin: 4px 0;">${a}</li>`).join('');
    const contenido = `
    <h2 style="color: #4a69bd;">ConfirmaciÃ³n de matrÃ­cula</h2>
    <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
    <p>Tu matrÃ­cula ha sido registrada exitosamente en el sistema LearnScape.</p>
    <div style="background-color: #f5f6fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
      <p style="margin: 5px 0;"><strong>Curso:</strong> ${curso}</p>
      <p style="margin: 10px 0 5px 0;"><strong>Asignaturas matriculadas:</strong></p>
      <ul style="margin: 5px 0; padding-left: 20px;">${listaAsignaturas}</ul>
    </div>
    <p>Puedes acceder al sistema en cualquier momento para ver tu informaciÃ³n acadÃ©mica.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${APP_URL}" style="background-color: #4a69bd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Ver mi matrÃ­cula</a>
    </div>
    <p>Saludos cordiales,<br><strong>Equipo LearnScape</strong></p>
  `;
    try {
        await transporter.sendMail({
            from: `"LearnScape" <${FROM_EMAIL}>`,
            to: email,
            subject: 'ConfirmaciÃ³n de matrÃ­cula - LearnScape',
            html: plantillaBase(contenido),
        });
        return true;
    }
    catch (error) {
        console.error(`âŒ Error al enviar correo de matrÃ­cula a ${email}:`, error.message);
        return false;
    }
}
//# sourceMappingURL=Emailservice.js.map