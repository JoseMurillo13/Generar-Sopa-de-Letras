const size = 20;

/**
 * Función principal para generar la sopa de letras
 */
function generarSopa() {
    // 1. Capturar y limpiar las palabras del input
    let input = document.getElementById("words").value;
    if (!input.trim()) {
        alert("Por favor, ingresa algunas palabras separadas por comas.");
        return;
    }

    // Convertimos a mayúsculas, quitamos espacios y eliminamos entradas vacías
    let words = input.toUpperCase()
        .split(",")
        .map(w => w.trim())
        .filter(w => w !== "");

    // 2. Mostrar la lista de palabras debajo del título
    let lista = document.getElementById("listaPalabras");
    lista.innerHTML = "<b>Words to search for: </b>";
    let ul = document.createElement("ul");
    words.forEach(p => {
        let li = document.createElement("li");
        li.textContent = p;
        ul.appendChild(li);
    });
    lista.appendChild(ul);

    // 3. Inicializar la matriz (grid) vacía
    let grid = Array(size).fill().map(() => Array(size).fill(""));

    // 4. Intentar colocar cada palabra en el tablero
    words.forEach(word => {
        colocarPalabra(grid, word);
    });

    // 5. Rellenar los huecos vacíos con letras aleatorias
    rellenar(grid);

    // 6. Renderizar el tablero en el HTML
    dibujar(grid);
}

/**
 * Lógica para posicionar una palabra sin colisiones
 */
function colocarPalabra(grid, word) {
    let placed = false;
    let intentos = 0; // Seguridad para evitar bucles infinitos

    while (!placed && intentos < 150) {
        let row = Math.floor(Math.random() * size);
        let col = Math.floor(Math.random() * size);
        let dir = Math.floor(Math.random() * 4); // 0:H, 1:V, 2:DiagD, 3:DiagI

        let dRow = 0, dCol = 0;

        // Definimos la dirección del movimiento
        switch(dir) {
            case 0: dCol = 1; break;      // Horizontal →
            case 1: dRow = 1; break;      // Vertical ↓
            case 2: dRow = 1; dCol = 1; break;  // Diagonal Derecha ↘
            case 3: dRow = 1; dCol = -1; break; // Diagonal Izquierda ↙
        }

        // VALIDACIÓN CRÍTICA: ¿La palabra cabe y el camino está despejado?
        if (puedeColocarse(grid, word, row, col, dRow, dCol)) {
            for (let i = 0; i < word.length; i++) {
                grid[row + (i * dRow)][col + (i * dCol)] = word[i];
            }
            placed = true;
        }
        intentos++;
    }
    
    if (!placed) {
        console.warn(`La palabra "${word}" no pudo ser colocada después de 150 intentos.`);
    }
}

/**
 * Verifica si una trayectoria está disponible en la matriz
 */
function puedeColocarse(grid, word, r, c, dr, dc) {
    for (let i = 0; i < word.length; i++) {
        let newR = r + (i * dr);
        let newC = c + (i * dc);

        // Comprobar límites del tablero
        if (newR < 0 || newR >= size || newC < 0 || newC >= size) return false;
        
        // Comprobar si la celda está ocupada por una letra DISTINTA
        // (Esto permite que las palabras se crucen si comparten la misma letra)
        if (grid[newR][newC] !== "" && grid[newR][newC] !== word[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Rellena los espacios vacíos con letras de la A a la Z
 */
function rellenar(grid) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === "") {
                grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

/**
 * Dibuja el grid en el contenedor HTML usando CSS Grid
 */
function dibujar(grid) {
    let container = document.getElementById("grid");
    container.innerHTML = "";
    
    // Aseguramos el estilo visual desde JS para evitar errores de alineación
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.style.gap = "1px"; 

    grid.forEach(row => {
        row.forEach(letter => {
            let div = document.createElement("div");
            div.className = "cell";
            div.textContent = letter;
            container.appendChild(div);
        });
    });
}

/**
 * Genera el PDF capturando el área de impresión
 */
function descargarPDF() {
    const { jsPDF } = window.jspdf;
    let elemento = document.getElementById("printArea");

    html2canvas(elemento, { scale: 2 }).then(canvas => {
        let imgData = canvas.toDataURL("image/png");
        let margen = 20;

        let pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvas.width + margen * 2, canvas.height + margen * 2]
        });

        pdf.addImage(imgData, "PNG", margen, margen, canvas.width, canvas.height);
        pdf.save("mi_sopa_de_letras.pdf");
    });
}