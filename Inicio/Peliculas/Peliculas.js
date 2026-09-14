const API_KEY = 'f5e63df2afa3ae459863c535bd3f8a62';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('resultsContainer');

if (searchButton) {
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query !== '') {
      buscarPeliculas(query);
    }
  });
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query !== '') {
        buscarPeliculas(query);
      }
    }
  });
}

async function buscarPeliculas(query) {
  try {
    resultsContainer.innerHTML = '<p class="status-msg">Buscando películas...</p>';
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    mostrarPeliculas(data.results);
  } catch (error) {
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

    const poster = pelicula.poster_path 
      ? `${IMAGE_URL}${pelicula.poster_path}` 
      : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

    const anio = pelicula.release_date ? pelicula.release_date.split('-')[0] : 'N/A';

    card.innerHTML = `
      <img src="${poster}" alt="${pelicula.title}" class="movie-poster">
      <h4 class="movie-title">${pelicula.title}</h4>
      <p class="movie-year">${anio}</p>
    `;

    resultsContainer.appendChild(card);
  });
}