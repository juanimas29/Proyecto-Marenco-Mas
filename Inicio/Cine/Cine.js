// ===================================================================
// SELECTOR DE ENTRADAS DE CINE
//
// Esto NO compra entradas de forma automática: ningún cine de Córdoba
// ofrece una API pública para reservar butacas desde afuera. Lo que
// hacemos acá es ayudar a elegir película + complejo + día + horario,
// y después mandar a la persona directo a la cartelera oficial de ese
// complejo (en una pestaña nueva) para que termine la compra ahí.
//
// Todo el código está adentro de DOMContentLoaded y cada bloque tiene
// su propio try/catch a propósito: si un pedido a TMDB falla, el
// resto del formulario (complejo, día, horario) tiene que seguir
// funcionando igual.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  const TMDB_API_KEY = 'f5e63df2afa3ae459863c535bd3f8a62';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  // Complejos de cine que efectivamente operan en Córdoba Capital hoy.
  // El link lleva a la cartelera/venta oficial de la cadena: no
  // tenemos forma de armar un link directo a "esta función de esta
  // película en esta sala" porque esa parte vive en el sistema
  // interno de cada cine.
  //
  // cadena: 'cinemark' => al elegir el complejo se abre directo la
  // página de la película en Cinemark (ver urlCinemarkPelicula).
  const COMPLEJOS = [
    {
      id: 'hoyts-nuevocentro',
      nombre: 'Cinemark Hoyts · Nuevocentro Shopping',
      url: 'https://www.cinemark.com.ar/',
      cadena: 'cinemark',
    },
    {
      id: 'hoyts-patio-olmos',
      nombre: 'Cinemark Hoyts · Patio Olmos',
      url: 'https://www.cinemark.com.ar/',
      cadena: 'cinemark',
    },
    {
      id: 'showcase-cordoba',
      nombre: 'Showcase Cinemas · Villa Cabrera',
      url: 'https://www.todoshowcase.com/',
    },
    {
      id: 'showcase-villa-allende',
      nombre: 'Showcase Cinemas · Villa Allende',
      url: 'https://www.todoshowcase.com/',
    },
  ];

  // Cartelera de respaldo, por si TMDB no responde (caída del
  // servicio, sin internet, un bloqueador de contenido, etc.). Así el
  // select de película nunca queda vacío.
  const CARTELERA_RESPALDO = [
    'La Odisea',
    'Spider-Man: Un Nuevo Día',
    'Resident Evil',
    'Prácticamente Magia 2',
    'Zootopia 2',
    'Los Juegos del Hambre: Amanecer en la Cosecha',
    'Avengers: Endgame (reestreno)',
    'Moana (acción real)',
  ];

  // Cinemark arma la URL de cada película así:
  //   https://www.cinemark.com.ar/pelicula/resident-evil-noche-cero
  // Si el título de TMDB no coincide con el que usa Cinemark, agregá
  // acá la excepción:  'Título en TMDB': 'slug-en-cinemark'
  const CINEMARK_PELICULA_BASE = 'https://www.cinemark.com.ar/pelicula/';
  const SLUGS_CINEMARK = {
    // 'Spider-Man: Un Nuevo Día': 'spider-man-un-nuevo-dia',
  };

  // "Resident Evil: Noche cero" -> "resident-evil-noche-cero"
  function slugify(texto) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function urlCinemarkPelicula(titulo) {
    return CINEMARK_PELICULA_BASE + (SLUGS_CINEMARK[titulo] || slugify(titulo));
  }

  const HORARIOS_LABEL = {
    manana: 'Mañana (hasta 13 hs)',
    tarde: 'Tarde (13 a 19 hs)',
    noche: 'Noche (desde 19 hs)',
  };

  const movieSelect = document.getElementById('cineMovieSelect');
  const complejoSelect = document.getElementById('cineComplejoSelect');
  const diaSelect = document.getElementById('cineDiaSelect');
  const horarioSelect = document.getElementById('cineHorarioSelect');
  const infoChip = document.getElementById('cineInfoChip');
  const infoChipText = document.getElementById('cineInfoChipText');
  const cineForm = document.getElementById('cineSelectorForm');

  // id de TMDB -> objeto película, para mostrar duración/estreno
  // cuando corresponda.
  const peliculasPorId = {};

  // --------------------------------------------------------------
  // 1) COMPLEJO: no depende de ninguna API, se arma siempre.
  // --------------------------------------------------------------
  try {
    if (complejoSelect) {
      COMPLEJOS.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre;
        complejoSelect.appendChild(opt);
      });
    }
  } catch (error) {
    console.error('Error al armar el select de complejos:', error);
  }

  // --------------------------------------------------------------
  // 2) DÍA: fechas reales (hoy + los próximos 6 días), tampoco
  //    depende de ninguna API.
  // --------------------------------------------------------------
  try {
    if (diaSelect) {
      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const hoy = new Date();

      for (let i = 0; i < 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);

        const diaSemana = dias[fecha.getDay()];
        const dd = String(fecha.getDate()).padStart(2, '0');
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');

        const opt = document.createElement('option');
        opt.value = fecha.toISOString().slice(0, 10); // yyyy-mm-dd
        opt.textContent =
          i === 0
            ? `Hoy · ${diaSemana} ${dd}/${mm}`
            : i === 1
              ? `Mañana · ${diaSemana} ${dd}/${mm}`
              : `${diaSemana} ${dd}/${mm}`;
        diaSelect.appendChild(opt);
      }
    }
  } catch (error) {
    console.error('Error al armar el select de días:', error);
  }

  // --------------------------------------------------------------
  // 3) PELÍCULA: se intenta traer la cartelera real de TMDB. Si
  //    falla, se usa la lista de respaldo para que el select nunca
  //    quede vacío ni "cargando" para siempre.
  // --------------------------------------------------------------
  function llenarSelectConRespaldo() {
    if (!movieSelect) return;
    movieSelect.innerHTML = '<option value="">Elegí una película</option>';
    CARTELERA_RESPALDO.forEach((titulo) => {
      const opt = document.createElement('option');
      opt.value = titulo;
      opt.textContent = titulo;
      movieSelect.appendChild(opt);
    });
  }

  async function cargarCarteleraCordoba() {
    if (!movieSelect) return;

    // Si TMDB tarda demasiado, cortamos el pedido y usamos respaldo.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=es-AR&region=AR&page=1`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error(`TMDB respondió ${res.status}`);

      const data = await res.json();
      const resultados = data.results || [];

      if (resultados.length === 0) throw new Error('TMDB devolvió cartelera vacía');

      movieSelect.innerHTML = '<option value="">Elegí una película</option>';
      resultados.forEach((peli) => {
        peliculasPorId[peli.id] = peli;
        const opt = document.createElement('option');
        opt.value = peli.id;
        opt.textContent = peli.title;
        movieSelect.appendChild(opt);
      });
    } catch (error) {
      // Dejamos el detalle en consola (F12 → Console) para poder
      // diagnosticar, y usamos la cartelera de respaldo para que el
      // formulario siga siendo usable.
      console.error('No se pudo cargar la cartelera de TMDB, uso respaldo:', error);
      llenarSelectConRespaldo();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function actualizarChipInfo() {
    if (!infoChip || !infoChipText || !movieSelect) return;

    const peli = peliculasPorId[movieSelect.value];
    if (!peli) {
      infoChip.classList.remove('visible');
      return;
    }

    const duracion = peli.runtime ? `${peli.runtime} min` : null;
    const estreno = peli.release_date
      ? new Date(peli.release_date).toLocaleDateString('es-AR')
      : 'sin fecha';

    infoChipText.textContent = duracion
      ? `${peli.title} · estreno ${estreno} · ${duracion}`
      : `${peli.title} · estreno ${estreno}`;
    infoChip.classList.add('visible');

    // TMDB no siempre trae "runtime" en el listado de "now playing"
    // (solo en el detalle de cada película), así que si falta lo
    // pedimos aparte la primera vez que se elige esa película.
    if (!peli.runtime) completarDuracion(peli.id);
  }

  async function completarDuracion(peliId) {
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/movie/${peliId}?api_key=${TMDB_API_KEY}&language=es-AR`
      );
      if (!res.ok) return;
      const detalle = await res.json();
      if (peliculasPorId[peliId]) {
        peliculasPorId[peliId].runtime = detalle.runtime;
        actualizarChipInfo();
      }
    } catch (error) {
      console.error('Error al pedir la duración de la película:', error);
    }
  }

  if (movieSelect) {
    movieSelect.addEventListener('change', actualizarChipInfo);
  }

  cargarCarteleraCordoba();

  // --------------------------------------------------------------
  // 4) ENVÍO DEL FORMULARIO
  // --------------------------------------------------------------
  if (cineForm) {
    cineForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const peliTitulo = movieSelect.options[movieSelect.selectedIndex]
        ? movieSelect.options[movieSelect.selectedIndex].textContent
        : '';
      const complejo = COMPLEJOS.find((c) => c.id === complejoSelect.value);
      const diaLabel = diaSelect.options[diaSelect.selectedIndex]
        ? diaSelect.options[diaSelect.selectedIndex].textContent
        : '';
      const horarioLabel = HORARIOS_LABEL[horarioSelect.value] || 'cualquier horario';

      if (!movieSelect.value || !complejo || !diaSelect.value) return;

      // Abrimos la cartelera oficial del complejo en una pestaña
      // nueva. No podemos completar la compra por él: cada cadena
      // maneja su propio sistema de butacas y no expone una forma de
      // integrarlo desde afuera.
      // Cinemark: link directo a la película elegida. Otras cadenas:
      // cartelera general del complejo.
      const esCinemark = complejo.cadena === 'cinemark';
      const destino = esCinemark ? urlCinemarkPelicula(peliTitulo) : complejo.url;
      window.open(destino, '_blank', 'noopener');

      if (infoChipText) {
        infoChipText.textContent = esCinemark
          ? `Te abrimos "${peliTitulo}" en Cinemark. Elegí ahí el complejo, el ${diaLabel} (${horarioLabel}) y tus asientos. Si la página no existe, buscala en cinemark.com.ar.`
          : `Te abrimos la cartelera de ${complejo.nombre}. Buscá "${peliTitulo}" para el ${diaLabel} (${horarioLabel}) y elegí ahí tu función.`;
        infoChip.classList.add('visible');
      }
    });
  }
});