const VOIDBORN_ARCH_CONFIG = {
  system: {
    version: "2.5.0",
    id: "PT-PLUMB-NODE-ALPHA",
    debugMode: false,
    refreshRate: 60
  },
  time: {
    targetTimezone: "America/New_York",
    openingHour: 7,
    closingHour: 19,
    openDays: [
      1,
      2,
      3,
      4,
      5
    ]
  },
  theme: {
    primaryColor: "#B87333",
    secondaryColor: "#0a0a0a",
    alertColor: "#ff3b3b",
    successColor: "#00ff66",
    fontPrimary: "Playfair Display",
    fontMono: "Courier Prime"
  },
  physics: {
    particleCount: 65,
    connectionDistance: 150,
    baseVelocity: 0.5,
    canvasId: "hero-particle-system"
  },
  selectors: {
    navWrapper: ".main-navigation-wrapper",
    navItems: ".nav-link-item",
    mobileOverlay: ".mobile-menu-overlay",
    hamburgerBtn: ".hamburger-btn-control",
    closeMenuBtn: ".close-menu-btn",
    scrollElements: ".service-card, .timeline-node, .hero-text-content, .hero-visual-module",
    statusBadge: ".status-indicator-light",
    statusText: ".status-text",
    securityBadge: ".security-credit-badge",
    dynamicTicker: ".ticker-content-track"
  }
};
class VoidUtils {
  static getTimestamp() {
    return new Date().toISOString();
  }
  static formatPhoneNumber(raw) {
    const cleaned = raw.replace(/\D/g, "");
    if (cleaned.length < 4) {
      return cleaned;
    }
    if (cleaned.length < 7) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  static generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
class DOMHandler {
  constructor() {
    this.cache = new Map();
  }
  static get instance() {
    if (!DOMHandler._instance) {
      DOMHandler._instance = new DOMHandler();
    }
    return DOMHandler._instance;
  }
  getElement(selector) {
    if (this.cache.has(selector)) {
      return this.cache.get(selector);
    }
    const element = document.querySelector(selector);
    if (element) {
      this.cache.set(selector, element);
    }
    return element;
  }
  getAllElements(selector) {
    return document.querySelectorAll(selector);
  }
  addClass(selector, className) {
    const el = this.getElement(selector);
    if (el) {
      el.classList.add(className);
    }
  }
  removeClass(selector, className) {
    const el = this.getElement(selector);
    if (el) {
      el.classList.remove(className);
    }
  }
  toggleBodyScroll(shouldLock) {
    if (shouldLock) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px";
    } else {
      document.body.style.overflow = "visible";
      document.body.style.paddingRight = "0";
    }
  }
  setHTML(selector, html) {
    const el = this.getElement(selector);
    if (el) {
      el.innerHTML = html;
    }
  }
  setText(selector, text) {
    const el = this.getElement(selector);
    if (el) {
      el.textContent = text;
    }
  }
  setAttribute(selector, attr, value) {
    const el = this.getElement(selector);
    if (el) {
      el.setAttribute(attr, value);
    }
  }
}
class TimeManager {
  constructor() {
    this.dom = DOMHandler.instance;
    this.timer = null;
    this.config = VOIDBORN_ARCH_CONFIG.time;
  }
  initializeClockCycle() {
    this.assessBusinessStatus();
    this.timer = setInterval(() => {
      this.assessBusinessStatus();
    }, 60000);
  }
  assessBusinessStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const isWeekday = this.config.openDays.includes(currentDay);
    const isWorkHours = currentHour >= this.config.openingHour && currentHour < this.config.closingHour;
    const isOperational = isWeekday && isWorkHours;
    this.updateStatusIndicators(isOperational);
  }
  updateStatusIndicators(isOperational) {
    const statusText = isOperational ? "DISPATCH: ONLINE" : "EMERGENCY OPS ONLY";
    const statusColor = isOperational ? VOIDBORN_ARCH_CONFIG.theme.successColor : VOIDBORN_ARCH_CONFIG.theme.alertColor;
    const indicatorClass = isOperational ? "active" : "offline";
    const indicatorEl = this.dom.getElement(VOIDBORN_ARCH_CONFIG.selectors.statusBadge);
    const textEl = this.dom.getElement(VOIDBORN_ARCH_CONFIG.selectors.statusText);
    if (indicatorEl) {
      indicatorEl.classList.remove("offline", "active");
      indicatorEl.classList.add(indicatorClass);
    }
    if (textEl) {
      textEl.textContent = statusText;
      textEl.style.color = statusColor;
      textEl.style.fontWeight = "bold";
      textEl.style.textShadow = `0 0 10px ${statusColor}40`;
    }
  }
}
class NavigationManager {
  constructor() {
    this.dom = DOMHandler.instance;
    this.isActive = false;
  }
  initializeNavigation() {
    this.attachEventListeners();
    this.highlightCurrentPage();
  }
  attachEventListeners() {
    const hamburger = this.dom.getElement(VOIDBORN_ARCH_CONFIG.selectors.hamburgerBtn);
    const closeBtn = this.dom.getElement(VOIDBORN_ARCH_CONFIG.selectors.closeMenuBtn);
    if (hamburger) {
      hamburger.addEventListener("click", () => this.toggleMobileInterface(true));
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.toggleMobileInterface(false));
    }
    window.addEventListener("scroll", VoidUtils.debounce(() => this.handleScrollPhysics(), 10));
  }
  handleScrollPhysics() {
    const scrollY = window.scrollY;
    const navElement = this.dom.getElement(VOIDBORN_ARCH_CONFIG.selectors.navWrapper);
    const threshold = 50;
    if (!navElement) return;
    if (scrollY > threshold) {
      navElement.classList.add("scrolled");
      navElement.style.boxShadow = "0 10px 30px rgba(0,0,0,0.8)";
    } else {
      navElement.classList.remove("scrolled");
      navElement.style.boxShadow = "none";
    }
  }
  toggleMobileInterface(shouldOpen) {
    this.isActive = shouldOpen;
    const overlay = this.dom.getElement(VOIDBORN_ARCH_CONFIG.selectors.mobileOverlay);
    if (!overlay) return;
    if (shouldOpen) {
      overlay.classList.add("active");
      this.dom.toggleBodyScroll(true);
      this.sequenceMobileAnimations();
    } else {
      overlay.classList.remove("active");
      this.dom.toggleBodyScroll(false);
    }
  }
  sequenceMobileAnimations() {
    const links = this.dom.getAllElements(".mobile-nav-link");
    links.forEach((link, index) => {
      link.style.opacity = "0";
      link.style.transform = "translateY(20px)";
      setTimeout(() => {
        link.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        link.style.opacity = "1";
        link.style.transform = "translateY(0)";
      }, 150 + (index * 75));
    });
  }
  highlightCurrentPage() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const links = this.dom.getAllElements(VOIDBORN_ARCH_CONFIG.selectors.navItems);
    links.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("current-page");
        link.style.color = VOIDBORN_ARCH_CONFIG.theme.primaryColor;
      }
    });
    const mobileLinks = this.dom.getAllElements(".mobile-nav-link");
    mobileLinks.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("mobile-active");
      }
    });
  }
}
class PhysicsEngine {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.parent = document.querySelector(".hero-section-master");
    this.animationId = null;
  }
  initializeSystem() {
    if (!this.parent) return;
    this.setupCanvas();
    this.createParticles();
    this.startSimulation();
    window.addEventListener("resize", VoidUtils.debounce(() => this.resizeCanvas(), 200));
  }
  setupCanvas() {
    this.canvas.id = VOIDBORN_ARCH_CONFIG.physics.canvasId;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = "1";
    this.canvas.style.pointerEvents = "none";
    this.parent.appendChild(this.canvas);
    this.resizeCanvas();
  }
  resizeCanvas() {
    this.width = this.parent.offsetWidth;
    this.height = this.parent.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (this.particles.length === 0) {
      this.createParticles();
    }
  }
  createParticles() {
    this.particles = [];
    const count = VOIDBORN_ARCH_CONFIG.physics.particleCount;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * VOIDBORN_ARCH_CONFIG.physics.baseVelocity,
        vy: (Math.random() - 0.5) * VOIDBORN_ARCH_CONFIG.physics.baseVelocity,
        size: Math.random() * 2 + 1,
        color: VOIDBORN_ARCH_CONFIG.theme.primaryColor
      });
    }
  }
  calculatePhysics() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    });
  }
  renderConnections() {
    const threshold = VOIDBORN_ARCH_CONFIG.physics.connectionDistance;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold) {
          const alpha = 1 - (dist / threshold);
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(184, 115, 51, ${alpha * 0.4})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
  }
  startSimulation() {
    const loop = () => {
      this.calculatePhysics();
      this.renderConnections();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }
}
class AnimationObserver {
  constructor() {
    this.observerOptions = {
      threshold: 0.15,
      rootMargin: "0px"
    };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => this.handleIntersection(entry));
    }, this.observerOptions);
  }
  initializeObserver() {
    const elements = document.querySelectorAll(VOIDBORN_ARCH_CONFIG.selectors.scrollElements);
    elements.forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      this.observer.observe(el);
    });
  }
  handleIntersection(entry) {
    if (entry.isIntersecting) {
      const el = entry.target;
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      this.observer.unobserve(el);
    }
  }
}
class ValidationHandler {
  constructor() {
    this.form = document.getElementById("primary-dispatch-form");
    this.config = {
      phonePattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
      nameMinLength: 2,
      detailsMinLength: 10
    };
  }
  initializeValidation() {
    if (!this.form) return;
    this.setupFieldListeners();
    this.setupFormSubmission();
  }
  setupFieldListeners() {
    const phoneInput = this.form.querySelector("input[name='phone']");
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        e.target.value = VoidUtils.formatPhoneNumber(e.target.value);
        this.validateField(e.target);
      });
    }
    const inputs = this.form.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("focus", () => this.resetFieldState(input));
    });
  }
  resetFieldState(input) {
    input.style.borderColor = "#1e1e1e";
    input.style.backgroundColor = VOIDBORN_ARCH_CONFIG.theme.secondaryColor;
  }
  validateField(input) {
    let isValid = true;
    const value = input.value.trim();
    if (input.name === "phone") {
      isValid = this.config.phonePattern.test(value) && value.length >= 10;
    } else if (input.name === "name") {
      isValid = value.length >= this.config.nameMinLength;
    } else if (input.name === "details") {
      isValid = value.length >= this.config.detailsMinLength;
    } else if (input.hasAttribute("required")) {
      isValid = value.length > 0;
    }
    if (!isValid) {
      this.markInvalid(input);
    } else {
      this.markValid(input);
    }
    return isValid;
  }
  markValid(input) {
    input.style.borderColor = VOIDBORN_ARCH_CONFIG.theme.successColor;
    input.style.backgroundColor = `${VOIDBORN_ARCH_CONFIG.theme.successColor}10`;
  }
  markInvalid(input) {
    input.style.borderColor = VOIDBORN_ARCH_CONFIG.theme.alertColor;
    input.style.animation = "shake 0.4s ease-in-out";
    setTimeout(() => {
      input.style.animation = "none";
    }, 400);
  }
  setupFormSubmission() {
    this.form.addEventListener("submit", (e) => {
      const inputs = this.form.querySelectorAll("input, textarea, select");
      let formIsValid = true;
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          formIsValid = false;
        }
      });
      if (!formIsValid) {
        e.preventDefault();
        const btn = this.form.querySelector("button");
        btn.textContent = "VALIDATION ERROR // RETRY";
        btn.style.backgroundColor = VOIDBORN_ARCH_CONFIG.theme.alertColor;
        setTimeout(() => {
          btn.textContent = "TRANSMIT REQUEST";
          btn.style.backgroundColor = "";
        }, 2000);
      } else {
        const btn = this.form.querySelector("button");
        const originalText = btn.innerText;
        btn.innerText = "ENCRYPTING DATA STREAM...";
        btn.style.opacity = "0.7";
        btn.style.cursor = "wait";
        const successMessage = document.createElement("div");
        successMessage.textContent = "HANDSHAKE INITIATED...";
        successMessage.style.color = VOIDBORN_ARCH_CONFIG.theme.successColor;
        successMessage.style.marginTop = "10px";
        this.form.appendChild(successMessage);
      }
    });
  }
}
class DataStreamTicker {
  constructor() {
    this.track = document.querySelector(VOIDBORN_ARCH_CONFIG.selectors.dynamicTicker);
    this.messages = [
      "24/7 EMERGENCY DISPATCH",
      "LICENSED BONDED INSURED",
      "COPPER SPECIALISTS",
      "SLAB LEAK DETECTION",
      "TANKLESS SYSTEM EXPERTS",
      "NO HIDDEN FEES PROTOCOL",
      "MASTER MECHANICS ON STANDBY"
    ];
  }
  initializeTicker() {
    if (!this.track) return;
    this.buildTickerStream();
  }
  buildTickerStream() {
    this.track.innerHTML = "";
    const fragment = document.createDocumentFragment();
    this.messages.forEach(msg => {
      const div = document.createElement("div");
      div.className = "ticker-item-box";
      div.textContent = msg;
      div.style.padding = "0 40px";
      div.style.color = VOIDBORN_ARCH_CONFIG.theme.secondaryColor;
      div.style.fontWeight = "800";
      fragment.appendChild(div);
    });
    this.track.appendChild(fragment);
    const clone = this.track.cloneNode(true);
    while (clone.firstChild) {
      this.track.appendChild(clone.firstChild);
    }
  }
}
class SecurityEffect {
  constructor() {
    this.element = document.querySelector(VOIDBORN_ARCH_CONFIG.selectors.securityBadge);
    this.glitchChars = "!<>-_\\/[]{}—=+*^?#________";
  }
  initializeEffect() {
    if (!this.element) return;
    this.element.addEventListener("mouseenter", () => {
      this.triggerGlitch();
    });
  }
  triggerGlitch() {
    const textNode = this.element;
    const original = textNode.textContent;
    let iteration = 0;
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      textNode.textContent = original.split("").map((letter, index) => {
        if (index < iteration) {
          return original[index];
        }
        return this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
      }).join("");
      if (iteration >= original.length) {
        clearInterval(this.interval);
        textNode.textContent = original;
      }
      iteration += 1 / 3;
    }, 30);
  }
}
class CoreSystem {
  constructor() {
    this.domHandler = DOMHandler.instance;
    this.timeManager = new TimeManager();
    this.navigationManager = new NavigationManager();
    this.physicsEngine = new PhysicsEngine();
    this.animationObserver = new AnimationObserver();
    this.validationHandler = new ValidationHandler();
    this.ticker = new DataStreamTicker();
    this.security = new SecurityEffect();
  }
  boot() {
    try {
      this.logSystemStart();
      this.timeManager.initializeClockCycle();
      this.navigationManager.initializeNavigation();
      this.physicsEngine.initializeSystem();
      this.animationObserver.initializeObserver();
      this.validationHandler.initializeValidation();
      this.ticker.initializeTicker();
      this.security.initializeEffect();
      this.enableGlobalGuards();
      console.log("%c SYSTEM OPTIMAL ", "background: #00ff66; color: black; padding: 2px 5px; border-radius: 2px;");
    } catch (error) {
      console.error("CRITICAL SYSTEM FAILURE: ", error);
    }
  }
  logSystemStart() {
    const style = "background: #0a0a0a; color: #b87333; padding: 10px; border: 1px solid #b87333; font-weight: bold;";
    console.log(`%c PT PLUMBING INC. \n ARCHITECTURE: ${VOIDBORN_ARCH_CONFIG.system.id} \n VERSION: ${VOIDBORN_ARCH_CONFIG.system.version} `, style);
  }
  enableGlobalGuards() {
    document.addEventListener("contextmenu", (event) => {
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
        return false;
      }
    });
    document.querySelectorAll("img").forEach(img => {
      img.addEventListener("dragstart", (e) => e.preventDefault());
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const kernel = new CoreSystem();
  kernel.boot();
});
window.addEventListener("load", () => {
  const loadOverlay = document.createElement("div");
  loadOverlay.id = "system-boot-overlay";
  document.body.appendChild(loadOverlay);
  setTimeout(() => {
    document.body.classList.add("system-active");
  }, 100);
});
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
console.log("VOIDBORN NODES: SECURE");
const handlePageTransition = (url) => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    window.location.href = url;
  }, 300);
};
document.querySelectorAll("a").forEach(link => {
  const href = link.getAttribute("href");
  if (href && href.startsWith("/") || href.includes(".html")) {
    link.addEventListener("click", (e) => {
      const target = link.getAttribute("target");
      if (target !== "_blank") {
        e.preventDefault();
        handlePageTransition(href);
      }
    });
  }
});
class EasterEgg {
  constructor() {
    this.sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    this.currentPosition = 0;
    this.init();
  }
  init() {
    document.addEventListener("keydown", (e) => {
      if (e.key === this.sequence[this.currentPosition]) {
        this.currentPosition++;
        if (this.currentPosition === this.sequence.length) {
          this.activate();
          this.currentPosition = 0;
        }
      } else {
        this.currentPosition = 0;
      }
    });
  }
  activate() {
    alert("SYSTEM OVERRIDE: GOD MODE ENABLED");
    document.documentElement.style.setProperty("--color-copper-primary", "#ff00ff");
    document.documentElement.style.setProperty("--color-black-base", "#000000");
  }
}
new EasterEgg();
