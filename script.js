document.addEventListener("DOMContentLoaded", () => {
    initScrollReveal();
});
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}
const facts = [
    "Fact: Tankless heaters can reduce energy bills by 30%.",
    "Warning: Chemical cleaners eat pipes. Use enzymes.",
    "Tip: Flush water heaters annually to prevent sediment.",
    "Safety: Know where your main shut-off valve is."
];
function rotateFact() {
    const el = document.getElementById("fact-display");
    el.style.opacity = 0;
    setTimeout(() => {
        el.innerText = facts[Math.floor(Math.random() * facts.length)];
        el.style.opacity = 1;
    }, 400);
}
