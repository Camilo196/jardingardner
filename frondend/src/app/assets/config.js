/**
 * LEARNSCAPE — Configuración centralizada
 *
 * Para desplegar en producción, cambia API_URL por la URL real del servidor.
 * Ejemplo: window.LEARNSCAPE_API = 'https://learnscape.tu-colegio.com/graphql';
 *
 * También puedes sobreescribir el nombre de la institución aquí:
 * window.LEARNSCAPE_INSTITUCION = 'Colegio San José';
 */
window.LEARNSCAPE_API = window.LEARNSCAPE_API || 'http://localhost:4000/graphql';
window.LEARNSCAPE_INSTITUCION = window.LEARNSCAPE_INSTITUCION || 'Jardín Infantil Gardner';
