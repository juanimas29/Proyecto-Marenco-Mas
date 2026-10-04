(function () {
  const btnInscribir = document.getElementById('btnInscribir');
  const msg = document.getElementById('semTicketMsg');
  const fine = document.getElementById('semTicketFine');
  const payWrap = document.getElementById('semPayWrap');
  const authGate = document.getElementById('semAuthGate');

  if (!btnInscribir) return; 

  
  function personaEsInvitada() {
    return window.Cinemorfosis ? window.Cinemorfosis.isGuest() : true;
  }

 
  const archivo = decodeURIComponent(window.location.pathname.split('/').pop());
  const eventoId = archivo.replace(/\.html?$/i, '') || 'seminario';

  function textoDeIcono(nombre) {
    const icono = document.querySelector(
      `.sem-ticket-details ion-icon[name="${nombre}"]`
    );
    return icono ? icono.parentElement.textContent.trim() : '';
  }

  function datosDelSeminario() {
    const texto = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : '';
    };
    const banner = document.querySelector('.sem-hero-banner ion-icon');

    return {
      id: eventoId,
      title: texto('.sem-detail-main h1'),
      category: texto('.sem-detail-main .sem-card-tag'),
      icon: banner ? banner.getAttribute('name') : 'ticket-outline',
      date: textoDeIcono('calendar-outline'),
      duration: textoDeIcono('time-outline'),
      place: textoDeIcono('navigate-outline'),
      price: texto('.sem-ticket-price .value'),
      page: 'Seminarios/' + archivo, 
    };
  }

  // Guarda la inscripción y deja el botón en estado "confirmada".
  function confirmarInscripcion(mensaje) {
    if (window.Cinemorfosis) window.Cinemorfosis.registerEvent(datosDelSeminario());
    mostrarInscripcionConfirmada(mensaje);
  }

  function mostrarInscripcionConfirmada(mensaje) {
    btnInscribir.hidden = false;
    btnInscribir.disabled = true;
    btnInscribir.textContent = 'Inscripción confirmada ✓';
    if (payWrap) payWrap.hidden = true;
    if (fine) fine.hidden = true;
    if (msg) msg.textContent = mensaje;
  }

  const MENSAJE_YA_INSCRIPTO = 'Ya estás inscripto/a. Lo ves en "Mis eventos".';

  
  if (
    window.Cinemorfosis &&
    !window.Cinemorfosis.isGuest() &&
    window.Cinemorfosis.isRegisteredToEvent(eventoId)
  ) {
    mostrarInscripcionConfirmada(MENSAJE_YA_INSCRIPTO);
    return;
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
   
    btnInscribir.addEventListener('click', () => {
      if (personaEsInvitada()) {
        mostrarBarreraDeLogin();
        return;
      }
      confirmarInscripcion(
        'Te enviamos la confirmación con todos los detalles. Lo ves en "Mis eventos".'
      );
    });
    return;
  }

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


    btnPagar.disabled = true;
    btnPagar.textContent = 'Procesando pago...';

    setTimeout(() => {
      confirmarInscripcion(
        'Te enviamos el comprobante y la confirmación por email. Lo ves en "Mis eventos".'
      );
    }, 1200);
  });
})();