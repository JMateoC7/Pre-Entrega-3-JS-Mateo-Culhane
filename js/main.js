let data; // Defino data como una variable global
document.addEventListener("DOMContentLoaded", function () {

// Fetch para obtener los datos de los juegos desde el archivo JSON
    fetch('./data/productos.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData; // Asigno los datos del JSON a la variable global data porque sin esto me tiraba error

            // Muestro los datos en la consola para verificar
            console.log(data);

            botonesAgregarAlCarrito.forEach(boton => {
                boton.addEventListener("click", handleClick);
            });
        })
        .catch(error => console.error('Error al obtener los datos de los juegos:', error));
// Seleccionar el carrito y los elementos relacionados

    const carrito = document.querySelector(".carrito"); 
    const total = carrito.querySelector(".total"); 
    const botonVaciarCarrito = carrito.querySelector(".vaciar-carrito"); 
    const botonesAgregarAlCarrito = document.querySelectorAll(".agregar-al-carrito"); 

    let elementosCarrito = [];
    let modoOscuro = false; // Variable para almacenar el estado del modo oscuro

// Botón para alternar entre modos de color

    const switchModo = document.createElement("button"); 
    switchModo.classList.add("switch-modo"); 
    switchModo.textContent = "Modo Oscuro"; 
    document.body.appendChild(switchModo);
    
function handleClick(event) {
    const boton = event.target;
    const index = boton.dataset.index;
    
    // Verifico si data está definido y si el índice existe ahi
    if (data && data[index]) {
        const juego = data[index];

        // Agregar el juego al carrito
        agregarAlCarrito(juego.nombre, juego.precio, juego.moneda);
        guardarElementosCarrito(); 
        mostrarElementosCarrito();

        // Elimino el evento en click para evitar que se agreguen 2 veces que era algo que me pasaba
        boton.removeEventListener("click", handleClick);
    } else {
        console.error('Los datos no están disponibles o el índice especificado no existe en data.');
    }
}

// Cargar carrito desde el almacenamiento local

    if (localStorage.getItem("elementosCarrito")) { 
    elementosCarrito = JSON.parse(localStorage.getItem("elementosCarrito"));
    mostrarElementosCarrito();
    }

// Evento click en los botones "Comprar"

    botonesAgregarAlCarrito.forEach(boton => {
    boton.addEventListener("click", () => {
        const nombre = boton.getAttribute("data-nombre");
        const precio = parseFloat(boton.getAttribute("data-precio"));
        const moneda = boton.getAttribute("data-moneda");

        agregarAlCarrito(nombre, precio, moneda);
        guardarElementosCarrito(); 
        mostrarElementosCarrito();
    });
    });

// Vaciar carrito

    botonVaciarCarrito.addEventListener("click", () => {
    elementosCarrito = [];
    guardarElementosCarrito();
    mostrarElementosCarrito();
    });

// Cambiar entre modo oscuro y claro

    switchModo.addEventListener("click", () => {
    modoOscuro = !modoOscuro;
    aplicarModo();
    });

// Aplicar el modo oscuro o claro

    function aplicarModo() {
    if (modoOscuro) {
        document.body.classList.add("modo-oscuro");
        switchModo.textContent = "Modo Claro";
    } else {
        document.body.classList.remove("modo-oscuro");
        switchModo.textContent = "Modo Oscuro";
    }
    }

// Agregar item al carrito

    function agregarAlCarrito(nombre, precio, moneda) {
    const item = {
        id: generarID(), // Generar ID único para cada elemento del carrito
        nombre,
        precio,
        moneda
    };
    elementosCarrito.push(item);
    }

// Guardar carrito en el almacenamiento local

    function guardarElementosCarrito() {
    localStorage.setItem("elementosCarrito", JSON.stringify(elementosCarrito));
    }

// Mostrar items del carrito

    function mostrarElementosCarrito() {
    let totalARS = 0;

// Limpiar carrito antes de volver a mostrar los artículos

    while (carrito.lastChild.className !== "contenido-carrito") {
        carrito.removeChild(carrito.lastChild);
    }

    elementosCarrito.forEach(item => {
        const elementoCarrito = document.createElement("div");
        elementoCarrito.classList.add("elemento-carrito");
        elementoCarrito.innerHTML = `
        <div class="contenido-carrito">
            <span>${item.nombre}</span>
            <span>$${convertirAPesosARS(item.precio).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ARS</span>
            <button class="eliminar-item" data-id="${item.id}">Eliminar</button> <!-- Botón para eliminar el elemento del carrito -->
        </div>
        `;
        carrito.appendChild(elementoCarrito);

// Convertir precios a pesos argentinos con impuestos del 65%

        if (item.moneda === "USD") {
            totalARS += convertirAPesosARS(item.precio) * 100;
        } else {
            totalARS += item.precio * 100;
        }
    });

// Mostrar el total en pesos argentinos

    total.textContent = `Total: $${(totalARS / 100).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ARS`;

// Evento click en los botones "Eliminar"

    const botonesEliminarItem = document.querySelectorAll(".eliminar-item");
    botonesEliminarItem.forEach(boton => {
        boton.addEventListener("click", () => {
        const id = boton.getAttribute("data-id");
        eliminarItemDelCarrito(id); 
        guardarElementosCarrito();
        mostrarElementosCarrito();
        });
    });

// Botón para finalizar la compra

    let botonFinalizarCompra = document.querySelector(".finalizar-compra");
    if (!botonFinalizarCompra) {
        botonFinalizarCompra = document.createElement("button");
        botonFinalizarCompra.classList.add("finalizar-compra", "btn-finalizar");
        botonFinalizarCompra.textContent = "Finalizar Compra";
        carrito.appendChild(botonFinalizarCompra);

// Evento click en el botón "Finalizar Compra"

        botonFinalizarCompra.addEventListener("click", () => {
        finalizarCompra();
        });
    }
    }

// Función para eliminar un elemento del carrito

    function eliminarItemDelCarrito(id) {
    elementosCarrito = elementosCarrito.filter(item => item.id !== id);
    }

// Función para convertir el precio a pesos argentinos con impuestos del 65%

    function convertirAPesosARS(precioUSD) {
    return (precioUSD * 1.65);
    }

// Función para generar un ID único para cada elemento del carrito

    function generarID() {
    return '_' + Math.random().toString(36).substr(2, 9);
    }

// Función para finalizar la compra
    function finalizarCompra() {

    // Limpiar carrito antes de mostrar el formulario
    while (carrito.lastChild.className !== "contenido-carrito") {
        carrito.removeChild(carrito.lastChild);
    }

// Mostrar formulario

    const formularioCompra = document.createElement("div");
    formularioCompra.classList.add("formulario-compra");
    formularioCompra.innerHTML = `
        <h2>Completa el formulario para finalizar la compra</h2>
    <form id="formulario">
        <div class="campo">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" required>
        </div>
        <div class="campo">
            <label for="email">Correo Electrónico:</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div class="campo">
            <label for="telefono">Teléfono:</label>
            <input type="tel" id="telefono" name="telefono" required>
        </div>
        <input type="submit" class="btn-finalizar" value="Finalizar Compra">
    </form>
    `;
    carrito.appendChild(formularioCompra);

// Evento submit en el formulario

    const formulario = document.getElementById("formulario");
    formulario.addEventListener("submit", e => {
        e.preventDefault();

    // Enviar formulario
        alert("¡Gracias por tu compra!");
    });
    }
});
