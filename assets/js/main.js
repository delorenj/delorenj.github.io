// Smooth scroll with offset for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('#hero');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.7;
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections except hero
document.querySelectorAll('section:not(#hero)').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Observe project cards and writing links for staggered animation
document.querySelectorAll('.project-card, .writing-link, .opensource-card, .credential').forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(element);
});

// Add current year to footer
const footer = document.querySelector('footer p');
if (footer) {
    footer.innerHTML = footer.innerHTML.replace('2026', new Date().getFullYear());
}

// Floating schedule button visibility
const floatingSchedule = document.getElementById('floatingSchedule');
const heroSection = document.getElementById('hero');

function updateFloatingButton() {
    if (!floatingSchedule || !heroSection) return;
    
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    const scrollPosition = window.pageYOffset;
    
    if (scrollPosition > heroBottom - 200) {
        floatingSchedule.classList.add('visible');
    } else {
        floatingSchedule.classList.remove('visible');
    }
}

window.addEventListener('scroll', updateFloatingButton);
window.addEventListener('load', updateFloatingButton);

// ============================================
// Open Source Section: Selectable Cards + Video Background
// ============================================

(function () {
    const osSection = document.getElementById('opensource');
    if (!osSection) return;

    const video1 = document.getElementById('osVideo1');
    const video2 = document.getElementById('osVideo2');
    const gradientFallback = osSection.querySelector('.os-gradient-fallback');
    const allCards = osSection.querySelectorAll('.opensource-card[data-repo]');

    let activeVideo = video1;
    let standbyVideo = video2;
    let currentRepo = null;
    let sectionVisible = false;

    // --- Card Selection ---
    allCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Allow cmd/ctrl+click to still open links
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();

            const repo = this.dataset.repo;
            if (!repo) return;

            // Deactivate all cards, activate this one
            allCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            // Swap video
            if (repo !== currentRepo) {
                loadAndCrossfade(repo);
            }
        });
    });

    // --- Video Loading & Crossfade ---
    function getVideoPath(repo) {
        return 'assets/videos/' + repo + '.webm';
    }

    function loadAndCrossfade(repo) {
        const path = getVideoPath(repo);

        // Check if video exists via HEAD request
        fetch(path, { method: 'HEAD' })
            .then(res => {
                if (!res.ok) throw new Error('404');
                // Video exists — load it
                standbyVideo.src = path;
                standbyVideo.load();
                standbyVideo.oncanplay = function () {
                    standbyVideo.play().catch(() => {});
                    // Crossfade
                    standbyVideo.classList.add('os-video-active');
                    activeVideo.classList.remove('os-video-active');
                    gradientFallback.classList.remove('active');

                    // After transition, pause old video
                    setTimeout(() => {
                        activeVideo.pause();
                        activeVideo.removeAttribute('src');
                        activeVideo.load();
                        // Swap references
                        const tmp = activeVideo;
                        activeVideo = standbyVideo;
                        standbyVideo = tmp;
                    }, 900);

                    standbyVideo.oncanplay = null;
                };
                currentRepo = repo;
            })
            .catch(() => {
                // Video doesn't exist — show gradient fallback
                activeVideo.classList.remove('os-video-active');
                activeVideo.pause();
                gradientFallback.classList.add('active');
                currentRepo = repo;
            });
    }

    // --- Intersection Observer: play/pause on scroll ---
    const osObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sectionVisible = true;
                // Start default video if nothing loaded yet
                if (!currentRepo) {
                    const defaultCard = osSection.querySelector('.opensource-card.active');
                    const defaultRepo = defaultCard ? defaultCard.dataset.repo : '33GOD';
                    loadAndCrossfade(defaultRepo);
                } else {
                    // Resume playing
                    activeVideo.play().catch(() => {});
                }
            } else {
                sectionVisible = false;
                video1.pause();
                video2.pause();
            }
        });
    }, { threshold: 0.1 });

    osObserver.observe(osSection);
})();

console.log('🚀 Jarad DeLorenzo - Agentic Systems Architect');
console.log('💡 Built with intention, not templates.');
