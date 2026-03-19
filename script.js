// --- 1. CUSTOM FLUID CURSOR ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let outline = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Instant dot movement
    cursorDot.style.left = `${mouse.x}px`;
    cursorDot.style.top = `${mouse.y}px`;
});

// Smooth outline trailing loop
function renderCursor() {
    outline.x += (mouse.x - outline.x) * 0.15; // The trailing physics
    outline.y += (mouse.y - outline.y) * 0.15;
    cursorOutline.style.left = `${outline.x}px`;
    cursorOutline.style.top = `${outline.y}px`;
    requestAnimationFrame(renderCursor);
}
renderCursor();

// --- 2. MAGNETIC ELEMENTS (Buttons & Logos) ---
const magnetics = document.querySelectorAll('.magnetic');
magnetics.forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
        const position = btn.getBoundingClientRect();
        const x = e.pageX - position.left - position.width / 2;
        const y = e.pageY - position.top - position.height / 2;
        
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        cursorOutline.style.transform = `translate(-50%, -50%) scale(1.5)`;
        cursorOutline.style.backgroundColor = 'rgba(0, 229, 255, 0.1)';
    });
    btn.addEventListener('mouseout', function() {
        btn.style.transform = `translate(0px, 0px)`;
        cursorOutline.style.transform = `translate(-50%, -50%) scale(1)`;
        cursorOutline.style.backgroundColor = 'transparent';
    });
});

// --- 3. 3D CARD TILT & DYNAMIC GLOW ---
const cards = document.querySelectorAll('.tilt-card');
cards.forEach(card => {
    const glow = card.querySelector('.card-glow');
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        // Move the glow to follow mouse
        if(glow) {
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
        }

        // Calculate 3D rotation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // Max rotation 5deg
        const rotateY = ((x - centerX) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
});

// --- 4. ADVANCED 3D WEBGL-STYLE CANVAS PARTICLES ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let scrollY = window.scrollY;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('scroll', () => { scrollY = window.scrollY; });

class Particle3D {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1000 + 100; // Depth coordinate
        this.baseSize = Math.random() * 3 + 1;
        
        // Flow field velocity
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }

    update() {
        // Parallax effect on Z-axis based on scroll
        let screenY = this.y - (scrollY * (1000 / this.z) * 0.3);
        
        // Movement
        this.x += this.vx * (1000 / this.z); // Objects closer (lower Z) move faster
        
        // Wrapping
        if (this.x > width + 100) this.x = -100;
        if (this.x < -100) this.x = width + 100;
        
        // Wrap Y taking scroll into account
        if (screenY > height + 100) this.y -= (height + 200);
        if (screenY < -100) this.y += (height + 200);

        // Perspective Projection scale
        let scale = 1000 / this.z;
        let drawX = this.x;
        let drawY = screenY;
        let drawSize = this.baseSize * scale;

        // Draw Particle with composite blooming
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(0, 229, 255, ${0.8 * scale})`; 
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawSize, 0, Math.PI * 2);
        ctx.fill();

        // Mouse interaction (Z-depth aware)
        let dx = mouse.x - drawX;
        let dy = mouse.y - drawY;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 150 * scale) {
            ctx.strokeStyle = `rgba(255, 0, 127, ${1 - dist/(150*scale)})`;
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
    }
}

function initCanvas() {
    particles = [];
    let particleCount = window.innerWidth < 768 ? 50 : 150; // Optimized for mobile
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle3D());
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    requestAnimationFrame(animateCanvas);
}
initCanvas();
animateCanvas();

// --- 5. SCROLL OBSERVER (Triggers CSS Animations) ---
function reveal() {
    var reveals = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-3d");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100; // Only trigger when fully in view
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", reveal);
reveal();
