// Este script NO crea tarjetas ni guarda datos: las 6 tarjetas ya
// están escritas directamente en Seminarios.html. Lo único que hace
// es mostrar u ocultar esas tarjetas existentes según lo que se
// busque o el filtro de categoría que esté activo.

(function () {
  const cards = Array.from(document.querySelectorAll('.sem-card'));
  const searchInput = document.getElementById('semSearch');
  const filterBar = document.getElementById('semFilters');
  const empty = document.getElementById('semEmpty');

  let activeFilter = 'todos';

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = card.dataset.category; // ej: "dirección"
      const text = card.textContent.toLowerCase(); // todo el texto de la tarjeta

      const matchesCategory = activeFilter === 'todos' || category === activeFilter;
      const matchesSearch = query === '' || text.includes(query);

      const shouldShow = matchesCategory && matchesSearch;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    empty.hidden = visibleCount > 0;
  }

  // Escribir en el buscador vuelve a aplicar el filtro
  searchInput.addEventListener('input', applyFilters);

  // Tocar un chip de categoría marca ese chip como activo y filtra
  filterBar.addEventListener('click', (event) => {
    const chip = event.target.closest('.sem-chip');
    if (!chip) return;

    filterBar.querySelectorAll('.sem-chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeFilter = chip.dataset.filter;

    applyFilters();
  });
})();
