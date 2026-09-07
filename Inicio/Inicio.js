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
document.querySelector('.search-bar').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Buscar:', e.target.querySelector('input').value);
});
