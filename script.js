const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const mouse = { x: null, y: null, radius: 200 }; 

// --- NEW: Scroll Tracking Variables ---
let scrollY = 0;
let scrollPercent = 0;
let scrollVelocity = 0;
let lastScrollY = window.scrollY;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// --- NEW: Track Scroll Depth and Speed ---
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    
    // Calculate how far down the page we are (0.0 to 1.0)
    let documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollPercent = documentHeight > 0 ? scrollY / documentHeight : 0;
    
    // Calculate how fast we are scrolling
    scrollVelocity = scrollY - lastScrollY;
    lastScrollY = scrollY;
});

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 1.5; // Made particles slightly larger
        this.baseVx = (Math.random() - 0.5) * 0.8;
        this.baseVy = (Math.random() - 0.5) * 0.8;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
    }

    draw(color) {
        ctx.fillStyle = color; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update(color) {
        // --- NEW: Physics reacting to scroll wheel ---
        let addedVelocityY = scrollVelocity * 0.1; 
        
        this.x += this.vx;
        this.y += this.vy - addedVelocityY; // Pushes particles when you scroll

        // Screen wrap constraints
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < -100) this.y = height + 100;
        if (this.y > height + 100) this.y = -100;

        // Mouse repel physics
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 2; 
            this.y -= forceDirectionY * force * 2;
        }
        this.draw(color);
    }
}

function init() {
    particles = [];
    // Made the network denser for better visibility
    let numberOfParticles = (width * height) / 7000; 
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

function connect(r, g, b) {
    let opacityValue = 1;
    // --- NEW: The network lines reach further the deeper you scroll ---
    let maxDistance = (width/10) * (height/10) + (scrollPercent * 6000); 

    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = dx * dx + dy * dy;

            if (distance < maxDistance) {
                opacityValue = 1 - (distance / maxDistance);
                // Significantly brightened the lines
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacityValue * 0.5})`;
                ctx.lineWidth = 1.5; // Thicker lines
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Smoothly decay the scroll push effect
    scrollVelocity *= 0.9;

    // --- NEW: Dynamic Color Math ---
    // Transitions from Sky Blue (Top) to Cyberpunk Pink/Red (Bottom)
    let r = Math.floor(0 + (scrollPercent * 255));
    let g = Math.floor(191 - (scrollPercent * 140));
    let b = Math.floor(255 - (scrollPercent * 153));
    
    let dynamicColor = `rgba(${r}, ${g}, ${b}, 0.8)`; 

    for (let i = 0; i < particles.length; i++) {
        particles[i].update(dynamicColor);
    }
    connect(r, g, b);
    
    requestAnimationFrame(animate);
}

init();
animate();

// --- MULTI-DIRECTIONAL SCROLL REVEAL ---
function reveal() {
    var reveals = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-zoom");
    
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 50; 
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", reveal);
reveal();
