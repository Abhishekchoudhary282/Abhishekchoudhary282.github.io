// --- 0. DEVICE DETECTION ---
// Check if the user is on a touch device (mobile/tablet)
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// --- 1. CUSTOM FLUID CURSOR (GPU Accelerated) ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let outline = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

let outlineScale = 1;
let outlineBg = 'transparent';

// Only run custom cursor logic if NOT on a touch device
if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        cursorDot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
    });

    function renderCursor() {
        outline.x += (mouse.x - outline.x) * 0.15; 
        outline.y += (mouse.y - outline.y) * 0.15;
        
        cursorOutline.style.transform = `translate3d(${outline.x}px, ${outline.y}px, 0) translate(-50%, -50%) scale(${outlineScale})`;
        cursorOutline.style.backgroundColor = outlineBg;
        
        requestAnimationFrame(renderCursor);
    }
    renderCursor();
}

// --- 2. MAGNETIC ELEMENTS & CURSOR MORPHING ---
const magnetics = document.querySelectorAll('.magnetic');
magnetics.forEach(btn => {
    if (!isTouchDevice) {
        btn.addEventListener('mouseenter', () => {
            outlineScale = 1.5;
            outlineBg = 'rgba(0, 229, 255, 0.05)';
        });
        
        btn.addEventListener('mousemove', function(e) {
            const position = btn.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            btn.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
        });
        
        btn.addEventListener('mouseleave', function() {
            btn.style.transform = `translate3d(0px, 0px, 0)`;
            outlineScale = 1;
            outlineBg = 'transparent';
        });
    }
});

// --- 3. 3D CARD TILT (Disabled on Mobile for better UX) ---
const cards = document.querySelectorAll('.tilt-card');
cards.forEach(card => {
    // Only apply the 3D mouse tracking if on a desktop
    if (!isTouchDevice) {
        card.addEventListener('mouseenter', () => {
            card.style.transitionDelay = '0s';
            card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease'; 
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5; 
            const rotateY = ((x - centerX) / centerX) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    }
});

// --- 4. ADVANCED 3D WEBGL-STYLE CANVAS PARTICLES ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
const TWO_PI = Math.PI * 2;
let width, height;
let particles = [];
let scrollY = window.scrollY;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

// Mobile touch support for particles
window.addEventListener('touchstart', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: true });

// Reset particle attraction when touch ends
window.addEventListener('touchend', () => {
    mouse.x = window.innerWidth / 2;
    mouse.y = window.innerHeight / 2;
});

class Particle3D {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1000 + 100; 
        this.baseSize = Math.random() * 0.3 + 0.05; 
        this.baseVx = (Math.random() - 0.5) * 0.02;
        this.baseVy = (Math.random() - 0.5) * 0.02;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
    }

    update() {
        let screenY = this.y - (scrollY * (1000 / this.z) * 0.3);
        let scale = 1000 / this.z;
        let drawX = this.x;
        let drawY = screenY;
        let drawSize = this.baseSize * scale;

        let dx = mouse.x - drawX;
        let dy = mouse.y - drawY;
        
        let distSq = dx*dx + dy*dy;
        // Smaller interaction radius on mobile
        let interactionRadius = (isTouchDevice ? 150 : 250) * scale; 
        let interactionRadiusSq = interactionRadius * interactionRadius;

        if (distSq < interactionRadiusSq) {
            let dist = Math.sqrt(distSq);
            let force = (interactionRadius - dist) / interactionRadius;
            this.vx += (dx / dist) * force * 0.002; 
            this.vy += (dy / dist) * force * 0.002;
        } else {
            this.vx += (this.baseVx - this.vx) * 0.005; 
            this.vy += (this.baseVy - this.vy) * 0.005;
        }

        let speedSq = this.vx * this.vx + this.vy * this.vy;
        let maxSpeedSq = 0.04; // 0.2 * 0.2
        if (speedSq > maxSpeedSq) {
            let speed = Math.sqrt(speedSq);
            this.vx = (this.vx / speed) * 0.2;
            this.vy = (this.vy / speed) * 0.2;
        }

        this.x += this.vx * scale; 
        this.y += this.vy * scale; 

        screenY = this.y - (scrollY * scale * 0.3);
        drawY = screenY;

        if (this.x > width + 100) this.x = -100;
        if (this.x < -100) this.x = width + 100;
        if (screenY > height + 100) this.y -= (height + 200);
        if (screenY < -100) this.y += (height + 200);

        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(220, 250, 255, ${0.08 * scale})`; 
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawSize, 0, TWO_PI);
        ctx.fill();
    }
}

function initCanvas() {
    particles = [];
    let particleCount = window.innerWidth < 768 ? 100 : 250; 
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle3D());
    }
}

let isAnimating = true;

function animateCanvas() {
    if (!isAnimating) return;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    requestAnimationFrame(animateCanvas);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isAnimating = false;
    } else {
        isAnimating = true;
        animateCanvas();
    }
});

initCanvas();
animateCanvas();

// --- 5. INTERSECTION OBSERVER ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-3d').forEach(el => {
    observer.observe(el);
});
