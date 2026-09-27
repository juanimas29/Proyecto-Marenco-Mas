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

// Formulario de inicio de sesión
const signInForm = document.getElementById('signInForm');
const signInMessage = document.getElementById('signInMessage');

signInForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = document.getElementById('signInUser').value;
  const pass = document.getElementById('signInPassword').value;

  if (user === 'Usuario' && pass === '123') {
  signInMessage.textContent = '¡Bienvenido! Iniciando sesión...';
  signInMessage.className = 'form-message success';

  localStorage.setItem('cinemorfosisSession', 'user');

  setTimeout(() => {
      window.location.href = '../Inicio/Inicio.html';
    }, 1000);
  } else {
    signInMessage.textContent = 'Usuario o contraseña incorrectos';
    signInMessage.className = 'form-message error';
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

signUpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  signUpMessage.textContent = '¡Cuenta creada con éxito! Ya podés iniciar sesión.';
  signUpMessage.className = 'form-message success';

  setTimeout(() => {
    signUpForm.reset();
    signUpMessage.textContent = '';
    signUpMessage.className = 'form-message';
    wrapper.dataset.view = 'signin';
  }, 1500);
});

// Formulario de "olvidaste tu contraseña"
const forgotForm = document.getElementById('forgotForm');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const forgotMessage = document.getElementById('forgotMessage');

forgotForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (newPassword.value !== confirmPassword.value) {
    forgotMessage.textContent = 'Las contraseñas no coinciden.';
    forgotMessage.className = 'form-message error';
    return;
  }

  forgotMessage.textContent = '¡Listo! Ya podés iniciar sesión con tu nueva contraseña.';
  forgotMessage.className = 'form-message success';

  setTimeout(() => {
    forgotForm.reset();
    forgotMessage.textContent = '';
    forgotMessage.className = 'form-message';
    wrapper.dataset.view = 'signin';
  }, 1500);
});