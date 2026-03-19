// --- 1. PROPERLY CENTERED FLUID CURSOR ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function updateCursor() {
    cursor.x += (mouse.x - cursor.x) * 0.15; // Smooth trailing
    cursor.y += (mouse.y - cursor.y) * 0.15;
    
    if(cursorDot) {
        // Using left/top preserves the CSS translate(-50%, -50%) for perfect centering
        cursorDot.style.left = `${mouse.x}px`;
        cursorDot.style.top = `${mouse.y}px`;
    }
    if(cursorOutline) {
        cursorOutline.style.left = `${cursor.x}px`;
        cursorOutline.style.top = `${cursor.y}px`;
    }
    requestAnimationFrame(updateCursor);
}
updateCursor();

// --- 2. DENSER & LARGER BACKGROUND PARTICLES ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Increased size for better visibility
        this.size = Math.random() * 2.5 + 1.0; 
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.offsetX = (Math.random() - 0.5) * 20;
        this.offsetY = (Math.random() - 0.5) * 20;
    }

    draw() {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)'; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 250) {
            ctx.beginPath();
            ctx.moveTo(this.x + this.offsetX, this.y + this.offsetY);
            ctx.lineTo(mouse.x, mouse.y);
            
            ctx.strokeStyle = `rgba(200, 200, 200, ${0.2 * (1 - distance / 250)})`;
            ctx.lineWidth = 0.5; 
            ctx.stroke();
            
            this.x += dx * 0.01;
            this.y += dy * 0.01;
        }

        this.draw();
    }
}

function init() {
    particles = [];
    // Significantly increased particle count (divided by 6000 instead of 12000)
    let count = (width * height) / 6000;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => p.update());
    requestAnimationFrame(animate);
}

init();
animate();

// --- 3. SCROLL REVEAL LOGIC ---
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-up, .reveal-zoom, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
