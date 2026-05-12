const CARRITO_KEY = 'pasta_arte_carrito';

function getCarrito() {
  try {
    const stored = localStorage.getItem(CARRITO_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCarrito(carrito) {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  } catch {}
}

function getTotal() {
  const carrito = getCarrito();
  return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function actualizarContador() {
  if (typeof document === 'undefined') return;
  const contador = document.getElementById('carrito-contador');
  if (contador) {
    const cantidad = getCarrito().reduce((sum, item) => sum + item.cantidad, 0);
    contador.textContent = cantidad;
    contador.style.display = cantidad > 0 ? 'flex' : 'none';
  }
}

function renderCarrito() {
  if (typeof document === 'undefined') return;
  const itemsContainer = document.getElementById('carrito-items');
  const totalElement = document.getElementById('carrito-total');
  const vacioElement = document.getElementById('carrito-vacio');
  
  if (!itemsContainer) return;
  
  const carrito = getCarrito();
  
  if (carrito.length === 0) {
    itemsContainer.innerHTML = '';
    if (vacioElement) vacioElement.style.display = 'block';
    if (totalElement) totalElement.textContent = '$0';
    return;
  }
  
  if (vacioElement) vacioElement.style.display = 'none';
  
  const itemsHTML = carrito.map((item, index) => `
    <div class="carrito-item">
      <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img" />
      <div class="carrito-item-info">
        <h4>${item.nombre}</h4>
        <p class="carrito-item-precio">$${item.precio.toLocaleString()}</p>
        <div class="carrito-item-cantidad">
          <button onclick="cambiarCantidad(${index}, -1)" class="btn-cantidad">−</button>
          <span>${item.cantidad}</span>
          <button onclick="cambiarCantidad(${index}, 1)" class="btn-cantidad">+</button>
        </div>
      </div>
      <button onclick="eliminarDelCarrito(${index})" class="carrito-item-eliminar" aria-label="Eliminar">✕</button>
    </div>
  `).join('');
  
  if (itemsContainer) {
    itemsContainer.innerHTML = itemsHTML;
  }
  
  if (totalElement) {
    totalElement.textContent = `$${getTotal().toLocaleString()}`;
  }
}

function agregarAlCarrito(producto) {
  const carrito = getCarrito();
  const existente = carrito.find(item => item.id === producto.id);
  
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1
    });
  }
  
  saveCarrito(carrito);
  actualizarContador();
  renderCarrito();
  mostrarNotificacion(`${producto.nombre} agregado al carrito`);
}

function cambiarCantidad(index, cambio) {
  const carrito = getCarrito();
  if (carrito[index]) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    } else {
      saveCarrito(carrito);
    }
  }
  saveCarrito(carrito);
  actualizarContador();
  renderCarrito();
}

window.eliminarDelCarrito = function(index) {
  const carrito = getCarrito();
  const nombre = carrito[index]?.nombre;
  carrito.splice(index, 1);
  saveCarrito(carrito);
  actualizarContador();
  renderCarrito();
  if (nombre) mostrarNotificacion(`${nombre} eliminado del carrito`);
};

window.cambiarCantidad = cambiarCantidad;

window.agregarAlCarrito = agregarAlCarrito;

function toggleCarrito() {
  const panel = document.getElementById('carrito-panel');
  const overlay = document.getElementById('carrito-overlay');
  if (panel) {
    panel.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    document.body.style.overflow = panel.classList.contains('active') ? 'hidden' : '';
    renderCarrito();
  }
}

window.toggleCarrito = toggleCarrito;

function cerrarCarrito() {
  const panel = document.getElementById('carrito-panel');
  const overlay = document.getElementById('carrito-overlay');
  if (panel) panel.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

window.cerrarCarrito = cerrarCarrito;

function vaciarCarrito() {
  try {
    localStorage.removeItem(CARRITO_KEY);
  } catch {}
  actualizarContador();
  renderCarrito();
  mostrarNotificacion('Carrito vaciado');
}

window.vaciarCarrito = vaciarCarrito;

function mostrarNotificacion(mensaje) {
  if (typeof document === 'undefined') return;
  const existente = document.querySelector('.notificacion');
  if (existente) existente.remove();
  
  const notificacion = document.createElement('div');
  notificacion.className = 'notificacion';
  notificacion.innerHTML = `
    <span>✓</span>
    <p>${mensaje}</p>
  `;
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notificacion.classList.remove('show');
    setTimeout(() => notificacion.remove(), 300);
  }, 2500);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    renderCarrito();
  });
}