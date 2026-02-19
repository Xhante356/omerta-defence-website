/* ===================================================
   OMERTA DEFENCE - Canvas Particle Network
   Constellation-style teal particles for hero section
   =================================================== */

(function () {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null, radius: 150 };

    const CONFIG = {
        particleCount: 80,
        particleColor: 'rgba(61, 143, 167,',
        lineColor: 'rgba(61, 143, 167,',
        particleMinSize: 1,
        particleMaxSize: 3,
        speed: 0.4,
        connectionDistance: 150,
        mouseConnectionDistance: 200,
    };

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize) + CONFIG.particleMinSize;
            this.speedX = (Math.random() - 0.5) * CONFIG.speed;
            this.speedY = (Math.random() - 0.5) * CONFIG.speed;
            this.opacity = Math.random() * 0.5 + 0.3;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > width + 10) this.x = -10;
            if (this.x < -10) this.x = width + 10;
            if (this.y > height + 10) this.y = -10;
            if (this.y < -10) this.y = height + 10;

            // Mouse interaction - gentle push
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += dx * force * 0.02;
                    this.y += dy * force * 0.02;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = CONFIG.particleColor + this.opacity + ')';
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        const count = width < 768 ? Math.floor(CONFIG.particleCount * 0.5) : CONFIG.particleCount;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const opacity = (1 - dist / CONFIG.connectionDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = CONFIG.lineColor + opacity + ')';
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            // Mouse connections
            if (mouse.x !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.mouseConnectionDistance) {
                    const opacity = (1 - dist / CONFIG.mouseConnectionDistance) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = CONFIG.lineColor + opacity + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', () => {
        resize();
        init();
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Pause when not visible
    const heroSection = document.getElementById('hero');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animationId) animate();
            } else {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        });
    }, { threshold: 0.1 });

    if (heroSection) observer.observe(heroSection);

    // Init
    resize();
    init();
    animate();
})();
