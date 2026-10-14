/* Interactive figure: the differential as a linear approximation at a point.
   Mount: any element with class "fig" and data-figure="linear-approx".
   Vanilla JS + inline SVG; colours come from CSS classes (.fig-*), so the
   theme toggle needs no JS. One pure render(h) drives slider, play and readout. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var A = 1;                                  // the point of approximation
  var f = Math.sin, df = Math.cos;            // f and f'
  var XMIN = -0.2, XMAX = 3.4, YTOP = 1.5, S = 160, PX = 40, PY = 15;   // plot window, S px per unit
  var clipId = 0;

  function X(x) { return PX + (x - XMIN) * S; }
  function Y(y) { return PY + (YTOP - y) * S; }
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function signed(v) { return (v < 0 ? "−" : "+") + Math.abs(v).toFixed(3); }

  function mount(root) {
    var svg = el("svg", { viewBox: "0 0 640 330", "class": "fig-svg", role: "img",
      "aria-label": "The graph of sin x with its tangent line at x = 1. For a step dx, the tangent changes by df and the curve by the actual increment; their gap shrinks faster than dx." }, root);
    var clip = "fig-clip-" + (++clipId);
    var defs = el("defs", {}, svg);
    el("rect", { x: PX, y: PY - 5, width: X(XMAX) - PX, height: 310 }, el("clipPath", { id: clip }, defs));

    // axes + ticks
    el("line", { x1: X(XMIN), y1: Y(0), x2: X(XMAX), y2: Y(0), "class": "fig-guide" }, svg);
    for (var i = 0; i <= 3; i++) {
      el("line", { x1: X(i), y1: Y(0) - 4, x2: X(i), y2: Y(0) + 4, "class": "fig-guide" }, svg);
      el("text", { x: X(i), y: Y(0) + 20, "class": "fig-label", "text-anchor": "middle" }, svg).textContent = i;
    }

    // curve, tangent (clipped to the plot window)
    var d = "";
    for (var x = XMIN; x <= XMAX + 1e-9; x += 0.04) d += (d ? "L" : "M") + X(x).toFixed(1) + " " + Y(f(x)).toFixed(1);
    var g = el("g", { "clip-path": "url(#" + clip + ")" }, svg);
    el("path", { d: d, "class": "fig-curve" }, g);
    var tangent = el("line", { "class": "fig-tangent" }, g);
    tangent.setAttribute("x1", X(XMIN)); tangent.setAttribute("y1", Y(f(A) + df(A) * (XMIN - A)));
    tangent.setAttribute("x2", X(XMAX)); tangent.setAttribute("y2", Y(f(A) + df(A) * (XMAX - A)));

    // dynamic parts, as three adjacent bars at x = a + Δx: df (blue, f(a) -> tangent),
    // gap (orange, tangent -> curve), Δf (plain, f(a) -> curve). Colours match the readout.
    var run = el("line", { "class": "fig-radius" }, svg);
    var lin = el("line", { "class": "fig-lin" }, svg);
    var err = el("line", { "class": "fig-err" }, svg);
    var full = el("line", { "class": "fig-full" }, svg);
    var tDot = el("circle", { r: 4, "class": "fig-dot fig-dot-lin" }, svg);
    var cDot = el("circle", { r: 4, "class": "fig-dot" }, svg);
    var pDot = el("circle", { cx: X(A), cy: Y(f(A)), r: 4.5, "class": "fig-dot fig-dot-fixed" }, svg);
    var lDx = el("text", { "class": "fig-label", "text-anchor": "middle" }, svg);
    lDx.textContent = "Δx";
    el("text", { x: X(A), y: Y(f(A)) + 20, "class": "fig-label", "text-anchor": "middle", dx: -14 }, svg).textContent = "a";

    // controls + readout
    var ctl = document.createElement("div");
    ctl.className = "fig-controls";
    var play = document.createElement("button");
    play.type = "button"; play.textContent = "Play";
    var slider = document.createElement("input");
    slider.type = "range"; slider.min = -1000; slider.max = 1000; slider.value = 600;
    slider.setAttribute("aria-label", "step dx");
    ctl.appendChild(play); ctl.appendChild(slider);
    root.appendChild(ctl);
    var stats = document.createElement("div");
    stats.className = "fig-stats";
    root.appendChild(stats);

    function render(h) {
      var fa = f(A), lineY = fa + df(A) * h, curveY = f(A + h);
      var xp = X(A + h), side = h >= 0 ? 1 : -1;
      run.setAttribute("x1", X(A)); run.setAttribute("y1", Y(fa)); run.setAttribute("x2", xp); run.setAttribute("y2", Y(fa));
      var xl = xp - side * 6, xf = xp + side * 6;
      lin.setAttribute("x1", xl); lin.setAttribute("y1", Y(fa)); lin.setAttribute("x2", xl); lin.setAttribute("y2", Y(lineY));
      full.setAttribute("x1", xf); full.setAttribute("y1", Y(fa)); full.setAttribute("x2", xf); full.setAttribute("y2", Y(curveY));
      err.setAttribute("x1", xp); err.setAttribute("y1", Y(lineY)); err.setAttribute("x2", xp); err.setAttribute("y2", Y(curveY));
      tDot.setAttribute("cx", xp); tDot.setAttribute("cy", Y(lineY));
      cDot.setAttribute("cx", xp); cDot.setAttribute("cy", Y(curveY));

      lDx.setAttribute("x", (X(A) + xp) / 2); lDx.setAttribute("y", Y(fa) + 17);
      lDx.style.display = Math.abs(h) * S > 28 ? "" : "none";

      var dfv = df(A) * h, dfull = curveY - fa, e = dfull - dfv;
      stats.innerHTML =
        "<span>Δx <b>" + signed(h) + "</b></span>" +
        "<span class=\"lin\">df = f′(a)Δx <b>" + signed(dfv) + "</b></span>" +
        "<span>Δf <b>" + signed(dfull) + "</b></span>" +
        "<span class=\"err\">Δf − df <b>" + signed(e) + "</b></span>" +
        "<span>(Δf − df)/Δx <b>" + (Math.abs(h) < 1e-9 ? "—" : signed(e / h)) + "</b></span>";
      slider.value = Math.round(h * 1000);
    }

    var raf = null;
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; play.textContent = "Play"; }
    function start() {
      var h0 = Math.abs(+slider.value / 1000) < 0.02 ? 1 : +slider.value / 1000, T = 5000, t0 = null;
      play.textContent = "Pause";
      (function frame(now) {
        if (t0 === null) t0 = now;
        var u = Math.min((now - t0) / T, 1);
        render(h0 * (1 - u) * (1 - u));            // h → 0, slowing down: the gap vanishes faster than h
        if (u >= 1) { stop(); return; }
        raf = requestAnimationFrame(frame);
      })(performance.now());
    }
    play.addEventListener("click", function () { raf ? stop() : start(); });
    slider.addEventListener("input", function () { stop(); render(+slider.value / 1000); });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) play.hidden = true;

    render(0.6);
  }

  Array.prototype.forEach.call(document.querySelectorAll('.fig[data-figure="linear-approx"]'), mount);
})();
