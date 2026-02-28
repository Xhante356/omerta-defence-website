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


/* ===================================================
   MATRIX DIGITAL RAIN - Cyber Section
   Teal-colored falling ASCII + Japanese characters
   =================================================== */

(function () {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    // Don't run on mobile or reduced motion
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReduced) {
        canvas.style.display = 'none';
        return;
    }

    const ctx = canvas.getContext('2d');
    let width, height, columns, drops;
    let matrixAnimId = null;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const tealColor = 'rgba(61, 143, 167,';

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
        columns = Math.floor(width / fontSize);
        drops = new Array(columns).fill(1);
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const opacity = 0.3 + Math.random() * 0.5;
            ctx.fillStyle = tealColor + opacity + ')';
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        matrixAnimId = requestAnimationFrame(draw);
    }

    // Only run when cyber section is visible
    const cyberSection = document.getElementById('cyber');
    if (!cyberSection) return;

    const matrixObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                resize();
                if (!matrixAnimId) draw();
            } else {
                if (matrixAnimId) {
                    cancelAnimationFrame(matrixAnimId);
                    matrixAnimId = null;
                }
            }
        });
    }, { threshold: 0.1 });

    matrixObserver.observe(cyberSection);

    window.addEventListener('resize', () => {
        if (matrixAnimId) resize();
    });
})();
