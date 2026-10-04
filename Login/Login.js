const wrapper = document.querySelector('.wrapper');

// ===== Fondo mosaico tipo "pared de cine" =====
const cinemaImages = [
  '../Imagenes/filmshoot.webp',
  '../Imagenes/cinematographic photography.webp',
  '../Imagenes/direcciondepeliculas.webp',
  '../Imagenes/screanplay.webp',
  '../Imagenes/soundproduction.webp',
  '../Imagenes/cinecontemporaneoargentino.webp',
];

function buildCinemaBackdrop() {
  const backdrop = document.getElementById('cinemaBackdrop');
  if (!backdrop) return;

  const tileSize = 170; // debe coincidir con grid-auto-rows / minmax del CSS
  // Factor extra porque el mosaico está rotado y escalado (rotate + scale en el CSS)
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

// Si llegamos desde otra página con un link tipo Login.html#signup
// (por ejemplo, desde "Crear una cuenta" al querer inscribirte a un
// seminario sin estar logueado), abrimos directamente ese panel.
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

// Event listener para los ojitos de contraseña
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

// ===== "Base de datos" de usuarios =====
// Todavía no hay backend, así que las cuentas registradas se guardan en
// localStorage (clave 'cinemorfosisUsers'). Cada cuenta es:
//   { user, email, passHash }
// La contraseña nunca se guarda en texto plano: se guarda su hash SHA-256.
// Cuando haya backend real, solo hay que reemplazar estas funciones.
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
  // crypto.subtle solo existe en contextos seguros (https / localhost).
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

// Entrar como invitado: se puede recorrer el sitio, pero más
// adelante (comprar entradas, inscribirse a un seminario) se va a
// pedir iniciar sesión o registrarse.
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

  // Reemplaza la contraseña guardada: desde ahora se entra con la nueva.
  account.passHash = await hashPassword(newPassword.value);
  saveUsers(users);

  showMessage(forgotMessage, '¡Listo! Ya podés iniciar sesión con tu nueva contraseña.', 'success');

  setTimeout(() => {
    forgotForm.reset();
    showMessage(forgotMessage, '', '');
    wrapper.dataset.view = 'signin';
  }, 1500);
});