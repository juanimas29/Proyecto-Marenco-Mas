const API_KEY = 'f5e63df2afa3ae459863c535bd3f8a62';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('resultsContainer');
const catalogTitle = document.getElementById('catalogTitle');

const filterGenero = document.getElementById('filterGenero');
const filterPlataforma = document.getElementById('filterPlataforma');
const filterAnio = document.getElementById('filterAnio');
const filterDuracion = document.getElementById('filterDuracion');
const filterReset = document.getElementById('filterReset');

const movieModalOverlay = document.getElementById('movieModalOverlay');
const movieModalClose = document.getElementById('movieModalClose');
const movieModalContent = document.getElementById('movieModalContent');

// Búsqueda en vivo: mismo patrón que usamos en el selector de
// ubicación y en el buscador del Inicio. Con cada tecla esperamos un
// poquito (debounce) antes de pegarle a la API, para no disparar un
// pedido por cada letra. lastRequestId evita que una respuesta vieja
// (de una búsqueda anterior que tardó más) pise a una más nueva.
let debounceTimer = null;
let lastRequestId = 0;

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query === '') {
      clearTimeout(debounceTimer);
      hayFiltrosActivos() ? aplicarFiltros() : cargarPopulares();
      return;
    }
    if (query.length < 2) return;

    limpiarFiltros(false);
    debounceTimer = setTimeout(() => buscarPeliculas(query), 350);
  });
}

// El botón y Enter quedan como acceso directo (fuerzan la búsqueda ya,
// sin esperar el debounce), por si alguien prefiere usarlos.
if (searchButton) {
  searchButton.addEventListener('click', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query !== '') {
      limpiarFiltros(false);
      buscarPeliculas(query);
    }
  });
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();
      if (query !== '') {
        limpiarFiltros(false);
        buscarPeliculas(query);
      }
    }
  });
}

async function buscarPeliculas(query) {
  const requestId = ++lastRequestId;

  try {
    if (catalogTitle) catalogTitle.textContent = `Resultados para "${query}"`;
    resultsContainer.innerHTML = '<p class="status-msg">Buscando películas...</p>';
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
    const data = await response.json();

    // Si mientras esperábamos la respuesta el usuario ya tipeó otra
    // cosa, descartamos este resultado viejo para no pisar el nuevo.
    if (requestId !== lastRequestId) return;

    mostrarPeliculas(data.results);
  } catch (error) {
    if (requestId !== lastRequestId) return;
    console.error('Error al conectar con TMDB:', error);
    resultsContainer.innerHTML = '<p class="status-msg">Hubo un error al realizar la búsqueda.</p>';
  }
}

function mostrarPeliculas(peliculas) {
  resultsContainer.innerHTML = '';

  if (!peliculas || peliculas.length === 0) {
    resultsContainer.innerHTML = '<p class="status-msg">No se encontraron películas con ese nombre.</p>';
    return;
  }

  peliculas.forEach(pelicula => {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const poster = pelicula.poster_path 
      ? `${IMAGE_URL}${pelicula.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

    const anio = pelicula.release_date ? pelicula.release_date.split('-')[0] : 'N/A';

    card.innerHTML = `
      <img src="${poster}" alt="${pelicula.title}" class="movie-poster">
      <h4 class="movie-title">${pelicula.title}</h4>
      <p class="movie-year">${anio}</p>
    `;

    // Tanto en el listado normal como en los resultados del buscador,
    // tocar la tarjeta abre el modal con el detalle completo.
    card.addEventListener('click', () => abrirDetallePelicula(pelicula.id));
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') abrirDetallePelicula(pelicula.id);
    });

    resultsContainer.appendChild(card);
  });
}

// Si llegamos desde el buscador del Inicio (Peliculas.html?q=nombre),
// precargamos el input y disparamos la búsqueda automáticamente.
const paramsPeliculas = new URLSearchParams(window.location.search);
const queryDesdeInicio = paramsPeliculas.get('q');

if (queryDesdeInicio && searchInput) {
  searchInput.value = queryDesdeInicio;
  buscarPeliculas(queryDesdeInicio);
} else {
  // Primer paneo general: mientras el usuario no escribió nada,
  // mostramos las películas populares del momento (TMDB) en vez de
  // dejar el bloque en blanco.
  cargarPopulares();
}

async function cargarPopulares() {
  const requestId = ++lastRequestId;

  try {
    if (catalogTitle) catalogTitle.textContent = 'Populares del momento';
    resultsContainer.innerHTML = '<p class="status-msg">Cargando populares...</p>';
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`);
    const data = await response.json();

    if (requestId !== lastRequestId) return;

    mostrarPeliculas(data.results);
  } catch (error) {
    if (requestId !== lastRequestId) return;
    console.error('Error al conectar con TMDB:', error);
    resultsContainer.innerHTML = '<p class="status-msg">No se pudieron cargar las películas populares.</p>';
  }
}

/* ==========================================================
   FILTROS: género, plataforma/en cines y año
   ========================================================== */

// Cargamos la lista de géneros de TMDB y armamos el <select> dinámicamente.
async function cargarGeneros() {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`);
    const data = await response.json();

    (data.genres || []).forEach(genero => {
      const option = document.createElement('option');
      option.value = genero.id;
      option.textContent = genero.name;
      filterGenero.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar géneros:', error);
  }
}

// Armamos el <select> de años: desde el actual hacia atrás.
function cargarAnios() {
  const anioActual = new Date().getFullYear();
  for (let anio = anioActual; anio >= 1970; anio--) {
    const option = document.createElement('option');
    option.value = anio;
    option.textContent = anio;
    filterAnio.appendChild(option);
  }
}

if (filterGenero) cargarGeneros();
if (filterAnio) cargarAnios();

function hayFiltrosActivos() {
  return Boolean(
    (filterGenero && filterGenero.value) ||
    (filterPlataforma && filterPlataforma.value) ||
    (filterAnio && filterAnio.value) ||
    (filterDuracion && filterDuracion.value)
  );
}

// Limpia los selects de filtros. Si recargar=true, además vuelve a
// mostrar los populares (se usa desde el botón "Limpiar filtros").
function limpiarFiltros(recargar) {
  if (filterGenero) filterGenero.value = '';
  if (filterPlataforma) filterPlataforma.value = '';
  if (filterAnio) filterAnio.value = '';
  if (filterDuracion) filterDuracion.value = '';
  if (recargar) cargarPopulares();
}

async function aplicarFiltros() {
  const requestId = ++lastRequestId;

  const genero = filterGenero ? filterGenero.value : '';
  const plataforma = filterPlataforma ? filterPlataforma.value : '';
  const anio = filterAnio ? filterAnio.value : '';
  const duracion = filterDuracion ? filterDuracion.value : '';

  // Sin filtros activos, volvemos al listado de populares de siempre.
  if (!genero && !plataforma && !anio && !duracion) {
    cargarPopulares();
    return;
  }

  try {
    if (catalogTitle) catalogTitle.textContent = 'Resultados filtrados';
    resultsContainer.innerHTML = '<p class="status-msg">Buscando películas...</p>';

    // watch_region=AR porque el catálogo de plataformas de TMDB varía
    // por país; usamos Argentina como región de referencia del sitio.
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=popularity.desc&region=AR`;

    if (genero) url += `&with_genres=${genero}`;
    if (anio) url += `&primary_release_year=${anio}`;

    if (duracion) {
      // El valor viene armado como "min-max" (en minutos), ej: "90-120".
      const [minMin, minMax] = duracion.split('-');
      if (minMin) url += `&with_runtime.gte=${minMin}`;
      if (minMax) url += `&with_runtime.lte=${minMax}`;
    }

    if (plataforma === 'cines') {
      // TMDB no tiene un flag de "en cines" para /discover, así que lo
      // simulamos: estrenos de cine (release_type 2 y 3) del último mes.
      const hoy = new Date();
      const haceUnMes = new Date();
      haceUnMes.setDate(hoy.getDate() - 30);
      const formatear = (fecha) => fecha.toISOString().split('T')[0];

      url += `&with_release_type=2|3&release_date.gte=${formatear(haceUnMes)}&release_date.lte=${formatear(hoy)}`;
    } else if (plataforma) {
      url += `&with_watch_providers=${plataforma}&watch_region=AR`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (requestId !== lastRequestId) return;

    mostrarPeliculas(data.results);
  } catch (error) {
    if (requestId !== lastRequestId) return;
    console.error('Error al aplicar filtros:', error);
    resultsContainer.innerHTML = '<p class="status-msg">Hubo un error al aplicar los filtros.</p>';
  }
}

[filterGenero, filterPlataforma, filterAnio, filterDuracion].forEach(select => {
  if (!select) return;
  select.addEventListener('change', () => {
    clearTimeout(debounceTimer);
    if (searchInput) searchInput.value = '';
    aplicarFiltros();
  });
});

if (filterReset) {
  filterReset.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    limpiarFiltros(true);
  });
}

/* ==========================================================
   MODAL DE DETALLE DE PELÍCULA
   ========================================================== */

// Pide a TMDB toda la info de una película: ficha técnica, reparto
// (credits) y dónde verla (watch/providers), todo en un solo pedido.
async function abrirDetallePelicula(id) {
  if (!movieModalOverlay || !movieModalContent) return;

  movieModalContent.innerHTML = '<p class="status-msg">Cargando información...</p>';
  movieModalOverlay.classList.add('active');
  document.body.classList.add('modal-open');

  try {
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES&append_to_response=credits,watch/providers`
    );
    const data = await response.json();

    if (data.success === false) {
      movieModalContent.innerHTML = '<p class="status-msg">No se pudo cargar la información de esta película.</p>';
      return;
    }

    movieModalContent.innerHTML = construirHTMLDetalle(data);
  } catch (error) {
    console.error('Error al cargar el detalle de la película:', error);
    movieModalContent.innerHTML = '<p class="status-msg">Hubo un error al cargar la información.</p>';
  }
}

function cerrarDetallePelicula() {
  if (!movieModalOverlay) return;
  movieModalOverlay.classList.remove('active');
  document.body.classList.remove('modal-open');
  movieModalContent.innerHTML = '';
}

if (movieModalClose) {
  movieModalClose.addEventListener('click', cerrarDetallePelicula);
}

if (movieModalOverlay) {
  // Cerrar al tocar el fondo oscuro, pero no al tocar adentro del modal.
  movieModalOverlay.addEventListener('click', (e) => {
    if (e.target === movieModalOverlay) cerrarDetallePelicula();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarDetallePelicula();
});

// Minutos -> "2h 15min"
function formatearDuracion(minutos) {
  if (!minutos) return '';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
}

// Arma los logitos de plataformas (streaming / alquiler / compra) para
// la región de Argentina, usando el bloque watch/providers de TMDB.
function construirHTMLProveedores(proveedoresAR) {
  if (!proveedoresAR) {
    return '<p class="movie-detail-noproviders">No encontramos información de disponibilidad para Argentina.</p>';
  }

  const secciones = [
    { key: 'flatrate', label: 'Streaming' },
    { key: 'rent', label: 'Alquiler' },
    { key: 'buy', label: 'Compra' },
  ];

  let html = '';

  secciones.forEach(seccion => {
    const proveedores = proveedoresAR[seccion.key];
    if (proveedores && proveedores.length > 0) {
      html += `
        <div class="watch-group">
          <span class="watch-group-label">${seccion.label}:</span>
          <div class="watch-logos">
            ${proveedores.map(p => `
              <img
                src="https://image.tmdb.org/t/p/w45${p.logo_path}"
                alt="${p.provider_name}"
                title="${p.provider_name}"
                class="watch-logo"
              >
            `).join('')}
          </div>
        </div>
      `;
    }
  });

  if (!html) {
    html = '<p class="movie-detail-noproviders">No encontramos dónde verla en streaming, alquiler o compra en Argentina.</p>';
  }

  // TMDB pide dar crédito a JustWatch cuando se muestra esta data.
  if (proveedoresAR.link) {
    html += `<a href="${proveedoresAR.link}" target="_blank" rel="noopener" class="watch-jw-link">Ver todas las opciones (JustWatch) →</a>`;
  }

  return html;
}

// Arma todo el HTML interno del modal a partir de la respuesta de TMDB.
function construirHTMLDetalle(data) {
  const poster = data.poster_path
    ? `${IMAGE_URL}${data.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

  const anio = data.release_date ? data.release_date.split('-')[0] : 'N/A';
  const duracion = formatearDuracion(data.runtime);
  const generos = (data.genres || []).map(g => g.name).join(' · ') || 'Sin datos';
  const puntaje = data.vote_average ? `${data.vote_average.toFixed(1)}/10` : 'Sin puntaje';

  const director = data.credits && data.credits.crew
    ? data.credits.crew.find(persona => persona.job === 'Director')
    : null;

  const reparto = data.credits && data.credits.cast
    ? data.credits.cast.slice(0, 8)
    : [];

  const proveedoresAR = data['watch/providers'] && data['watch/providers'].results
    ? data['watch/providers'].results.AR
    : null;

  return `
    <div class="movie-detail">
      <img class="movie-detail-poster" src="${poster}" alt="${data.title}">

      <div class="movie-detail-info">
        <h2 class="movie-detail-title">${data.title}</h2>
        ${data.tagline ? `<p class="movie-detail-tagline">"${data.tagline}"</p>` : ''}

        <div class="movie-detail-meta">
          <span>${anio}</span>
          ${duracion ? `<span>${duracion}</span>` : ''}
          <span>⭐ ${puntaje}</span>
        </div>

        <p class="movie-detail-genres">${generos}</p>

        <p class="movie-detail-overview">${data.overview || 'Sin sinopsis disponible.'}</p>

        ${director ? `<p class="movie-detail-director"><strong>Dirección:</strong> ${director.name}</p>` : ''}

        ${reparto.length > 0 ? `
          <div class="movie-detail-cast">
            <strong>Reparto:</strong>
            <p>${reparto.map(actor => actor.name).join(', ')}</p>
          </div>
        ` : ''}

        <div class="movie-detail-watch">
          <strong>Dónde verla:</strong>
          ${construirHTMLProveedores(proveedoresAR)}
        </div>
      </div>
    </div>
  `;
}