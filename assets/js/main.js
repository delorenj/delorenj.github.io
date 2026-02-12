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

// Intersection Observer for fade-in animations (non-work sections)
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

// Observe all sections except hero and work (work has its own scroll system)
document.querySelectorAll('section:not(#hero):not(#work)').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Observe writing links, opensource cards, and credentials for staggered animation
document.querySelectorAll('.writing-link, .opensource-card, .credential').forEach((element, index) => {
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
// Work Section: Scroll-Driven Video Showcase
// ============================================

(function () {
    const workSection = document.getElementById('work');
    if (!workSection) return;

    const videoBg = document.getElementById('workVideoBg');
    const video1 = document.getElementById('workVideo1');
    const video2 = document.getElementById('workVideo2');
    const gradientFallback = document.getElementById('workGradientFallback');
    const scrollIndicator = document.getElementById('workScrollIndicator');
    const projectCards = workSection.querySelectorAll('.project-card[data-video]');
    const scrollDots = workSection.querySelectorAll('.scroll-dot');

    let activeVideo = video1;
    let standbyVideo = video2;
    let currentVideoKey = null;
    let workSectionVisible = false;

    // Cache video existence checks
    const videoExistsCache = {};

    // --- Video Loading & Crossfade ---
    function getVideoPath(key) {
        return 'assets/videos/' + key + '.webm';
    }

    function loadAndCrossfade(videoKey, fallbackGradient) {
        if (videoKey === currentVideoKey) return;
        currentVideoKey = videoKey;

        const path = getVideoPath(videoKey);

        // Check cache first
        if (videoExistsCache[videoKey] === false) {
            showGradientFallback(fallbackGradient);
            return;
        }
        if (videoExistsCache[videoKey] === true) {
            doVideoCrossfade(path);
            return;
        }

        // Check if video exists
        fetch(path, { method: 'HEAD' })
            .then(res => {
                if (!res.ok) throw new Error('404');
                videoExistsCache[videoKey] = true;
                // Only proceed if this is still the current request
                if (currentVideoKey === videoKey) {
                    doVideoCrossfade(path);
                }
            })
            .catch(() => {
                videoExistsCache[videoKey] = false;
                if (currentVideoKey === videoKey) {
                    showGradientFallback(fallbackGradient);
                }
            });
    }

    function doVideoCrossfade(path) {
        standbyVideo.src = path;
        standbyVideo.load();
        standbyVideo.oncanplay = function () {
            standbyVideo.play().catch(() => {});
            // Crossfade
            standbyVideo.classList.add('work-video-active');
            activeVideo.classList.remove('work-video-active');
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
    }

    function showGradientFallback(gradient) {
        // Hide any playing video
        activeVideo.classList.remove('work-video-active');
        activeVideo.pause();
        // Set and show gradient
        if (gradient) {
            gradientFallback.style.background = gradient;
            gradientFallback.style.backgroundSize = '400% 400%';
            gradientFallback.style.animation = 'gradientDrift 15s ease infinite';
        }
        gradientFallback.classList.add('active');
    }

    // --- Section Visibility Observer (show/hide video BG) ---
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            workSectionVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
                videoBg.classList.add('visible');
                scrollIndicator.classList.add('visible');
                // Resume video if one is loaded
                if (activeVideo.src) {
                    activeVideo.play().catch(() => {});
                }
            } else {
                videoBg.classList.remove('visible');
                scrollIndicator.classList.remove('visible');
                video1.pause();
                video2.pause();
            }
        });
    }, { threshold: 0.05 });

    sectionObserver.observe(workSection);

    // --- Card Activation Observer (threshold ~0.5) ---
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Activate this card
                const card = entry.target;
                
                // Deactivate all cards
                projectCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Update scroll dots
                const cardIndex = Array.from(projectCards).indexOf(card);
                scrollDots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === cardIndex);
                });

                // Trigger video crossfade
                const videoKey = card.dataset.video;
                const fallbackGradient = card.dataset.gradient;
                if (videoKey) {
                    loadAndCrossfade(videoKey, fallbackGradient);
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
    });

    projectCards.forEach(card => {
        cardObserver.observe(card);
    });

    // --- Scroll Dot Click Navigation ---
    scrollDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index, 10);
            const targetCard = projectCards[index];
            if (targetCard) {
                targetCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });

    // --- Hide scroll arrow when near last card ---
    const scrollArrow = scrollIndicator.querySelector('.scroll-arrow');
    const lastCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrollArrow.style.opacity = '0';
            } else {
                scrollArrow.style.opacity = '1';
            }
        });
    }, { threshold: 0.5 });

    const lastCard = projectCards[projectCards.length - 1];
    if (lastCard) {
        lastCardObserver.observe(lastCard);
    }

    // --- Activate first card on load if in view ---
    // Small delay to let the page layout settle
    setTimeout(() => {
        const firstCard = projectCards[0];
        if (firstCard) {
            const rect = firstCard.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                firstCard.classList.add('active');
                const videoKey = firstCard.dataset.video;
                const fallbackGradient = firstCard.dataset.gradient;
                if (videoKey) {
                    loadAndCrossfade(videoKey, fallbackGradient);
                }
            }
        }
    }, 300);

})();


// ============================================
// Open Source Section: Selectable Cards (no video)
// ============================================

(function () {
    const osSection = document.getElementById('opensource');
    if (!osSection) return;

    const allCards = osSection.querySelectorAll('.opensource-card[data-repo]');

    // --- Card Selection (visual only, no video) ---
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
        });
    });
})();


console.log('🚀 Jarad DeLorenzo - Agentic Systems Architect');
console.log('💡 Built with intention, not templates.');
