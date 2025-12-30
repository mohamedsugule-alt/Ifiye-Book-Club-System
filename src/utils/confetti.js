
export const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    // Create canvas if not exists
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            vy: Math.random() * 5 + 2,
            vex: Math.random() * 2 - 1
        });
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let active = false;
        particles.forEach(p => {
            p.y += p.vy;
            p.x += p.vex;

            if (p.y < canvas.height) active = true;

            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w, p.h);
        });

        if (active && Date.now() < end) {
            requestAnimationFrame(animate);
        } else {
            // Cleanup
            if (Date.now() >= end) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Optional: remove canvas
            }
        }
    };

    animate();
};
