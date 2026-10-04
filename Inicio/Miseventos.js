// Dibuja la lista de seminarios a los que la persona se inscribió.
// Los datos los guarda SeminarioDetalle.js (vía Inicio.js) cuando
// alguien confirma su inscripción; acá solo se leen y se muestran.

(function () {
  const list = document.getElementById('evList');
  const empty = document.getElementById('evEmpty');
  const gate = document.getElementById('evGate');
  const subtitle = document.getElementById('evSubtitle');

  const C = window.Cinemorfosis;

  // Invitado (o sin sesión): no tiene eventos, le pedimos que inicie sesión.
  if (!C || C.isGuest()) {
    gate.hidden = false;
    subtitle.hidden = true;
    return;
  }

  const MESES = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9,
    noviembre: 10, diciembre: 11,
  };

  // Convierte "18 de octubre, 2026" en una fecha. Si no se puede
  // entender el texto, devuelve null (el evento queda al final).
  function parsearFecha(texto) {
    const m = /(\d{1,2})\s+de\s+([a-záéíóú]+),?\s+(\d{4})/i.exec(texto || '');
    if (!m) return null;
    const mes = MESES[m[2].toLowerCase()];
    if (mes === undefined) return null;
    return new Date(Number(m[3]), mes, Number(m[1]));
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const eventos = C.getMyEvents()
    .map((ev) => ({ ev, fecha: parsearFecha(ev.date) }))
    .sort((a, b) => {
      if (!a.fecha && !b.fecha) return 0;
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha - b.fecha; // los más próximos primero
    });

  if (!eventos.length) {
    empty.hidden = false;
    subtitle.hidden = true;
    return;
  }

  subtitle.textContent =
    eventos.length === 1
      ? 'Estás inscripto/a a 1 evento.'
      : `Estás inscripto/a a ${eventos.length} eventos.`;

  // Crea un <li> con icono + texto (todo con textContent: nada de HTML
  // armado a mano, así un título raro no puede romper la página).
  function fila(icono, texto) {
    if (!texto) return null;
    const li = document.createElement('li');
    const ion = document.createElement('ion-icon');
    ion.setAttribute('name', icono);
    li.appendChild(ion);
    li.appendChild(document.createTextNode(' ' + texto));
    return li;
  }

  eventos.forEach(({ ev, fecha }) => {
    const finalizado = fecha && fecha < hoy;

    const card = document.createElement('article');
    card.className = 'ev-card' + (finalizado ? ' is-past' : '');

    // Talón de la izquierda con el icono del seminario
    const stub = document.createElement('div');
    stub.className = 'ev-stub';
    const stubIcon = document.createElement('ion-icon');
    stubIcon.setAttribute('name', ev.icon || 'ticket-outline');
    stub.appendChild(stubIcon);

    const body = document.createElement('div');
    body.className = 'ev-body';

    const top = document.createElement('div');
    top.className = 'ev-top';
    if (ev.category) {
      const tag = document.createElement('span');
      tag.className = 'ev-tag';
      tag.textContent = ev.category;
      top.appendChild(tag);
    }
    if (finalizado) {
      const badge = document.createElement('span');
      badge.className = 'ev-badge';
      badge.textContent = 'Finalizado';
      top.appendChild(badge);
    }

    const title = document.createElement('h3');
    title.textContent = ev.title || 'Seminario';

    const meta = document.createElement('ul');
    meta.className = 'ev-meta';
    [
      fila('calendar-outline', ev.date),
      fila('time-outline', ev.duration),
      fila('navigate-outline', ev.place),
      fila('cash-outline', ev.price),
    ].forEach((li) => li && meta.appendChild(li));

    const footer = document.createElement('div');
    footer.className = 'ev-footer';

    if (ev.registeredAt) {
      const d = new Date(ev.registeredAt);
      if (!isNaN(d)) {
        const reg = document.createElement('span');
        reg.className = 'ev-registered';
        reg.textContent =
          'Inscripción: ' +
          d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
        footer.appendChild(reg);
      }
    }

    if (ev.page) {
      const link = document.createElement('a');
      link.className = 'ev-link';
      link.href = ev.page;
      link.textContent = 'Ver seminario';
      footer.appendChild(link);
    }

    body.append(top, title, meta, footer);
    card.append(stub, body);
    list.appendChild(card);
  });
})();