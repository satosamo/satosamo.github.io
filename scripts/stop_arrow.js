let arrowStopped = false;
function stopArrowAnimation() {
    if (!arrowStopped) {
        document.body.classList.add('arrow-stopped');
        arrowStopped = true;
    }
}

window.addEventListener('scroll', stopArrowAnimation, { once: true });
window.addEventListener('wheel', stopArrowAnimation, { once: true });
window.addEventListener('touchmove', stopArrowAnimation, { once: true });
