/* --- Replace your entire script.js with this refined version --- */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Custom Cursor Smooth Trailing
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

function updateCursor() {
    cursor.x += (mouse.x - cursor.x) * 0.1;
    cursor.y += (mouse.y - cursor.y) * 0.1;
    
    if(cursorDot) {
        cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
    }
    if(cursorOutline) {
        cursorOutline.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
    }
    requestAnimationFrame(updateCursor);
}
updateCursor();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5; // Thinner particles
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        // Random offset for "string" attachment so it's not always the center
        this.offsetX = (Math.random() - 0.5) * 15;
        this.offsetY = (Math.random() - 0.5) * 15;
    }

    draw() {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)'; // Light Grey
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Interactive "String" connection to cursor
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 250) {
            ctx.beginPath();
            // Connects to a random point near the particle for a "hand-drawn" technical feel
            ctx.moveTo(this.x + this.offsetX, this.y + this.offsetY);
            ctx.lineTo(mouse.x, mouse.y);
            
            // UI/UX Refinement: Thinner lines (0.3) and Light Grey low opacity
            ctx.strokeStyle = `rgba(200, 200, 200, ${0.15 * (1 - distance / 250)})`;
            ctx.lineWidth = 0.5; 
            ctx.stroke();
            
            // Subtle pull effect
            this.x += dx * 0.01;
            this.y += dy * 0.01;
        }

        this.draw();
    }
}

function init() {
    particles = [];
    let count = (width * height) / 12000;
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

// --- 3D TILT & MAGNETIC CARD EFFECT ---
const cards = document.querySelectorAll('.tilt-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Tilt math
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
});

// Scroll Reveal Logic
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-up, .reveal-3d, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
