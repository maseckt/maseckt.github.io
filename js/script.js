document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        body: document.body,
        blackScreen: document.querySelector('.black-screen'),
                          musicIcon: document.querySelector('.music-icon'),
                          cards: document.querySelectorAll('.card')
    };
    const footer = document.querySelector('.footer');
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0;
    let audioReady = false;
    const canvas = document.createElement('canvas');
    canvas.className = 'background-canvas';
    dom.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const PARTICLE_COLOR = '#83a598';
    let particles = [];
    let targetLimit = getParticleLimit();
    let currentLimit = targetLimit;

    function getParticleLimit() {
        return window.innerWidth < 768 ? 70 : 120;
    }
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
                          y: Math.random() * canvas.height,
                          r: Math.random() * 4 + 1,
                          vx: (Math.random() - 0.5) * 0.6,
                          vy: (Math.random() - 0.5) * 0.6,
                          a: Math.random() * 0.5 + 0.4
        };
    }
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.a -= 0.004;
            if (p.a <= 0) particles.splice(i, 1);
        }
        while (particles.length < currentLimit) {
            particles.push(createParticle());
        }
    }
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            ctx.globalAlpha = p.a;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            g.addColorStop(0, PARTICLE_COLOR);
            g.addColorStop(1, 'rgba(131,165,152,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    function animate() {
        updateParticles();
        drawParticles();
        requestAnimationFrame(animate);
    }
    function ensureAudioLoaded() {
        if (audioReady) return;
        audio.src = 'music/music.opus';
        audio.load();
        audioReady = true;
    }
    function fadeInAudio(target = 0.1) {
        ensureAudioLoaded();
        if (!audio.paused) return;
        audio.play().catch(() => {});
        targetLimit = getParticleLimit();
        let v = audio.volume;
        function step() {
            v += 0.006;
            audio.volume = Math.min(v, target);
            currentLimit = Math.min(currentLimit + 2, targetLimit);
            if (audio.volume < target || currentLimit < targetLimit) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    function fadeOutAudio() {
        let v = audio.volume;
        targetLimit = 3;
        function step() {
            v -= 0.01;
            audio.volume = Math.max(v, 0);
            currentLimit = Math.max(currentLimit - 3, targetLimit);
            if (audio.volume > 0 || currentLimit > targetLimit) {
                requestAnimationFrame(step);
            } else {
                audio.pause();
            }
        }
        requestAnimationFrame(step);
    }
    function showCards() {
        dom.cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), i * 100);
        });
    }
    dom.blackScreen.addEventListener('click', () => {
        dom.blackScreen.style.opacity = '0';
        fadeInAudio();
        showCards();
        setTimeout(() => {
            dom.blackScreen.classList.add('hidden');
            if (footer) footer.classList.add('visible');
        }, 50);
            dom.musicIcon.classList.remove('hidden');
    });
    dom.musicIcon.addEventListener('click', () => {
        audio.paused ? fadeInAudio() : fadeOutAudio();
    });
    window.addEventListener('resize', () => {
        targetLimit = getParticleLimit();
        resizeCanvas();
    });
    resizeCanvas();
    animate();
});
