/**
 * LEARNSCAPE - Configuracion centralizada
 *
 * Para produccion, cambia LEARNSCAPE_API por la URL real del backend.
 * Ejemplo:
 * window.LEARNSCAPE_API = 'https://api.tu-dominio.com/graphql';
 */

window.LEARNSCAPE_API = window.LEARNSCAPE_API || 'http://localhost:4000/graphql';
window.LEARNSCAPE_INSTITUCION = window.LEARNSCAPE_INSTITUCION || 'Jardin Infantil Gardner';
window.LEARNSCAPE_HOME = window.LEARNSCAPE_HOME || 'principal.html';
window.LEARNSCAPE_GO_HOME = window.LEARNSCAPE_GO_HOME || function () {
  window.location.href = window.LEARNSCAPE_HOME;
};
