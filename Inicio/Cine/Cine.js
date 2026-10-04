document.addEventListener('DOMContentLoaded', () => {
  const TMDB_API_KEY = 'f5e63df2afa3ae459863c535bd3f8a62';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';


  const COMPLEJOS = [
    {
      id: 'cinemark-hoyts',
      nombre: 'Cinemark Hoyts',
      url: 'https://www.cinemark.com.ar/',
      cadena: 'cinemark',
    },
    {
      id: 'showcase',
      nombre: 'Showcase Cinemas',
      url: 'https://www.todoshowcase.com/',
    },
    {
      id: 'cines-dino',
      nombre: 'Cines Dino',
      url: 'https://cinesdino.com.ar/compra_ingresso_online_new/',
    },
    {
      id: 'cinemacenter',
      nombre: 'Cinemacenter',
      url: 'https://www.cinemacenter.com.ar/cartelera#contenido',
    },
    {
      id: 'gran-rex',
      nombre: 'Cines Gran Rex',
      url: 'http://cinesgranrex.com.ar/',
    },
    {
      id: 'las-tipas',
      nombre: 'Las Tipas',
      url: 'https://cordoba.lastipas.com.ar/es-AR',
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

  const movieSelect = document.getElementById('cineMovieSelect');
  const complejoSelect = document.getElementById('cineComplejoSelect');
  const infoChip = document.getElementById('cineInfoChip');
  const infoChipText = document.getElementById('cineInfoChipText');
  const cineForm = document.getElementById('cineSelectorForm');


  const peliculasPorId = {};


  function crearDesplegable(select) {
    if (!select) return;

    const wrap = document.createElement('div');
    wrap.className = 'cselect';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add('cselect-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cselect-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.className = 'cselect-label';
    btn.appendChild(label);

    const list = document.createElement('ul');
    list.className = 'cselect-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;

    wrap.appendChild(btn);
    wrap.appendChild(list);

    function items() {
      return Array.from(list.querySelectorAll('li'));
    }

    function render() {
      list.innerHTML = '';
      const primera = select.options[0];
      const placeholder = primera && primera.value === '' ? primera.textContent : '';

      Array.from(select.options).forEach((opt) => {
        if (opt.value === '') return; // el placeholder no es una opción elegible
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.tabIndex = -1;
        li.dataset.value = opt.value;
        li.textContent = opt.textContent;
        if (opt.value === select.value) {
          li.classList.add('selected');
          li.setAttribute('aria-selected', 'true');
        }
        li.addEventListener('click', () => elegir(opt.value));
        list.appendChild(li);
      });

      const elegida = select.options[select.selectedIndex];
      label.textContent = select.value && elegida ? elegida.textContent : placeholder;
      btn.classList.toggle('is-placeholder', !select.value);
    }

    function abrir() {
      if (!list.children.length) return;
      list.hidden = false;
      wrap.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      const actual = list.querySelector('.selected');
      if (actual) actual.scrollIntoView({ block: 'nearest' });
    }

    function cerrar() {
      list.hidden = true;
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    function elegir(valor) {
      select.value = valor;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      render();
      cerrar();
      btn.focus();
    }

    function enfocarItem(indice) {
      const lista = items();
      if (!lista.length) return;
      const i = Math.max(0, Math.min(lista.length - 1, indice));
      lista[i].focus();
      lista[i].scrollIntoView({ block: 'nearest' });
    }

    btn.addEventListener('click', () => (list.hidden ? abrir() : cerrar()));

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        abrir();
        const lista = items();
        const sel = lista.findIndex((li) => li.classList.contains('selected'));
        enfocarItem(sel >= 0 ? sel : 0);
      }
    });

    list.addEventListener('keydown', (e) => {
      const lista = items();
      const i = lista.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        enfocarItem(i + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        enfocarItem(i - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (i >= 0) elegir(lista[i].dataset.value);
      } else if (e.key === 'Escape') {
        cerrar();
        btn.focus();
      }
    });

    // Cerrar al hacer click afuera
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) cerrar();
    });

   
    new MutationObserver(render).observe(select, { childList: true });

    render();
  }

  crearDesplegable(movieSelect);
  crearDesplegable(complejoSelect);

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

  function llenarSelectConRespaldo() {
    if (!movieSelect) return;
    movieSelect.innerHTML = '<option value="" disabled selected hidden>Elegí una película</option>';
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

      movieSelect.innerHTML = '<option value="" disabled selected hidden>Elegí una película</option>';
      resultados.forEach((peli) => {
        peliculasPorId[peli.id] = peli;
        const opt = document.createElement('option');
        opt.value = peli.id;
        opt.textContent = peli.title;
        movieSelect.appendChild(opt);
      });
    } catch (error) {
      
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

  if (cineForm) {
    cineForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const peliTitulo = movieSelect.options[movieSelect.selectedIndex]
        ? movieSelect.options[movieSelect.selectedIndex].textContent
        : '';
      const complejo = COMPLEJOS.find((c) => c.id === complejoSelect.value);

      if (!movieSelect.value || !complejo) {
        if (infoChipText) {
          infoChipText.textContent = 'Elegí una película y un complejo para continuar.';
          infoChip.classList.add('visible');
        }
        return;
      }

      
      // Cinemark: link directo a la película elegida. Otras cadenas:
      // cartelera general del complejo.
      const esCinemark = complejo.cadena === 'cinemark';
      const destino = esCinemark ? urlCinemarkPelicula(peliTitulo) : complejo.url;
      window.open(destino, '_blank', 'noopener');

      if (infoChipText) {
        infoChipText.textContent = esCinemark
          ? `Te abrimos "${peliTitulo}" en Cinemark. Elegí ahí el complejo, el día y tus asientos. Si la página no existe, buscala en cinemark.com.ar.`
          : `Te abrimos la cartelera de ${complejo.nombre}. Buscá "${peliTitulo}" y elegí ahí el día y tu función.`;
        infoChip.classList.add('visible');
      }
    });
  }
});