class PT_Engine {
    constructor() {
        this.header = document.querySelector('.command-node');
        this.observers = [];
        this.init();
    }

    init() {
        this.setupObservers();
        this.handleScroll();
        this.initTriageLogic();
        window.addEventListener('scroll', () => this.handleScroll());
    }

    setupObservers() {
        const options = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const appearanceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    appearanceObserver.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('[data-observe]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
            appearanceObserver.observe(el);
        });
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.header.style.background = 'rgba(11, 11, 11, 0.98)';
            this.header.style.padding = '5px 0';
            this.header.style.borderBottom = '1px solid #B87333';
        } else {
            this.header.style.background = 'rgba(11, 11, 11, 0.95)';
            this.header.style.padding = '20px 0';
            this.header.style.borderBottom = '1px solid rgba(184, 115, 51, 0.2)';
        }
    }

    initTriageLogic() {
        const emergencyTrigger = document.querySelector('.emergency-trigger');
        if (emergencyTrigger) {
            emergencyTrigger.addEventListener('mouseenter', () => {
                emergencyTrigger.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.4)';
            });
            emergencyTrigger.addEventListener('mouseleave', () => {
                emergencyTrigger.style.boxShadow = 'none';
            });
        }

        const params = new URLSearchParams(window.location.search);
        if (params.has('urgency')) {
            this.handleUrgencyState(params.get('urgency'));
        }
    }

    handleUrgencyState(level) {
        if (level === 'high') {
            const root = document.documentElement;
            root.style.setProperty('--conduit', '#FF3E3E');
            const heroText = document.querySelector('.heading-authoritative');
            if (heroText) heroText.innerHTML = 'Emergency Dispatch <br><span class="conduit-text">Active Now</span>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PT_Engine();
});
