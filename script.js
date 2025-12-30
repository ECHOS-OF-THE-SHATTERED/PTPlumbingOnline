"use strict";
const SYSTEM_CONFIG = {
    animation: {
        revealThreshold: 0.15,
        counterSpeed: 2000,
        scrollSmoothness: 0.08,
        parallaxIntensity: 0.3
    },
    ui: {
        menuStickyPoint: 100,
        mobileBreakpoint: 1024,
        loaderDuration: 1800,
        typingSpeed: 30
    },
    routes: {
        home: "index",
        services: "services",
        about: "about",
        contact: "contact"
    }
};
class StateManager {
    constructor() {
        this.state = {
            menuOpen: false,
            scrolled: false,
            loading: true,
            page: document.body.dataset.currentPage || "unknown",
            formSubmitting: false,
            heroVisible: true
        };
        this.observers = [];
    }
    update(key, value) {
        if (this.state[key] !== value) {
            this.state[key] = value;
            this.notify(key, value);
        }
    }
    get(key) {
        return this.state[key];
    }
    subscribe(callback) {
        this.observers.push(callback);
    }
    notify(key, value) {
        this.observers.forEach(obs => obs(key, value, this.state));
    }
}
const AppState = new StateManager();
class DOMRef {
    static get(selector, all = false, parent = document) {
        if (all) {
            return [...parent.querySelectorAll(selector)];
        }
        return parent.querySelector(selector);
    }
    static create(tag, classes = [], content = "") {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes);
        if (content) el.innerHTML = content;
        return el;
    }
    static bind(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }
}
class BootSequence {
    constructor() {
        this.loader = DOMRef.get("#master-loader");
        this.bar = DOMRef.get("#initialization-bar");
        this.body = document.body;
        this.init();
    }
    init() {
        if (!this.loader) return;
        window.scrollTo(0, 0);
        this.startLoad();
    }
    startLoad() {
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 5;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                this.completeLoad();
            }
            if (this.bar) this.bar.style.width = width + "%";
        }, 30);
    }
    completeLoad() {
        setTimeout(() => {
            this.body.classList.remove("system-initializing", "system-loading");
            this.body.classList.add("system-active");
            AppState.update("loading", false);
            this.removeCurtain();
        }, 500);
    }
    removeCurtain() {
        this.loader.style.opacity = "0";
        this.loader.style.pointerEvents = "none";
        setTimeout(() => {
            this.loader.remove();
            AnimationEngine.triggerIntro();
        }, 800);
    }
}
class AnimationEngine {
    constructor() {
        this.targets = DOMRef.get(".reveal-on-scroll", true);
        this.parallaxElements = DOMRef.get(".image-parallax-layer", true);
        this.magneticButtons = DOMRef.get(".magnetic-btn", true);
        this.tiltCards = DOMRef.get(".card-3d-hover", true);
        this.init();
    }
    init() {
        this.observeScroll();
        this.setupParallax();
        this.setupMagneticButtons();
        this.setupTiltEffects();
        this.handleNoiseCanvas();
    }
    static triggerIntro() {
        const header = DOMRef.get(".reveal-header-load");
        if (header) header.classList.add("active");
    }
    observeScroll() {
        const observerConfig = {
            root: null,
            rootMargin: "0px",
            threshold: SYSTEM_CONFIG.animation.revealThreshold
        };
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    if (entry.target.hasAttribute("data-target")) {
                        NumberCruncher.process(entry.target);
                    }
                    obs.unobserve(entry.target);
                }
            });
        }, observerConfig);
        this.targets.forEach(el => observer.observe(el));
    }
    setupParallax() {
        if (!this.parallaxElements.length) return;
        window.addEventListener("scroll", () => {
            const y = window.pageYOffset;
            this.parallaxElements.forEach(el => {
                const speed = 0.5;
                el.style.transform = `translateY(${y * speed}px)`;
            });
        });
    }
    setupMagneticButtons() {
        this.magneticButtons.forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const deltaX = (x - centerX) / 8;
                const deltaY = (y - centerY) / 8;
                btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    }
    setupTiltEffects() {
        this.tiltCards.forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.zIndex = "10";
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
                card.style.zIndex = "1";
            });
        });
    }
    handleNoiseCanvas() {
        const overlay = DOMRef.get("#noise-overlay");
        if (!overlay) return;
    }
}
class NumberCruncher {
    static process(element) {
        const target = parseInt(element.getAttribute("data-target"), 10);
        if (isNaN(target)) return;
        const duration = SYSTEM_CONFIG.animation.counterSpeed;
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);
        const easeOut = t => t * (2 - t);
        let frame = 0;
        const counter = setInterval(() => {
            frame++;
            const progress = easeOut(frame / totalFrames);
            const currentCount = Math.round(target * progress);
            if (parseInt(element.innerHTML) !== currentCount) {
                element.innerHTML = currentCount + (element.innerHTML.includes("%") ? "%" : "+");
            }
            if (frame === totalFrames) {
                clearInterval(counter);
            }
        }, frameDuration);
    }
}
class NavigationController {
    constructor() {
        this.header = DOMRef.get(".main-navigation-wrapper");
        this.mobileTrigger = DOMRef.get(".mobile-nav-trigger");
        this.mobileOverlay = DOMRef.get("#mobile-menu-overlay");
        this.closeTrigger = DOMRef.get(".mobile-close-action");
        this.links = DOMRef.get(".mobile-link-large", true);
        this.stickyStatus = false;
        this.init();
    }
    init() {
        if (!this.header) return;
        window.addEventListener("scroll", this.handleScroll.bind(this));
        if (this.mobileTrigger) {
            this.mobileTrigger.addEventListener("click", this.toggleMenu.bind(this));
        }
        if (this.closeTrigger) {
            this.closeTrigger.addEventListener("click", this.closeMenu.bind(this));
        }
        this.links.forEach(link => {
            link.addEventListener("click", this.closeMenu.bind(this));
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && AppState.get("menuOpen")) {
                this.closeMenu();
            }
        });
        this.highlightActivePage();
    }
    handleScroll() {
        const y = window.scrollY;
        if (y > SYSTEM_CONFIG.ui.menuStickyPoint) {
            if (!this.stickyStatus) {
                this.header.classList.add("scrolled-active");
                this.stickyStatus = true;
            }
        } else {
            if (this.stickyStatus) {
                this.header.classList.remove("scrolled-active");
                this.stickyStatus = false;
            }
        }
        AppState.update("scrolled", this.stickyStatus);
    }
    toggleMenu() {
        const isOpen = AppState.get("menuOpen");
        if (isOpen) this.closeMenu();
        else this.openMenu();
    }
    openMenu() {
        this.mobileOverlay.setAttribute("aria-hidden", "false");
        this.mobileOverlay.classList.add("is-visible");
        document.body.style.overflow = "hidden";
        AppState.update("menuOpen", true);
        const links = DOMRef.get(".staggered-entry", true);
        links.forEach((link, idx) => {
            link.style.animationDelay = `${(idx * 0.1) + 0.2}s`;
            link.classList.add("animate-in");
        });
    }
    closeMenu() {
        this.mobileOverlay.setAttribute("aria-hidden", "true");
        this.mobileOverlay.classList.remove("is-visible");
        document.body.style.overflow = "";
        AppState.update("menuOpen", false);
        const links = DOMRef.get(".staggered-entry", true);
        links.forEach(link => {
            link.classList.remove("animate-in");
            link.style.animationDelay = "0s";
        });
    }
    highlightActivePage() {
        const currentPath = window.location.pathname;
        const desktopLinks = DOMRef.get(".nav-link-anchor", true);
        desktopLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (currentPath.includes(href) && href !== "index.html") {
                link.classList.add("current-active-node");
            } else if ((currentPath.endsWith("/") || currentPath.endsWith("index.html")) && href === "index.html") {
                link.classList.add("current-active-node");
            }
        });
    }
}
class TimeKeeperSystem {
    constructor() {
        this.clockElement = DOMRef.get("#live-clock");
        this.statusIndicators = DOMRef.get(".status-led", true);
        this.init();
    }
    init() {
        if (this.clockElement) {
            this.startClock();
        }
        if (this.statusIndicators.length) {
            this.startBlinkRoutine();
        }
    }
    startClock() {
        const update = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, "0");
            const m = String(now.getMinutes()).padStart(2, "0");
            const s = String(now.getSeconds()).padStart(2, "0");
            if (this.clockElement) {
                this.clockElement.innerText = `${h}:${m}:${s}`;
                this.clockElement.setAttribute("datetime", now.toISOString());
            }
        };
        setInterval(update, 1000);
        update();
    }
    startBlinkRoutine() {
        this.statusIndicators.forEach(led => {
            setInterval(() => {
                led.style.opacity = Math.random() > 0.8 ? "0.4" : "1";
            }, 1500);
        });
    }
}
class FormHandlerProtocol {
    constructor() {
        this.form = DOMRef.get("#dispatch-form");
        this.successModal = DOMRef.get("#dispatch-success-modal");
        this.successClose = DOMRef.get("#success-close-btn");
        this.phoneInputs = DOMRef.get("input[type='tel']", true);
        this.inputs = DOMRef.get("input, textarea, select", true, this.form);
        this.init();
    }
    init() {
        if (!this.form) return;
        this.form.addEventListener("submit", this.handleSubmit.bind(this));
        if (this.successClose) {
            this.successClose.addEventListener("click", this.closeModal.bind(this));
        }
        this.setupMasking();
        this.setupFloatingLabels();
        this.checkForURLParams();
    }
    setupMasking() {
        this.phoneInputs.forEach(input => {
            input.addEventListener("input", (e) => {
                let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            });
        });
    }
    setupFloatingLabels() {
        this.inputs.forEach(input => {
            input.addEventListener("focus", () => input.parentNode.classList.add("focused"));
            input.addEventListener("blur", () => {
                if (!input.value) input.parentNode.classList.remove("focused");
            });
        });
    }
    async handleSubmit(e) {
        e.preventDefault();
        if (AppState.get("formSubmitting")) return;
        if (!this.validate()) return;
        AppState.update("formSubmitting", true);
        const submitBtn = this.form.querySelector(".submit-transmission-btn");
        const btnText = submitBtn.querySelector(".btn-text");
        const spinner = submitBtn.querySelector(".loading-spinner");
        const originalText = btnText.innerText;
        btnText.style.opacity = "0";
        spinner.style.display = "block";
        submitBtn.classList.add("processing");
        await this.simulateNetworkDelay(2500);
        submitBtn.classList.remove("processing");
        spinner.style.display = "none";
        btnText.style.opacity = "1";
        btnText.innerText = "TRANSMISSION SECURED";
        this.form.reset();
        this.showSuccessModal();
        setTimeout(() => {
            btnText.innerText = originalText;
            AppState.update("formSubmitting", false);
        }, 5000);
    }
    validate() {
        let valid = true;
        this.inputs.forEach(input => {
            if (input.hasAttribute("required") && !input.value.trim()) {
                this.markInvalid(input);
                valid = false;
            } else if (input.type === "email" && input.value) {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(input.value)) {
                    this.markInvalid(input);
                    valid = false;
                }
            } else {
                this.markValid(input);
            }
        });
        if (!valid) this.shakeForm();
        return valid;
    }
    markInvalid(input) {
        input.parentElement.classList.add("error-state");
        input.parentElement.classList.remove("valid-state");
        input.addEventListener("input", () => {
            input.parentElement.classList.remove("error-state");
        }, { once: true });
    }
    markValid(input) {
        input.parentElement.classList.remove("error-state");
        input.parentElement.classList.add("valid-state");
    }
    shakeForm() {
        this.form.classList.add("shake-anim");
        setTimeout(() => this.form.classList.remove("shake-anim"), 500);
    }
    simulateNetworkDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    showSuccessModal() {
        if (!this.successModal) {
            alert("Transmission Logged Successfully. Agent dispatched.");
            return;
        }
        this.successModal.classList.add("visible");
        this.successModal.setAttribute("aria-hidden", "false");
    }
    closeModal() {
        this.successModal.classList.remove("visible");
        this.successModal.setAttribute("aria-hidden", "true");
    }
    checkForURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get("type");
        const subj = urlParams.get("subj");
        const subjectField = DOMRef.get("#f-service");
        const messageField = DOMRef.get("#f-message");
        if (type && subjectField) {
            switch(type) {
                case "leak": subjectField.value = "leak_detect"; break;
                case "drain": subjectField.value = "drain_clean"; break;
                case "heater": subjectField.value = "water_heater"; break;
                case "repair": subjectField.value = "emergency"; break;
            }
        }
        if (subj === "career" && messageField) {
            messageField.value = "RE: Career Application. I am a licensed technician interested in joining the unit. My qualifications are...";
            if (subjectField) subjectField.value = "emergency"; 
        }
    }
}
class TerminalWriter {
    constructor() {
        this.monitor = DOMRef.get("#fact-display-monitor");
        this.dataArray = [
            "Initializing diagnostics protocol...",
            "Loading client reviews database...",
            "Review Log 492: 'Precision work found leak in 20 mins.'",
            "Review Log 501: 'Best pricing in the sector.'",
            "Checking local grid status... SECURE."
        ];
        this.idx = 0;
        this.interval = null;
        this.init();
    }
    init() {
        if (!this.monitor) return;
        this.triggerNewFact = this.triggerNewFact.bind(this);
        const refreshBtns = DOMRef.get(".refresh-data-btn", true);
        refreshBtns.forEach(btn => btn.addEventListener("click", this.triggerNewFact));
        this.typeWriterEffect(this.monitor.innerText);
    }
    typeWriterEffect(text) {
        if (!this.monitor) return;
        this.monitor.innerHTML = "";
        let i = 0;
        const speed = SYSTEM_CONFIG.ui.typingSpeed;
        const type = () => {
            if (i < text.length) {
                this.monitor.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        type();
    }
    triggerNewFact() {
        this.monitor.style.opacity = 0;
        setTimeout(() => {
            this.idx = (this.idx + 1) % this.dataArray.length;
            this.typeWriterEffect(this.dataArray[this.idx]);
            this.monitor.style.opacity = 1;
        }, 300);
    }
}
class RadarSystem {
    constructor() {
        this.map = DOMRef.get(".radar-map-container");
        this.dots = DOMRef.get(".location-dot", true);
        this.init();
    }
    init() {
        if (!this.map) return;
        this.startPulse();
        this.activateTooltips();
    }
    startPulse() {
        const ping = () => {
            const randomDot = this.dots[Math.floor(Math.random() * this.dots.length)];
            randomDot.classList.add("active-ping");
            setTimeout(() => {
                randomDot.classList.remove("active-ping");
            }, 2000);
        };
        setInterval(ping, 2500);
    }
    activateTooltips() {
        this.dots.forEach(dot => {
            dot.addEventListener("mouseenter", () => {
                const label = dot.dataset.loc;
                const status = DOMRef.get(".map-ui-status");
                if (status) status.innerHTML = `SCANNING: ${label}... <span style='color:#0f0'>CONNECTED</span>`;
            });
            dot.addEventListener("mouseleave", () => {
                const status = DOMRef.get(".map-ui-status");
                if (status) status.innerHTML = `<span class="ui-row">UNITS ACTIVE: 4</span><span class="ui-row">GRID STATUS: SECURE</span>`;
            });
        });
    }
}
class GlobalAccordion {
    constructor() {
        this.details = DOMRef.get("details", true);
        this.init();
    }
    init() {
        this.details.forEach(targetDetail => {
            targetDetail.addEventListener("click", () => {
                this.details.forEach(detail => {
                    if (detail !== targetDetail) {
                        detail.removeAttribute("open");
                    }
                });
            });
        });
    }
}
class StickyCallButton {
    constructor() {
        this.element = DOMRef.get("#sticky-call-btn-wrapper");
        this.init();
    }
    init() {
        if (!this.element) return;
        window.addEventListener("scroll", () => {
            if (window.scrollY > 400) {
                this.element.classList.remove("hidden-on-load");
                this.element.classList.add("visible");
            } else {
                this.element.classList.remove("visible");
            }
        });
    }
}
class ServiceProtocolRouter {
    constructor() {
        this.currentPage = AppState.get("page");
        this.init();
    }
    init() {
        if (this.currentPage !== "services") return;
        this.highlightActiveSection();
    }
    highlightActiveSection() {
        if (window.location.hash) {
            const id = window.location.hash.replace("#", "");
            // Logic to highlight service cards based on hash would go here
            // Mapping existing IDs or scrolling to position
        }
    }
}
class FooterInteractivity {
    constructor() {
        this.orb = DOMRef.get(".floating-contact-orb");
        this.init();
    }
    init() {
        if (!this.orb) return;
        this.orb.addEventListener("mouseenter", () => {
            this.orb.innerHTML = "CONTACT?";
            this.orb.style.width = "100px";
            this.orb.style.borderRadius = "50px";
        });
        this.orb.addEventListener("mouseleave", () => {
            this.orb.innerHTML = "";
            this.orb.style.width = "50px";
            this.orb.style.borderRadius = "50%";
        });
        this.orb.addEventListener("click", () => {
            window.location.href = "contact.html";
        });
    }
}
const CanvasEffect = {
    drawGrid: function(ctx, w, h) {
        ctx.strokeStyle = "rgba(184, 115, 51, 0.05)";
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x <= w; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    },
    init: function() {
        const canvas = document.createElement("canvas");
        const container = DOMRef.get(".hero-bg-mesh");
        if (!container) return;
        container.appendChild(canvas);
        const resize = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            const ctx = canvas.getContext("2d");
            this.drawGrid(ctx, canvas.width, canvas.height);
        };
        window.addEventListener("resize", resize);
        resize();
    }
};
document.addEventListener("DOMContentLoaded", () => {
    new BootSequence();
    new NavigationController();
    new TimeKeeperSystem();
    new AnimationEngine();
    new TerminalWriter();
    new GlobalAccordion();
    new StickyCallButton();
    new FooterInteractivity();
    if (document.querySelector(".radar-map-container")) {
        new RadarSystem();
    }
    if (document.querySelector("#dispatch-form")) {
        new FormHandlerProtocol();
    }
    if (document.querySelector(".hero-bg-mesh")) {
        CanvasEffect.init();
    }
    new ServiceProtocolRouter();
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            document.body.classList.remove("system-loading");
            DOMRef.get("#master-loader")?.remove();
        }
    });
    console.log("%c PT PLUMBING SYSTEM %c ACTIVE v2.4 ", "background: #000; color: #fff; padding: 5px; border: 1px solid #B87333;", "background: #B87333; color: #fff; padding: 5px;");
});
const FileUploader = {
    init: function() {
        const zone = DOMRef.get("#drop-zone-area");
        const input = DOMRef.get("#f-file");
        if (!zone || !input) return;
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.add('highlight'), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.remove('highlight'), false);
        });
        zone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            FileUploader.handleFiles(files, zone);
        });
        input.addEventListener('change', function() {
            FileUploader.handleFiles(this.files, zone);
        });
        zone.addEventListener('click', () => input.click());
    },
    handleFiles: function(files, uiContainer) {
        if (!files.length) return;
        const textDisplay = uiContainer.querySelector(".upload-text");
        textDisplay.innerText = `${files.length} FILE(S) STAGED FOR UPLOAD`;
        uiContainer.classList.add("file-staged");
        const existingList = uiContainer.querySelectorAll(".file-preview-list");
        if (existingList) existingList.forEach(l => l.remove());
        const list = DOMRef.create("div", ["file-preview-list"]);
        [...files].forEach(file => {
            const item = DOMRef.create("div", ["file-item"]);
            item.innerText = `${file.name} (${Math.round(file.size / 1024)}KB)`;
            list.appendChild(item);
        });
        uiContainer.appendChild(list);
    }
};
if (document.querySelector("#drop-zone-area")) {
    FileUploader.init();
}
class CookieController {
    static get(name) {
        const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    }
    static set(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + 24*60*60*1000*days);
        document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    }
}
class UserPreferences {
    constructor() {
        this.highContrast = false;
        this.init();
    }
    init() {
        this.checkOSPreference();
        this.loadSaved();
    }
    checkOSPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
            this.highContrast = true;
            this.apply();
        }
    }
    loadSaved() {
        const saved = CookieController.get("pt_theme_pref");
        if (saved === "high_contrast") {
            this.highContrast = true;
            this.apply();
        }
    }
    apply() {
        if (this.highContrast) {
            document.body.classList.add("access-mode-high-contrast");
        }
    }
    toggle() {
        this.highContrast = !this.highContrast;
        document.body.classList.toggle("access-mode-high-contrast");
        CookieController.set("pt_theme_pref", this.highContrast ? "high_contrast" : "standard", 30);
    }
}
const ThemeHandler = new UserPreferences();
class TickerTape {
    constructor() {
        this.track = DOMRef.get(".ticker-track-mask");
        this.items = DOMRef.get(".ticker-message-item", true);
        if (this.track && this.items.length) {
            this.cloneContent();
        }
    }
    cloneContent() {
    }
}
class ErrorBoundary {
    static catchAll() {
        window.addEventListener("error", (e) => {
            console.warn("PT_SYSTEM_WARN: ", e.message);
            const overlay = DOMRef.create("div", ["system-toast-error"], `SYSTEM ALERT: ${e.message}`);
            document.body.appendChild(overlay);
            setTimeout(() => overlay.remove(), 4000);
        });
    }
}
ErrorBoundary.catchAll();
class ExternalLinkGuard {
    constructor() {
        this.links = DOMRef.get("a[target='_blank']", true);
        this.init();
    }
    init() {
        this.links.forEach(link => {
            link.setAttribute("rel", "noopener noreferrer");
            link.addEventListener("click", (e) => {
                if (!confirm("NOTICE: You are leaving the PT Plumbing secure node. Proceed?")) {
                    e.preventDefault();
                }
            });
        });
    }
}
new ExternalLinkGuard();
const KonamiCode = {
    sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    index: 0,
    init: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === this.sequence[this.index]) {
                this.index++;
                if (this.index === this.sequence.length) {
                    this.activateEgg();
                    this.index = 0;
                }
            } else {
                this.index = 0;
            }
        });
    },
    activateEgg: function() {
        alert("ACCESS GRANTED: ADMIN CONSOLE [Simulated]");
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
    }
};
KonamiCode.init();
