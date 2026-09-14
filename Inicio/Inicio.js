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

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function isGuest() {
  return getSession() !== 'user';
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Si es invitado, cambiamos el contenido del menú de la personita:
// en vez de "Mi perfil / Mis tickets / Cerrar sesión" mostramos un
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
window.Cinemorfosis = {
  isGuest,
  getSession,
};

