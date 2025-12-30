document.addEventListener("DOMContentLoaded", () => {
    initSystem();
    initNavigation();
    initLiveStatus();
    initScrollMechanics();
    if(document.getElementById('contact-form')) initFormValidation();
    if(document.getElementById('fact-display')) rotateFact();
});
function initSystem() {
    console.log("System Status: ONLINE. Ready for deployment.");
    // Smooth opacity load for "Premium" feel on entry
    document.body.style.opacity = '1'; 
}
function initNavigation() {
    const toggle = document.querySelector('.mobile-toggle');
    const overlay = document.getElementById('mobile-overlay');
    const closeBtn = document.querySelector('.mobile-close');
    if(toggle && overlay) {
        toggle.addEventListener('click', () => {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Lock scroll
        });
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto'; // Unlock scroll
        });
    }
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.desktop-menu a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if(linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
function initLiveStatus() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text-dynamic');
    if(!statusDot) return;
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const hour = now.getHours();
    const isWeekend = (day === 0 || day === 6);
    const isAfterHours = (hour < 7 || hour > 19);
    if (isWeekend || isAfterHours) {
        statusDot.style.background = '#e74c3c'; // Red
        if(statusText) statusText.textContent = "EMERGENCY DISPATCH ONLY";
    } else {
        statusDot.style.background = '#2ecc71'; // Green
        if(statusText) statusText.textContent = "TECHS AVAILABLE";
    }
}
function initScrollMechanics() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.glass-nav');
        if (window.scrollY > 100) {
            nav.classList.add('compressed');
        } else {
            nav.classList.remove('compressed');
        }
    });
}
function initFormValidation() {
    const form = document.getElementById('contact-form');
    if(!form) return;
    form.addEventListener('submit', function(e) {
        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerText;
        btn.innerText = "TRANSMITTING...";
        btn.style.backgroundColor = "#333";
        btn.style.borderColor = "#333";
    });
}
const facts = [
    "[TIP] TANKLESS HEATERS REDUCE BILLS BY 30%",
    "[WARN] CHEMICAL CLEANERS CORRODE PIPES USE ENZYMES",
    "[MAINT] FLUSH HEATERS ANNUALLY FOR SEDIMENT",
    "[SAFETY] LABEL YOUR MAIN WATER SHUT-OFF VALVE",
    "[DEBUG] NO HIDDEN FEES PROTOCOL ACTIVE"
];
function rotateFact() {
    const el = document.getElementById("fact-display");
    if(!el) return;
    el.style.opacity = 0;
    setTimeout(() => {
        el.innerText = facts[Math.floor(Math.random() * facts.length)];
        el.style.opacity = 1;
    }, 400);
}
