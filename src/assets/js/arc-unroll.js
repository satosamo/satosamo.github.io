/* Interactive figure: a circle arc unrolled onto a line (arc length = angle).
   Mount: any element with class "fig" and data-figure="arc-unroll".
   Vanilla JS + inline SVG; colours come from CSS classes (.fig-*), so the
   theme toggle needs no JS. One pure render(theta) drives slider, play and readout. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var TAU = 2 * Math.PI;
  var R = 60, CX = 110, CY = 130, X0 = 240, LINE_Y = 200;   // 1 unit = R px

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function mount(root) {
    var svg = el("svg", { viewBox: "0 55 640 190", "class": "fig-svg", role: "img",
      "aria-label": "A circle arc of angle theta and the line segment of equal length it unrolls into" }, root);

    // static: circle outline, axis ticks
    el("circle", { cx: CX, cy: CY, r: R, "class": "fig-guide" }, svg);
    el("line", { x1: X0, y1: LINE_Y, x2: X0 + 6.5 * R, y2: LINE_Y, "class": "fig-guide" }, svg);
    for (var i = 0; i <= 6; i++) {
      el("line", { x1: X0 + i * R, y1: LINE_Y - 4, x2: X0 + i * R, y2: LINE_Y + 4, "class": "fig-guide" }, svg);
      el("text", { x: X0 + i * R, y: LINE_Y + 20, "class": "fig-label", "text-anchor": "middle" }, svg).textContent = i;
    }

    // arc: a full circle drawn with a dash, so "unrolling" is just dashoffset (no arc geometry).
    // scale(1,-1) flips y so the dash runs counter-clockwise on screen, starting at 3 o'clock.
    var arc = el("circle", { r: R, pathLength: 1, "class": "fig-trace",
      transform: "translate(" + CX + " " + CY + ") scale(1 -1)" }, svg);
    var radius = el("line", { x1: CX, y1: CY, "class": "fig-radius" }, svg);
    var seg = el("line", { x1: X0, y1: LINE_Y, y2: LINE_Y, "class": "fig-trace" }, svg);
    var dotC = el("circle", { r: 4.5, "class": "fig-dot" }, svg);
    var dotL = el("circle", { cy: LINE_Y, r: 4.5, "class": "fig-dot" }, svg);

    // controls
    var ctl = document.createElement("div");
    ctl.className = "fig-controls";
    var play = document.createElement("button");
    play.type = "button"; play.textContent = "Play";
    var slider = document.createElement("input");
    slider.type = "range"; slider.min = 0; slider.max = 628; slider.value = 100;
    slider.setAttribute("aria-label", "angle theta");
    var out = document.createElement("span");
    out.className = "fig-readout";
    ctl.appendChild(play); ctl.appendChild(slider); ctl.appendChild(out);
    root.appendChild(ctl);

    function render(theta) {
      var px = CX + R * Math.cos(theta), py = CY - R * Math.sin(theta);
      arc.style.strokeDasharray = "1 1";
      arc.style.strokeDashoffset = 1 - theta / TAU;
      radius.setAttribute("x2", px); radius.setAttribute("y2", py);
      dotC.setAttribute("cx", px); dotC.setAttribute("cy", py);
      seg.setAttribute("x2", X0 + R * theta);
      dotL.setAttribute("cx", X0 + R * theta);
      slider.value = Math.round(theta * 100);
      out.textContent = "θ = s = " + theta.toFixed(3);
    }

    var raf = null;
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; play.textContent = "Play"; }
    function run() {
      var from = +slider.value / 100 >= TAU - 0.01 ? 0 : +slider.value / 100;
      var t0 = null;
      play.textContent = "Pause";
      (function frame(now) {
        if (t0 === null) t0 = now;
        var theta = from + (now - t0) / 1000;          // 1 rad per second
        if (theta >= TAU) { render(TAU); stop(); return; }
        render(theta);
        raf = requestAnimationFrame(frame);
      })(performance.now());
    }
    play.addEventListener("click", function () { raf ? stop() : run(); });
    slider.addEventListener("input", function () { stop(); render(+slider.value / 100); });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) play.hidden = true;

    render(1);
  }

  Array.prototype.forEach.call(document.querySelectorAll('.fig[data-figure="arc-unroll"]'), mount);
})();
