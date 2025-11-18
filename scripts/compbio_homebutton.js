document.addEventListener("DOMContentLoaded", () => {
  const btn = document.createElement("a");
  btn.href = "/homepages/homepage_compbio/index.html";
  btn.textContent = "Home";

  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px 14px",
    background: "#007bff",
    color: "#fff",
    "border-radius": "6px",
    "text-decoration": "none",
    "font-size": "14px",
    "font-family": "'Helvetica Neue', Helvetica, 'Segoe UI', Arial, freesans, sans-serif",
    "box-shadow": "0 2px 6px rgba(0,0,0,0.2)",
    "z-index": 9999,
    "opacity": 0.7,
    "transition": "opacity 0.3s",
  });

  // Fade effect on hover
  btn.addEventListener("mouseenter", () => (btn.style.opacity = 1));
  btn.addEventListener("mouseleave", () => (btn.style.opacity = 0.7));

  document.body.appendChild(btn);
});
