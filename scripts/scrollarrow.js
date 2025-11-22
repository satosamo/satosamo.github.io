const arrow = document.getElementById('scroll-arrow');
const hideArrow = () => {
    if (arrow) {
        arrow.classList.add('fade-out');
        // Optional: Remove from DOM after fade finishes (0.5s)
        setTimeout(() => arrow.remove(), 500); 
    }
};

// Listen for interaction once, then clean up listeners
window.addEventListener('scroll', hideArrow, { once: true });
window.addEventListener('wheel', hideArrow, { once: true });
window.addEventListener('touchmove', hideArrow, { once: true });