// Este mismo archivo se usa en las 6 páginas de detalle. No sabe nada
// de "qué seminario es": solo busca estos elementos por su id/clase
// en la página donde se cargó, y si los encuentra, los hace funcionar.
//
//  - #btnInscribir            -> el botón "Inscribirme"
//  - #semPayWrap (opcional)   -> el bloque del formulario de pago.
//                                Si NO existe, es un seminario gratuito
//                                y el botón confirma directo.
//                                Si SÍ existe, es un seminario pago
//                                y el botón revela el formulario.

(function () {
  const btnInscribir = document.getElementById('btnInscribir');
  const msg = document.getElementById('semTicketMsg');
  const fine = document.getElementById('semTicketFine');
  const payWrap = document.getElementById('semPayWrap');
  const authGate = document.getElementById('semAuthGate');

  if (!btnInscribir) return; // esta página no tiene ticket, no hacemos nada

  // Cinemorfosis.isGuest() viene de Inicio.js (se carga antes que este
  // archivo en el HTML). Si por algún motivo no está disponible,
  // tratamos a la persona como invitada por las dudas.
  function personaEsInvitada() {
    return window.Cinemorfosis ? window.Cinemorfosis.isGuest() : true;
  }

  // Si es invitado: oculta el botón (y el formulario de pago, si lo
  // hubiera) y muestra el aviso de "necesitás una cuenta".
  function mostrarBarreraDeLogin() {
    btnInscribir.hidden = true;
    if (fine) fine.hidden = true;
    if (payWrap) payWrap.hidden = true;
    if (authGate) authGate.hidden = false;
  }

  if (!payWrap) {
    // ---------- Seminario GRATUITO: confirmar directo ----------
    btnInscribir.addEventListener('click', () => {
      if (personaEsInvitada()) {
        mostrarBarreraDeLogin();
        return;
      }
      btnInscribir.disabled = true;
      btnInscribir.textContent = 'Inscripción confirmada ✓';
      if (msg) msg.textContent = 'Te enviamos la confirmación con todos los detalles.';
    });
    return;
  }

  // ---------- Seminario PAGO: mostrar el formulario de pago ----------
  const form = document.getElementById('semPayForm');
  const numberInput = document.getElementById('cardNumber');
  const expiryInput = document.getElementById('cardExpiry');
  const cvvInput = document.getElementById('cardCvv');
  const nameInput = document.getElementById('cardName');
  const error = document.getElementById('semPayError');
  const btnPagar = document.getElementById('btnPagar');
  const btnCancelar = document.getElementById('btnCancelarPago');

  const previewNumber = document.getElementById('previewNumber');
  const previewName = document.getElementById('previewName');
  const previewExpiry = document.getElementById('previewExpiry');

  // Tocar "Inscribirme" oculta el botón y muestra el formulario
  // (o la barrera de login, si todavía no inició sesión)
  btnInscribir.addEventListener('click', () => {
    if (personaEsInvitada()) {
      mostrarBarreraDeLogin();
      return;
    }
    btnInscribir.hidden = true;
    if (fine) fine.hidden = true;
    payWrap.hidden = false;
  });

  // Cancelar vuelve todo para atrás
  btnCancelar.addEventListener('click', () => {
    payWrap.hidden = true;
    btnInscribir.hidden = false;
    if (fine) fine.hidden = false;
    error.textContent = '';
  });

  // Formatea el número de tarjeta en grupos de 4 mientras se escribe
  numberInput.addEventListener('input', () => {
    const digits = numberInput.value.replace(/\D/g, '').slice(0, 16);
    numberInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
    previewNumber.textContent = digits.length
      ? numberInput.value.padEnd(19, '•')
      : '•••• •••• •••• ••••';
  });

  // Formatea el vencimiento como MM/AA
  expiryInput.addEventListener('input', () => {
    let digits = expiryInput.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    expiryInput.value = digits;
    previewExpiry.textContent = digits || 'MM/AA';
  });

  // El CVV solo acepta números
  cvvInput.addEventListener('input', () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, '').slice(0, 4);
  });

  // El nombre se refleja en mayúsculas en la tarjeta de vista previa
  nameInput.addEventListener('input', () => {
    previewName.textContent = nameInput.value.trim()
      ? nameInput.value.toUpperCase()
      : 'NOMBRE APELLIDO';
  });

  // Validación simple al enviar el formulario
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    error.textContent = '';

    const digits = numberInput.value.replace(/\D/g, '');
    const [mm, yy] = expiryInput.value.split('/');
    const now = new Date();
    const currentYY = now.getFullYear() % 100;
    const currentMM = now.getMonth() + 1;
    const monthNum = Number(mm);
    const yearNum = Number(yy);

    if (digits.length !== 16) {
      error.textContent = 'Revisá el número de tarjeta, debe tener 16 dígitos.';
      return;
    }
    if (!mm || !yy || yy.length !== 2 || monthNum < 1 || monthNum > 12) {
      error.textContent = 'Revisá la fecha de vencimiento (MM/AA).';
      return;
    }
    if (yearNum < currentYY || (yearNum === currentYY && monthNum < currentMM)) {
      error.textContent = 'La tarjeta que ingresaste figura vencida.';
      return;
    }
    if (cvvInput.value.length < 3) {
      error.textContent = 'El CVV debe tener 3 o 4 dígitos.';
      return;
    }
    if (!nameInput.value.trim()) {
      error.textContent = 'Ingresá el nombre del titular de la tarjeta.';
      return;
    }

    // Todo OK: simulamos el procesamiento del pago
    btnPagar.disabled = true;
    btnPagar.textContent = 'Procesando pago...';

    setTimeout(() => {
      payWrap.hidden = true;
      if (fine) fine.hidden = false;
      if (msg) msg.textContent = 'Te enviamos el comprobante y la confirmación por email.';
    }, 1200);
  });
})();
