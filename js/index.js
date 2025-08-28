// === VARIABLES PRINCIPALES ===
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const player = document.getElementById('player'); // 🎵 reproductor
let currentInput = '';
let resultDisplayed = false;

// 🔹 Canvas y partículas para los fuegos artificiales
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
let particles = [];

// === FUNCIONES DE DISPLAY ===
function updateDisplay(value) {
    // ✅ Evita null y undefined
    display.textContent = (value !== undefined && value !== null && value !== '') 
        ? value 
        : "0";
}

// === FUNCIÓN PARA REPRODUCIR MÚSICA ===
function playMusic(songFile) {
    if (!songFile) return;
    player.src = `mp3/${songFile}`;
    player.play().catch(err => console.log("Error reproduciendo música:", err));
}

// === EVENTOS DE BOTONES ===
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 🔹 Ignorar botones que no son de la calculadora
        if (btn.classList.contains('link') || btn.classList.contains('theme-btn')) return;

        const value = btn.getAttribute('data-value');
        const func = btn.getAttribute('data-func');
        const song = btn.getAttribute('data-song'); // 🎵

        // 🔹 Reproduce canción si tiene data-song
        if (song) playMusic(song);

        // 🔹 Animación de rebote
        btn.classList.add('clicked');
        setTimeout(() => btn.classList.remove('clicked'), 300);

        // === Lógica de la calculadora ===
        if (btn.classList.contains('clear')) {
            currentInput = '';
            updateDisplay('0');
            resultDisplayed = false;

        } else if (btn.classList.contains('equal')) {
            try {
                let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                let result = eval(expression);

                if (result === undefined || isNaN(result)) {
                    updateDisplay('Error');
                    currentInput = '';
                } else {
                    updateDisplay(result);
                    currentInput = result.toString();

                    // 🎆 Fuegos artificiales
                    const rect = display.getBoundingClientRect();
                    createFirework(rect.left + rect.width/2, rect.top + rect.height/2);
                }
                resultDisplayed = true;
            } catch {
                updateDisplay('Error');
                currentInput = '';
                resultDisplayed = false;
            }

        } else if (btn.classList.contains('sci')) {
            let num = parseFloat(currentInput) || 0;
            let result;
            switch(func) {
                case 'sin': result = Math.sin(num); break;
                case 'cos': result = Math.cos(num); break;
                case 'tan': result = Math.tan(num); break;
                case 'sqrt': result = Math.sqrt(num); break;
            }
            updateDisplay(result);
            currentInput = result.toString();
            resultDisplayed = true;

        } else if (btn.classList.contains('operator')) {
            if (currentInput === '' && value !== '-') return;
            if (/[+\-*/.]$/.test(currentInput)) {
                currentInput = currentInput.slice(0, -1) + value;
            } else {
                currentInput += value;
            }
            updateDisplay(currentInput);
            resultDisplayed = false;

        } else {
            if (resultDisplayed) {
                currentInput = '';
                resultDisplayed = false;
            }
            if (value === '.' && currentInput.split(/[+\-*/]/).pop().includes('.')) return;
            currentInput += value;
            updateDisplay(currentInput);
        }
    });
});

// === FUEGOS ARTIFICIALES ===
function resizeCanvas() {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createFirework(x, y) {
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: x,
            y: y,
            angle: Math.random() * 2 * Math.PI,
            speed: Math.random() * 4 + 1,
            radius: Math.random() * 4 + 3,
            life: 120
        });
    }
}

function drawFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        const alpha = p.life / 120;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${alpha})`;
        ctx.fill();
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    });
    requestAnimationFrame(drawFireworks);
}
drawFireworks();

// === MODO OSCURO / DÍA ===
function toggleTheme() {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

window.onload = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.body.classList.remove("dark", "light");
        document.body.classList.add(savedTheme);
    }
};
