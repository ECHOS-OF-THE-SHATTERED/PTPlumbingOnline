document.addEventListener("DOMContentLoaded", () => {
    initScrollTracker();
    initRevealAnimations();
    initMobileNav();
});

function initScrollTracker() {
    const tracker = document.getElementById("scroll-tracker");
    if (!tracker) return;
    window.addEventListener("scroll", () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        tracker.style.width = scrollPercent + "%";
    }, { passive: true });
}

function initRevealAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
    elementsToReveal.forEach(el => observer.observe(el));
}

function toggleMobileNav() {
    const overlay = document.getElementById('mobile-overlay');
    const toggleBtn = document.querySelector('.mobile-toggle');
    const body = document.body;
    
    // Toggle Logic
    if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
        body.style.overflow = ''; // Allow scrolling
    } else {
        overlay.style.display = 'block';
        body.style.overflow = 'hidden'; // Block background scrolling
    }
}

function initMobileNav() {
    const links = document.querySelectorAll('.mobile-links a');
    links.forEach(link => {
        link.addEventListener('click', toggleMobileNav);
    });
}

const facts = [
    "Dripping faucets waste 3,000 gallons/year.",
    "Copper pipes are naturally antibacterial.",
    "Water heaters need flushing once a year.",
    "Chemical cleaners can melt PVC pipes."
];
function refreshFact() {
    const el = document.getElementById('fact-display');
    if(!el) return;
    el.style.opacity = 0;
    setTimeout(() => {
        el.innerText = facts[Math.floor(Math.random() * facts.length)];
        el.style.opacity = 1;
    }, 400);
}
