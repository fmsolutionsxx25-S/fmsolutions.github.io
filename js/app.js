// Variables globales
let products = [];
let cart = [];
let currentCategory = 'todos';

// Cargar productos desde el archivo JSON
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Datos de respaldo en caso de error
        products = [
            { id: 1, name: "Laptop Gaming", category: "electrónica", price: 1299.99, description: "Potente laptop para gaming y trabajo", image: "images/productos/laptop-gaming.jpg", emoji: "💻", stock: 15 },
            { id: 2, name: "Smartphone Pro", category: "electrónica", price: 899.99, description: "Última generación con 5G", image: "images/productos/smartphone.jpg", emoji: "📱", stock: 25 },
            { id: 3, name: "Auriculares Bluetooth", category: "electrónica", price: 149.99, description: "Cancelación de ruido activa", image: "images/productos/auriculares.jpg", emoji: "🎧", stock: 40 }
        ];
        renderProducts();
    }
}

// Renderizar productos
function renderProducts(filter = 'todos', search = '') {
    const grid = document.getElementById('productsGrid');
    const filtered = products.filter(p => {
        const matchCategory = filter === 'todos' || p.category === filter;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.description.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-cart" style="grid-column: 1/-1;">No se encontraron productos</div>';
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <img src="${product.image || 'images/productos/placeholder.jpg'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 style="width: 100%; height: 250px; object-fit: cover; display: block;">
            <div style="width: 100%; height: 250px; display: none; align-items: center; justify-content: center; font-size: 4rem; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
                ${product.emoji || '📦'}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">${product.price.toFixed(2)}</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    saveCart();
    showNotification('✓ Producto agregado al carrito');
}

// Remover del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCart();
    showNotification('🗑️ Producto eliminado del carrito');
}

// Actualizar vista del carrito
function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image || 'images/productos/placeholder.jpg'}" 
                     alt="${item.name}" 
                     onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; display: block;">
                <div style="width: 60px; height: 60px; display: none; align-items: center; justify-content: center; font-size: 2rem; background: #f0f0f0; border-radius: 8px;">
                    ${item.emoji || '📦'}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <button onclick="removeFromCart(${item.id})" style="background: #ff4757; color: white; border: none; padding: 0.5rem; border-radius: 5px; cursor: pointer;">
                    🗑️
                </button>
            </div>
        `).join('');
    }

    cartTotal.textContent = `Total: ${totalPrice.toFixed(2)}`;
}

// Toggle panel del carrito
function toggleCart() {
    document.getElementById('cartPanel').classList.toggle('active');
}

// Proceso de checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('⚠️ Tu carrito está vacío', 'warning');
        return;
    }

    const message = cart.map(item => 
        `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    alert(`📦 Resumen de tu pedido:\n\n${message}\n\n💰 Total: $${total.toFixed(2)}\n\n📧 Por favor completa el formulario de contacto para finalizar tu compra.`);

    // Scroll suave al formulario
    document.getElementById('contactSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    toggleCart();
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cargar carrito desde localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Configurar filtros
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderProducts(currentCategory, document.getElementById('searchInput').value);
        });
    });
}

// Configurar búsqueda
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        renderProducts(currentCategory, e.target.value);
    });
}

// Configurar formulario de contacto
function setupContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
            cart: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString()
        };

        console.log('📧 Formulario enviado:', formData);
        
        // Aquí se integraría el servicio de email (EmailJS, Formspree, etc.)
        showNotification('✓ ¡Gracias por tu mensaje! Te contactaremos pronto.');
        
        form.reset();
        cart = [];
        updateCart();
        saveCart();
        
        // Scroll al inicio después de enviar
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Inicializar aplicación
function init() {
    loadProducts();
    loadCart();
    setupFilters();
    setupSearch();
    setupContactForm();
    
    console.log('🛍️ Tienda Online inicializada correctamente');
    console.log('📁 Buscando imágenes en: images/productos/');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}