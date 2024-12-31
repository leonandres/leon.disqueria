let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded se disparó");
    cargarElementosComunes();
    cargarCarritoDesdeStorage();
    cargarProductos();
});

function cargarElementosComunes() {
    const menu = document.getElementById("navbar");
    const footer = document.getElementById("footer");
    
    if (menu) {
        fetch("nav.html")
            .then(response => response.text())
            .then(data => {
                menu.innerHTML = data;
                const navbarCollapse = document.getElementById("menuDeNavegacion");
                if (navbarCollapse) {
                    navbarCollapse.classList.add("justify-content-end");
                }
            });
    }
    
    if (footer) {
        fetch("footer.html")
            .then(response => response.text())
            .then(data => footer.innerHTML = data);
    }
}

async function cargarProductos() {
    try {
        const response = await fetch('https://itunes.apple.com/search?term=rock&entity=album&limit=20');
        const data = await response.json();
        
        const productos = data.results.map((album, index) => ({
            id: index + 1,
            nombre: album.collectionName,
            artista: album.artistName,
            descripcion: `Álbum de ${album.artistName}`,
            descripcionAmpliada: `${album.collectionName} es un álbum de ${album.artistName} 
                                 lanzado en ${new Date(album.releaseDate).getFullYear()}. 
                                 Género: ${album.primaryGenreName}`,
            cantidad: Math.floor(Math.random() * 10) + 1,
            precio: album.collectionPrice || Math.floor(Math.random() * 50) + 10,
            foto: album.artworkUrl100.replace('100x100', '600x600')
        }));

        mostrarProductos(productos);
        console.log('Productos cargados:', productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarNotificacion('Error al cargar los productos', 'error');
    }
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById('discos');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'row g-4';

    productos.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        col.appendChild(crearCard(producto));
        row.appendChild(col);
    });

    contenedor.appendChild(row);
}

function crearCard(producto) {
    const card = document.createElement('div');
    card.className = 'card h-100';
    
    card.innerHTML = `
        <img src="${producto.foto}" class="card-img-top" alt="${producto.nombre}">
        <div class="card-body d-flex flex-column">
            <h5 class="card-title">${producto.nombre}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${producto.artista}</h6>
            <p class="card-text">${producto.descripcion}</p>
            <p class="card-text"><strong>Precio: $${producto.precio}</strong></p>
            <div class="mt-auto">
                <button class="btn btn-primary ver-mas" data-id="${producto.id}">Ver más</button>
                <button class="btn btn-success agregar-carrito" data-id="${producto.id}">Agregar al carrito</button>
            </div>
        </div>
    `;

    card.querySelector('.ver-mas').addEventListener('click', () => mostrarDescripcionAmpliada(producto, card));
    card.querySelector('.agregar-carrito').addEventListener('click', () => agregarAlCarrito(producto));

    return card;
}

function mostrarDescripcionAmpliada(producto, card) {
    const descripcionContainer = card.querySelector('.descripcion-ampliada');
    
    if (descripcionContainer) {
        descripcionContainer.remove();
    } else {
        const div = document.createElement('div');
        div.className = 'descripcion-ampliada card-body border-top';
        div.innerHTML = `<p>${producto.descripcionAmpliada}</p>`;
        card.appendChild(div);
    }
}

function agregarAlCarrito(producto) {
    const itemCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        artista: producto.artista,
        precio: producto.precio,
        foto: producto.foto,
        cantidad: 1
    };
    
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push(itemCarrito);
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    actualizarContenidoCarrito();
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
}

function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarContadorCarrito();
    }
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        contador.textContent = carrito.length;
    }
}

function actualizarContenidoCarrito() {
    const contenidoCarrito = document.getElementById('carrito-contenido');
    const totalCarrito = document.getElementById('carrito-total');
    
    if (contenidoCarrito && totalCarrito) {
        contenidoCarrito.innerHTML = '';
        
        carrito.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'carrito-item p-2';
            itemElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${item.nombre}</h6>
                        <small class="text-muted">${item.artista}</small>
                    </div>
                    <div class="text-end">
                        <div>$${item.precio} x ${item.cantidad}</div>
                        <div>Total: $${(item.precio * item.cantidad).toFixed(2)}</div>
                    </div>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
                    <button class="btn btn-sm btn-secondary" onclick="modificarCantidad(${item.id}, -1)">-</button>
                    <button class="btn btn-sm btn-secondary" onclick="modificarCantidad(${item.id}, 1)">+</button>
                </div>
            `;
            contenidoCarrito.appendChild(itemElement);
        });

        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        totalCarrito.innerHTML = `
            <h5>Total del carrito: $${total.toFixed(2)}</h5>
        `;
    }
}


function modificarCantidad(id, cambio) {
    const item = carrito.find(item => item.id === id);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(id);
        } else {
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            actualizarContenidoCarrito();
        }
    }
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    actualizarContenidoCarrito();
    mostrarNotificacion('Producto eliminado del carrito');
}

function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío');
        return;
    }
    
    mostrarNotificacion('¡Gracias por tu compra!');
    carrito = [];
    localStorage.removeItem('carrito');
    actualizarContadorCarrito();
    actualizarContenidoCarrito();
    
    // Cerrar el offcanvas
    const offcanvasElement = document.getElementById('carritoOffcanvas');
    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
    if (offcanvas) {
        offcanvas.hide();
    }
}

/*let carrito = [];

document.addEventListener("DOMContentLoaded", () => {

    console.log("DOMContentLoaded se disparó");

    const menu = document.getElementById("navbar");
    const footer = document.getElementById("footer");

    if (menu) {
        fetch("nav.html")
            .then(response  => response.text())
            .then(data      => menu.innerHTML = data)
    }

    if (footer) {
        fetch("footer.html")
            .then(response  => response.text())
            .then(data      => footer.innerHTML = data)
    }

})

function cargarElementosComunes() {
    const menu = document.getElementById("navbar");
    const footer = document.getElementById("footer");
    
    if (menu) {
        fetch("nav.html")
            .then(response => response.text())
            .then(data => {
                menu.innerHTML = data;
                const navbarCollapse = document.getElementById("menuDeNavegacion");
                if (navbarCollapse) {
                    navbarCollapse.classList.add("justify-content-end");
                }
            });
    }
    
    if (footer) {
        fetch("footer.html")
            .then(response => response.text())
            .then(data => footer.innerHTML = data);
    }
}

function crearCard(producto){
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = ``
}

async function cargarProducto(){

    try {
        const response = await fetch('https://itunes.apple.com/search?term=rock&entity=album&limit=6');
        const data = await response.json();
        
        const productos = data.results.map((album, index) => ({
            id: index + 1,
            nombre: album.collectionName,
            artista: album.artistName,
            descripcion: `Álbum de ${album.artistName}`,
            descripcionAmpliada: `${album.collectionName} es un álbum de ${album.artistName} 
                                 lanzado en ${new Date(album.releaseDate).getFullYear()}. 
                                 Género: ${album.primaryGenreName}`,
            cantidad: Math.floor(Math.random() * 10) + 1,
            precio: album.collectionPrice || Math.floor(Math.random() * 50) + 10,
            foto: album.artworkUrl100.replace('100x100', '600x600')
        }));

        mostrarProductos(productos);
        console.log('Productos cargados:', productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarNotificacion('Error al cargar los productos', 'error');
    }
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById('discos');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'row g-4';

    productos.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        col.appendChild(crearCard(producto));
        row.appendChild(col);
    });

    contenedor.appendChild(row);
}*/