(function () {
  const gate = document.getElementById('pfGate');
  const missing = document.getElementById('pfMissing');
  const content = document.getElementById('pfContent');

  const C = window.Cinemorfosis;

  // Mismas claves que usan Login.js e Inicio.js
  const SESSION_KEY = 'cinemorfosisSession';
  const CURRENT_USER_KEY = 'cinemorfosisCurrentUser';
  const USERS_KEY = 'cinemorfosisUsers';
  const EVENTS_KEY = 'cinemorfosisEvents';
  const LOGIN_URL = '../Login/Login.html';

  // Invitados: no tienen perfil
  if (!C || C.isGuest()) {
    gate.hidden = false;
    return;
  }

  // ---------- Utilidades (copiadas de Login.js para hashear igual) ----------
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

  function loadAllEvents() {
    try {
      return JSON.parse(localStorage.getItem(EVENTS_KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  function saveAllEvents(all) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(all));
  }

  async function hashPassword(text) {
    if (window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    return 'plain:' + text;
  }

  function normalize(value) {
    return (value || '').trim().toLowerCase();
  }

  function showMessage(el, text, type) {
    el.textContent = text;
    el.className = 'pf-message' + (type ? ' ' + type : '');
  }

  // ---------- Cuenta actual ----------
  const users = loadUsers();
  const currentName = localStorage.getItem(CURRENT_USER_KEY);
  const account = users.find((u) => normalize(u.user) === normalize(currentName));

  if (!account) {
    // Sesión vieja o cuenta que ya no existe: limpiamos y pedimos volver a entrar
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    missing.hidden = false;
    return;
  }

  content.hidden = false;

  // ---------- Elementos ----------
  const pfInitial = document.getElementById('pfInitial');
  const pfName = document.getElementById('pfName');
  const pfEmail = document.getElementById('pfEmail');
  const pfSince = document.getElementById('pfSince');
  const logoutBtn = document.getElementById('logoutBtn');
  const pfStatTotal = document.getElementById('pfStatTotal');
  const pfStatUpcoming = document.getElementById('pfStatUpcoming');

  const profileForm = document.getElementById('profileForm');
  const pfUser = document.getElementById('pfUser');
  const pfMail = document.getElementById('pfMail');
  const profileMessage = document.getElementById('profileMessage');

  const passwordForm = document.getElementById('passwordForm');
  const pfCurrentPass = document.getElementById('pfCurrentPass');
  const pfNewPass = document.getElementById('pfNewPass');
  const pfConfirmPass = document.getElementById('pfConfirmPass');
  const passwordMessage = document.getElementById('passwordMessage');

  const deleteStart = document.getElementById('deleteStart');
  const deleteForm = document.getElementById('deleteForm');
  const deleteCancel = document.getElementById('deleteCancel');
  const pfDeletePass = document.getElementById('pfDeletePass');
  const deleteMessage = document.getElementById('deleteMessage');

  // ---------- Resumen ----------
  const MESES = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9,
    noviembre: 10, diciembre: 11,
  };

  function parsearFecha(texto) {
    const m = /(\d{1,2})\s+de\s+([a-záéíóú]+),?\s+(\d{4})/i.exec(texto || '');
    if (!m) return null;
    const mes = MESES[m[2].toLowerCase()];
    if (mes === undefined) return null;
    return new Date(Number(m[3]), mes, Number(m[1]));
  }

  function renderSummary() {
    pfInitial.textContent = (account.user || '?').trim().charAt(0) || '?';
    pfName.textContent = account.user;
    pfEmail.textContent = account.email;

    // Las cuentas creadas antes de esta versión no tienen fecha guardada
    const created = account.createdAt ? new Date(account.createdAt) : null;
    pfSince.textContent =
      created && !isNaN(created)
        ? created.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'fecha no disponible';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const mine = C.getMyEvents();
    const upcoming = mine.filter((ev) => {
      const f = parsearFecha(ev.date);
      return !f || f >= hoy; // si no se puede leer la fecha, lo contamos como próximo
    });

    pfStatTotal.textContent = mine.length;
    pfStatUpcoming.textContent = upcoming.length;
  }

  function fillForm() {
    pfUser.value = account.user;
    pfMail.value = account.email;
  }

  renderSummary();
  fillForm();

  // ---------- Cerrar sesión ----------
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = LOGIN_URL;
  });

  // ---------- Ver / ocultar contraseña ----------
  document.querySelectorAll('.pf-eye').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.pf-input').querySelector('input');
      const icon = btn.querySelector('ion-icon');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      icon.setAttribute('name', show ? 'eye-off-outline' : 'eye-outline');
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });

  // ---------- Guardar datos de la cuenta ----------
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newUser = pfUser.value.trim();
    const newEmail = pfMail.value.trim();

    if (!newUser) {
      showMessage(profileMessage, 'El nombre de usuario no puede estar vacío.', 'error');
      return;
    }
    if (!newEmail || !pfMail.checkValidity()) {
      showMessage(profileMessage, 'Ingresá un email válido.', 'error');
      return;
    }

    if (newUser === account.user && newEmail === account.email) {
      showMessage(profileMessage, 'No hay cambios para guardar.', '');
      return;
    }

    // No puede coincidir con OTRA cuenta (la propia sí)
    const others = users.filter((u) => u !== account);
    if (others.some((u) => normalize(u.user) === normalize(newUser))) {
      showMessage(profileMessage, 'Ese nombre de usuario ya está en uso.', 'error');
      return;
    }
    if (others.some((u) => normalize(u.email) === normalize(newEmail))) {
      showMessage(profileMessage, 'Ya existe una cuenta con ese email.', 'error');
      return;
    }

    // Las inscripciones se guardan bajo el nombre de usuario en minúsculas:
    // si cambia el nombre, hay que mover las inscripciones a la clave nueva.
    const oldKey = normalize(account.user);
    const newKey = normalize(newUser);
    if (oldKey !== newKey) {
      const all = loadAllEvents();
      if (all[oldKey]) {
        all[newKey] = all[oldKey];
        delete all[oldKey];
        saveAllEvents(all);
      }
    }

    account.user = newUser;
    account.email = newEmail;
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, newUser);

    renderSummary();
    showMessage(profileMessage, '¡Datos actualizados!', 'success');
  });

  // ---------- Cambiar contraseña ----------
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const current = pfCurrentPass.value;
    const next = pfNewPass.value;
    const confirm = pfConfirmPass.value;

    if (!current || !next || !confirm) {
      showMessage(passwordMessage, 'Completá todos los campos.', 'error');
      return;
    }

    if ((await hashPassword(current)) !== account.passHash) {
      showMessage(passwordMessage, 'La contraseña actual es incorrecta.', 'error');
      return;
    }
    if (next.length < 6) {
      showMessage(passwordMessage, 'La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (next !== confirm) {
      showMessage(passwordMessage, 'Las contraseñas nuevas no coinciden.', 'error');
      return;
    }
    if (next === current) {
      showMessage(passwordMessage, 'La nueva contraseña tiene que ser distinta de la actual.', 'error');
      return;
    }

    account.passHash = await hashPassword(next);
    saveUsers(users);

    passwordForm.reset();
    showMessage(passwordMessage, '¡Contraseña actualizada!', 'success');
  });

  // ---------- Eliminar cuenta ----------
  deleteStart.addEventListener('click', () => {
    deleteStart.hidden = true;
    deleteForm.hidden = false;
    pfDeletePass.focus();
  });

  deleteCancel.addEventListener('click', () => {
    deleteForm.reset();
    showMessage(deleteMessage, '', '');
    deleteForm.hidden = true;
    deleteStart.hidden = false;
  });

  deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if ((await hashPassword(pfDeletePass.value)) !== account.passHash) {
      showMessage(deleteMessage, 'La contraseña es incorrecta.', 'error');
      return;
    }

    // Borramos la cuenta y sus inscripciones
    saveUsers(users.filter((u) => u !== account));

    const all = loadAllEvents();
    delete all[normalize(account.user)];
    saveAllEvents(all);

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);

    showMessage(deleteMessage, 'Cuenta eliminada. Redirigiendo...', 'success');
    setTimeout(() => {
      window.location.href = LOGIN_URL;
    }, 1200);
  });
})();