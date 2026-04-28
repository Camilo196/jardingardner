/**
 * LEARNSCAPE - Configuracion centralizada
 *
 * Prioridad de resolucion de API:
 * 1. window.LEARNSCAPE_API si ya fue definida manualmente
 * 2. <meta name="learnscape-api" content="...">
 * 3. localStorage.LEARNSCAPE_API
 * 4. En local: http://localhost:4000/graphql
 * 5. En produccion: mismo origen + /graphql
 */
(function () {
  const host = window.location.hostname || '';
  const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(host);

  const metaApi = document
    .querySelector('meta[name="learnscape-api"]')
    ?.getAttribute('content')
    ?.trim();

  let storageApi = '';
  try {
    storageApi = window.localStorage?.getItem('LEARNSCAPE_API')?.trim() || '';
  } catch (_) {
    storageApi = '';
  }

  const globalApi =
    typeof window.LEARNSCAPE_API === 'string' ? window.LEARNSCAPE_API.trim() : '';

  const sameOriginApi = `${window.location.origin.replace(/\/$/, '')}/graphql`;

  const resolvedApi =
    globalApi ||
    metaApi ||
    storageApi ||
    (isLocalHost ? 'http://localhost:4000/graphql' : sameOriginApi);

  window.LEARNSCAPE_API = resolvedApi;
  window.LEARNSCAPE_INSTITUCION =
    window.LEARNSCAPE_INSTITUCION || 'Jardin Infantil Gardner';
  window.LEARNSCAPE_HOME = window.LEARNSCAPE_HOME || 'principal.html';
  window.LEARNSCAPE_GO_HOME =
    window.LEARNSCAPE_GO_HOME ||
    function () {
      window.location.href = window.LEARNSCAPE_HOME;
    };
})();
