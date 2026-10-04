const avatarBtn = document.getElementById('avatarBtn');
const avatarDropdown = document.getElementById('avatarDropdown');

avatarBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = avatarDropdown.classList.toggle('open');
  avatarBtn.setAttribute('aria-expanded', isOpen);
});

// Cierra el menú si se hace click afuera
document.addEventListener('click', (e) => {
  if (!avatarDropdown.contains(e.target) && e.target !== avatarBtn) {
    avatarDropdown.classList.remove('open');
    avatarBtn.setAttribute('aria-expanded', 'false');
  }
});

// Placeholder de búsqueda: acá se conectará la lógica real de
// búsqueda de películas/funciones más adelante.
// (el buscador solo existe en Inicio.html, por eso el chequeo)
const searchBar = document.querySelector('.search-bar');
if (searchBar) {
  searchBar.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Buscar:', e.target.querySelector('input').value);
  });
}

// ===================================================================
// BUSCADOR DE PELÍCULAS EN VIVO (hero del Inicio)
//
// Usa la misma API de TMDB que ya usa la página de Películas. A
// medida que el usuario escribe (con un pequeño debounce para no
// disparar un pedido por cada tecla), va mostrando resultados reales
// con póster, título y año en un dropdown debajo de la barra.
// ===================================================================
const TMDB_API_KEY = 'f5e63df2afa3ae459863c535bd3f8a62';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w92';

const movieSearchForm = document.getElementById('movieSearchForm');
const movieSearchInput = document.getElementById('movieSearchInput');
const movieLiveResults = document.getElementById('movieLiveResults');

if (movieSearchForm && movieSearchInput && movieLiveResults) {
  let debounceTimer = null;
  let lastRequestId = 0;

  function goToPeliculas(query) {
    window.location.href = `Peliculas/Peliculas.html?q=${encodeURIComponent(query)}`;
  }

  function positionResults() {
    const rect = movieSearchForm.getBoundingClientRect();
    movieLiveResults.style.top = `${rect.bottom + 10}px`;
    movieLiveResults.style.left = `${rect.left}px`;
    movieLiveResults.style.width = `${rect.width}px`;
  }

  function openResults() {
    positionResults();
    movieLiveResults.classList.add('open');
  }
  function closeResults() { movieLiveResults.classList.remove('open'); }

  window.addEventListener('scroll', () => {
    if (movieLiveResults.classList.contains('open')) positionResults();
  }, true);
  window.addEventListener('resize', () => {
    if (movieLiveResults.classList.contains('open')) positionResults();
  });

  function renderStatus(message) {
    movieLiveResults.innerHTML = `<p class="live-status">${message}</p>`;
    openResults();
  }

  function renderMovies(peliculas, query) {
    if (!peliculas || peliculas.length === 0) {
      renderStatus('No se encontraron películas con ese nombre.');
      return;
    }

    movieLiveResults.innerHTML = '';

    peliculas.slice(0, 6).forEach((pelicula) => {
      const poster = pelicula.poster_path
        ? `${TMDB_IMAGE_URL}${pelicula.poster_path}`
        : 'https://via.placeholder.com/92x138?text=%20';
      const anio = pelicula.release_date ? pelicula.release_date.split('-')[0] : 'N/A';

      const item = document.createElement('a');
      item.href = `Peliculas/Peliculas.html?q=${encodeURIComponent(pelicula.title)}`;
      item.className = 'movie-live-item';
      item.innerHTML = `
        <img src="${poster}" alt="${pelicula.title}" loading="lazy" />
        <div class="movie-live-info">
          <div class="title">${pelicula.title}</div>
          <div class="year">${anio}</div>
        </div>
      `;
      movieLiveResults.appendChild(item);
    });

    const seeAll = document.createElement('a');
    seeAll.href = `Peliculas/Peliculas.html?q=${encodeURIComponent(query)}`;
    seeAll.className = 'see-all';
    seeAll.textContent = 'Ver todos los resultados →';
    movieLiveResults.appendChild(seeAll);

    openResults();
  }

  async function buscarEnVivo(query) {
    const requestId = ++lastRequestId;
    renderStatus('Buscando películas...');

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      // Si mientras esperábamos la respuesta el usuario ya tipeó otra
      // cosa, descartamos este resultado viejo para no pisar el nuevo.
      if (requestId !== lastRequestId) return;

      renderMovies(data.results, query);
    } catch (error) {
      if (requestId !== lastRequestId) return;
      console.error('Error al conectar con TMDB:', error);
      renderStatus('Hubo un error al buscar. Intentá de nuevo.');
    }
  }

  movieSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 2) {
      closeResults();
      return;
    }

    debounceTimer = setTimeout(() => buscarEnVivo(query), 350);
  });

  movieSearchInput.addEventListener('focus', () => {
    if (movieSearchInput.value.trim().length >= 2 && movieLiveResults.innerHTML) {
      openResults();
    }
  });

  movieSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = movieSearchInput.value.trim();
    if (query) goToPeliculas(query);
  });

  document.addEventListener('click', (e) => {
    if (!movieLiveResults.contains(e.target) && e.target !== movieSearchInput) {
      closeResults();
    }
  });
}


//
// En vez de tipear los países a mano, usamos la API nativa Intl del
// navegador: Intl.supportedValuesOf('region') nos da todos los
// códigos de país (ISO) que el navegador conoce, e Intl.DisplayNames
// los traduce a nombre en español. Así el listado sale completo y
// actualizado solo, sin mantenerlo nosotros.
// ===================================================================
const locationChip = document.getElementById('locationChip');
const locationDropdown = document.getElementById('locationDropdown');
const locationSearch = document.getElementById('locationSearch');
const locationList = document.getElementById('locationList');

// Nuestra "ubicación actual" no es un país entero sino una ciudad
// puntual (Córdoba, Argentina), así que la tratamos aparte del
// listado general de países.
const HOME = { code: 'AR', city: 'Córdoba', label: 'Córdoba, Arg.' };

// Códigos ISO 3166-1 alpha-2 de todos los países reconocidos actualmente.
// Son solo los CÓDIGOS (AR, US, JP...); el NOMBRE en español de cada uno
// lo genera Intl.DisplayNames más abajo, no lo tipeamos a mano.
const ISO_COUNTRY_CODES = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
  'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
  'DE','DJ','DK','DM','DO','DZ',
  'EC','EE','EG','EH','ER','ES','ET',
  'FI','FJ','FK','FM','FO','FR',
  'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
  'HK','HM','HN','HR','HT','HU',
  'ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT',
  'JE','JM','JO','JP',
  'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ',
  'LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
  'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
  'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ',
  'OM',
  'PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
  'QA',
  'RE','RO','RS','RU','RW',
  'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
  'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ',
  'UA','UG','UM','US','UY','UZ',
  'VA','VC','VE','VG','VI','VN','VU',
  'WF','WS',
  'YE','YT',
  'ZA','ZM','ZW',
];

if (locationChip && locationDropdown && locationList) {
  let countries = [];

  try {
    const regionNames = new Intl.DisplayNames(['es'], { type: 'region', fallback: 'none' });
    countries = ISO_COUNTRY_CODES
      .map((code) => ({ code, name: regionNames.of(code) }))
      .filter((c) => c.name && c.code !== HOME.code)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  } catch (err) {
    // Por si algún navegador viejo no soporta Intl.DisplayNames,
    // dejamos el buscador vacío en vez de romper la página.
    console.warn('No se pudo generar el listado de países:', err);
  }

  function renderList(filterText = '') {
    const term = filterText.trim().toLowerCase();
    locationList.innerHTML = '';

    // La ubicación actual siempre arriba, filtrada también por búsqueda
    if (!term || HOME.label.toLowerCase().includes(term) || 'argentina'.includes(term)) {
      const homeItem = document.createElement('li');
      homeItem.className = 'current';
      homeItem.innerHTML = `<span>${HOME.label}</span> <ion-icon name="checkmark-circle"></ion-icon>`;
      homeItem.addEventListener('click', () => closeDropdown());
      locationList.appendChild(homeItem);
    }

    const filtered = term
      ? countries.filter((c) => c.name.toLowerCase().includes(term))
      : countries;

    if (filtered.length === 0 && locationList.children.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'no-results';
      empty.textContent = 'No se encontraron países';
      locationList.appendChild(empty);
      return;
    }

    filtered.forEach((c) => {
      const item = document.createElement('li');
      item.innerHTML = `<span>${c.name}</span>`;
      item.addEventListener('click', () => selectRegion(c.name));
      locationList.appendChild(item);
    });
  }

  function selectRegion(countryName) {
    // Elegir un país que no sea nuestra ubicación base todavía no
    // está disponible: mandamos a la página de "Próximamente" con
    // el nombre del país para personalizar el mensaje.
    window.location.href = `Proximamente.html?region=${encodeURIComponent(countryName)}`;
  }

  function positionDropdown() {
    const rect = locationChip.getBoundingClientRect();
    locationDropdown.style.top = `${rect.bottom + 10}px`;
    locationDropdown.style.left = `${rect.left}px`;
  }

  function openDropdown() {
    positionDropdown();
    locationDropdown.classList.add('open');
    locationChip.setAttribute('aria-expanded', 'true');
    renderList();
    locationSearch.value = '';
    locationSearch.focus();
  }

  function closeDropdown() {
    locationDropdown.classList.remove('open');
    locationChip.setAttribute('aria-expanded', 'false');
  }

  window.addEventListener('scroll', () => {
    if (locationDropdown.classList.contains('open')) positionDropdown();
  }, true);
  window.addEventListener('resize', () => {
    if (locationDropdown.classList.contains('open')) positionDropdown();
  });

  locationChip.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = locationDropdown.classList.contains('open');
    isOpen ? closeDropdown() : openDropdown();
  });

  locationSearch.addEventListener('input', (e) => renderList(e.target.value));
  locationSearch.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('click', (e) => {
    if (!locationDropdown.contains(e.target) && e.target !== locationChip) {
      closeDropdown();
    }
  });
}


// ===================================================================
// SESIÓN (invitado vs. usuario logueado)
//
// No hay backend todavía, así que guardamos un valor simple en
// localStorage para recordar cómo entró la persona:
//   'user'  -> inició sesión de verdad (Login.html lo setea)
//   'guest' -> entró como invitado (Login.html lo setea)
//   (nada)  -> no pasó por Login.html (por las dudas, lo tratamos
//              igual que invitado)
//
// Esto se ejecuta en TODAS las páginas porque todas cargan este
// mismo Inicio.js, así el menú de la personita y los seminarios
// pueden preguntar "¿esta persona está logueada?" sin repetir código.
// ===================================================================
const SESSION_KEY = 'cinemorfosisSession';
// Nombre de usuario de la cuenta con la que se inició sesión (lo guarda Login.js)
const CURRENT_USER_KEY = 'cinemorfosisCurrentUser';

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function isGuest() {
  return getSession() !== 'user';
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Si es invitado, cambiamos el contenido del menú de la personita:
// en vez de "Mi perfil / Mis eventos / Cerrar sesión" mostramos un
// aviso y un link para ir a iniciar sesión. Si está logueado, no
// tocamos nada (se deja el menú tal cual está escrito en el HTML).
function renderAvatarMenu() {
  const logoutLink = avatarDropdown.querySelector('.logout');

  // Si en algún momento hay un "Cerrar sesión" real, que además
  // borre la sesión guardada al tocarlo.
  if (logoutLink) {
    logoutLink.addEventListener('click', clearSession);
  }

  if (isGuest()) {
    // El link de "Cerrar sesión" ya apunta bien a Login.html desde
    // cualquier profundidad de carpetas (../Login o ../../Login),
    // así que reusamos esa misma ruta en vez de escribirla de nuevo.
    const loginHref = logoutLink ? logoutLink.getAttribute('href') : '#';

    avatarDropdown.innerHTML = `
      <span class="avatar-dropdown-note">Estás viendo como invitado</span>
      <a href="${loginHref}"><ion-icon name="log-in-outline"></ion-icon> Iniciar sesión</a>
    `;
  }
}

renderAvatarMenu();

// Lo exponemos para que otros scripts (como el de los seminarios)
// puedan preguntar "¿esta persona es invitada?" sin duplicar lógica.
// ===================================================================
// MIS EVENTOS (seminarios a los que la persona se inscribió)
//
// Todavía no hay backend, así que las inscripciones se guardan en
// localStorage, separadas por cuenta, con esta forma:
//   cinemorfosisEvents = {
//     "<usuario en minúsculas>": [ { id, title, category, ... }, ... ]
//   }
// Así, si en la misma compu entran dos cuentas distintas, cada una ve
// solo sus propios eventos. Cuando exista un backend real, solo hay que
// reemplazar estas funciones por llamadas a la API.
// ===================================================================
const EVENTS_KEY = 'cinemorfosisEvents';

// Identifica a la persona logueada. Si inició sesión pero no tenemos su
// nombre guardado (sesión vieja), usamos una clave genérica. Los
// invitados no tienen clave: no pueden inscribirse.
function currentUserKey() {
  if (isGuest()) return null;
  const name = localStorage.getItem(CURRENT_USER_KEY);
  return name && name.trim() ? name.trim().toLowerCase() : '__sesion__';
}

function loadAllEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function getMyEvents() {
  const key = currentUserKey();
  if (!key) return [];
  return loadAllEvents()[key] || [];
}

function isRegisteredToEvent(id) {
  return getMyEvents().some((ev) => ev.id === id);
}

// Guarda una inscripción. Devuelve false si no hay una persona logueada.
// Si ya estaba inscripta a ese evento, no lo duplica.
function registerEvent(eventData) {
  const key = currentUserKey();
  if (!key) return false;

  const all = loadAllEvents();
  const list = all[key] || [];

  if (!list.some((ev) => ev.id === eventData.id)) {
    list.push({ ...eventData, registeredAt: new Date().toISOString() });
  }

  all[key] = list;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(all));
  return true;
}

// Lo exponemos para que otros scripts (como el de los seminarios o
// el de "Mis eventos") puedan usar estas funciones sin duplicar lógica.
window.Cinemorfosis = {
  isGuest,
  getSession,
  getMyEvents,
  isRegisteredToEvent,
  registerEvent,
};