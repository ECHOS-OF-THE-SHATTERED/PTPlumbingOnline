document.addEventListener("DOMContentLoaded", () => {
    SystemCore.init();
    NavSystem.init();
    TimeSystem.init();
    FormSystem.init();
    ScrollSystem.init();
});
const SystemCore = {
    init: function() {
        console.log("CORE: Systems Active. Architecture by Voidborn.");
        this.preventDrag();
    },
    preventDrag: function() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
    }
};
const NavSystem = {
    toggle: document.querySelector('.hamburger-trigger'),
    closeBtn: document.querySelector('.close-menu-btn'),
    overlay: document.querySelector('.mobile-menu-overlay'),
    init: function() {
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.openMenu());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeMenu());
        }
        this.highlightActivePage();
    },
    openMenu: function() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    closeMenu: function() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    },
    highlightActivePage: function() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            if(link.getAttribute('href') === currentPath) link.classList.add('active-page');
        });
        document.querySelectorAll('.mobile-link').forEach(link => {
            if(link.getAttribute('href') === currentPath) link.classList.add('active-mobile');
        });
    }
};
const TimeSystem = {
    statusText: document.querySelector('.live-text'),
    statusDot: document.querySelector('.blink-dot'),
    init: function() {
        if(this.statusText && this.statusDot) {
            this.updateStatus();
            setInterval(() => this.updateStatus(), 60000); 
        }
    },
    updateStatus: function() {
        const now = new Date();
        const day = now.getDay(); 
        const hour = now.getHours();
        const isWorkDay = day >= 1 && day <= 5;
        const isWorkHour = hour >= 7 && hour <= 19;
        if(isWorkDay && isWorkHour) {
            this.statusDot.classList.remove('closed');
            this.statusText.textContent = "DISPATCH: ONLINE";
            this.statusText.style.color = "#e68a40";
        } else {
            this.statusDot.classList.add('closed');
            this.statusText.textContent = "EMERGENCY ONLY";
            this.statusText.style.color = "#ff5555";
        }
    }
};
const FormSystem = {
    form: document.getElementById('primary-dispatch-form'),
    btn: document.querySelector('.submit-btn-lock'),
    
    init: function() {
        if(!this.form) return;
        this.form.addEventListener('submit', (e) => {
            const inputs = this.form.querySelectorAll('input, select, textarea');
            let isValid = true;
            inputs.forEach(input => {
                if(input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = "red";
                } else {
                    input.style.borderColor = "#333";
                }
            });
            if(!isValid) {
                e.preventDefault();
                return;
            }
            if(this.btn) {
                const originalText = this.btn.innerText;
                this.btn.innerText = "ENCRYPTING DATA...";
                this.btn.style.opacity = "0.7";
                this.btn.style.cursor = "wait";
            }
        });
    }
};
const ScrollSystem = {
    init: function() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        }, { threshold: 0.1 });
        const animatedElements = document.querySelectorAll('.service-card, .service-row-layout, .timeline-node');
        animatedElements.forEach(el => {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            el.style.transition = "all 0.6s ease-out";
            observer.observe(el);
        });
    }
};
