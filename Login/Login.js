const wrapper = document.querySelector('.wrapper');

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

  setTimeout(() => {
      window.location.href = '../Inicio/Inicio.html';
    }, 1000);
  } else {
    signInMessage.textContent = 'Usuario o contraseña incorrectos';
    signInMessage.className = 'form-message error';
  }
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