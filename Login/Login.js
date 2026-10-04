const wrapper = document.querySelector('.wrapper');

// Fondo collage con imagenes.

const cinemaImages = [
  '../Imagenes/Filmshoot.webp',
  '../Imagenes/Director Grabacion.webp',
  '../Imagenes/Direccion de Pelicula.webp',
  '../Imagenes/Guion.webp',
  '../Imagenes/Produccion Sonido.webp',
  '../Imagenes/Cine Contemporaneo Argentino.webp',
];

// Función que arma el bloque (fondo con imagenes).

function buildCinemaBackdrop() {
  const backdrop = document.getElementById('cinemaBackdrop');
  if (!backdrop) return;

  const tileSize = 170; 
  const overscan = 1.7;
  const cols = Math.ceil((window.innerWidth * overscan) / tileSize) + 1;
  const rows = Math.ceil((window.innerHeight * overscan) / tileSize) + 1;
  const total = cols * rows;

  backdrop.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const img = document.createElement('img');
    img.className = 'tile';
    img.src = cinemaImages[i % cinemaImages.length];
    img.alt = '';
    backdrop.appendChild(img);
  }
}

buildCinemaBackdrop();
window.addEventListener('resize', buildCinemaBackdrop);

// Si se llega desde otro link, manda a loguearte.

const initialView = window.location.hash.replace('#', '');
if (initialView === 'signup' || initialView === 'forgot') {
  wrapper.dataset.view = initialView;
}

// Cambios de panel por data-view

document.querySelectorAll('a[data-view], button[data-view]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.dataset.view = el.dataset.view;
  });
});

// Privacidad de contraseña (si se toca el ícono de ojo, cambia a puntos).

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('toggle-password')) {
    const icon = e.target;
    const inputGroup = icon.closest('.input-group');
    const input = inputGroup.querySelector('input');

    if (input.type === 'password') {
      input.type = 'text';
      icon.setAttribute('name', 'eye-off-outline');
    } else {
      input.type = 'password';
      icon.setAttribute('name', 'eye-outline');
    }
  }
});

// "Base de datos" de usuarios (se guarda en el navegador). 

const USERS_KEY = 'cinemorfosisUsers';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(text) {
  if (window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return 'plain:' + text; // respaldo si el navegador no soporta crypto.subtle
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = 'form-message' + (type ? ' ' + type : '');
}

// Formulario de inicio de sesión
const signInForm = document.getElementById('signInForm');
const signInMessage = document.getElementById('signInMessage');

signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Se puede ingresar con el nombre de usuario O con el email registrado.
  const identifier = normalize(document.getElementById('signInUser').value);
  const passHash = await hashPassword(
    document.getElementById('signInPassword').value
  );

  const account = loadUsers().find(
    (u) =>
      (normalize(u.user) === identifier || normalize(u.email) === identifier) &&
      u.passHash === passHash
  );

  if (account) {
    showMessage(signInMessage, '¡Bienvenido, ' + account.user + '! Iniciando sesión...', 'success');

    localStorage.setItem('cinemorfosisSession', 'user');
    localStorage.setItem('cinemorfosisCurrentUser', account.user);

    setTimeout(() => {
      window.location.href = '../Inicio/Inicio.html';
    }, 1000);
  } else {
    showMessage(signInMessage, 'Usuario o contraseña incorrectos', 'error');
  }
});

// Entrar como invitado.
const guestLink = document.getElementById('guestLink');

guestLink.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.setItem('cinemorfosisSession', 'guest');
  window.location.href = '../Inicio/Inicio.html';
});

// Formulario de registro
const signUpForm = document.getElementById('signUpForm');
const signUpMessage = document.getElementById('signUpMessage');

signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = document.getElementById('signUpUser').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value;

  const users = loadUsers();

  if (users.some((u) => normalize(u.user) === normalize(user))) {
    showMessage(signUpMessage, 'Ese nombre de usuario ya está en uso.', 'error');
    return;
  }
  if (users.some((u) => normalize(u.email) === normalize(email))) {
    showMessage(signUpMessage, 'Ya existe una cuenta con ese email.', 'error');
    return;
  }

  users.push({ user, email, passHash: await hashPassword(password) });
  saveUsers(users);

  showMessage(signUpMessage, '¡Cuenta creada con éxito! Ya podés iniciar sesión.', 'success');

  setTimeout(() => {
    signUpForm.reset();
    showMessage(signUpMessage, '', '');
    wrapper.dataset.view = 'signin';
  }, 1500);
});

// Formulario de "olvidaste tu contraseña"
const forgotForm = document.getElementById('forgotForm');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const forgotMessage = document.getElementById('forgotMessage');

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (newPassword.value !== confirmPassword.value) {
    showMessage(forgotMessage, 'Las contraseñas no coinciden.', 'error');
    return;
  }

  // El email tiene que ser el mismo con el que se registró la cuenta.
  const email = normalize(document.getElementById('forgotEmail').value);
  const users = loadUsers();
  const account = users.find((u) => normalize(u.email) === email);

  if (!account) {
    showMessage(forgotMessage, 'No encontramos ninguna cuenta con ese email.', 'error');
    return;
  }

  // Reemplaza la contraseña guardada.
  account.passHash = await hashPassword(newPassword.value);
  saveUsers(users);

  showMessage(forgotMessage, '¡Listo! Ya podés iniciar sesión con tu nueva contraseña.', 'success');

  setTimeout(() => {
    forgotForm.reset();
    showMessage(forgotMessage, '', '');
    wrapper.dataset.view = 'signin';
  }, 1500);
});