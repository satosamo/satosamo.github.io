/* Interactive Turing machine: binary increment.
   Mount: any element with class "tm-mount". Vanilla JS, no dependencies. */
(function () {
  var mount = document.querySelector(".tm-mount");
  if (!mount) return;

  var BLANK = "·";
  // δ for binary increment: scan right to the end, then carry left.
  var DELTA = {
    "scan,0": ["scan", "0", 1],
    "scan,1": ["scan", "1", 1],
    "scan,·": ["carry", "·", -1],
    "carry,1": ["carry", "0", -1],
    "carry,0": ["halt", "1", 0],
    "carry,·": ["halt", "1", 0],
  };

  var tape, head, state, steps, timer = null;

  function load(input) {
    tape = {};
    input.split("").forEach(function (ch, i) { tape[i] = ch; });
    head = 0;
    state = "scan";
    steps = 0;
  }
  function read() { return tape[head] === undefined ? BLANK : tape[head]; }
  function step() {
    if (state === "halt") return false;
    var rule = DELTA[state + "," + read()];
    if (!rule) { state = "halt"; return false; }
    state = rule[0];
    if (rule[1] === BLANK) delete tape[head]; else tape[head] = rule[1];
    head += rule[2];
    steps++;
    return state !== "halt";
  }

  // ---- UI ----
  mount.className = "tm";
  mount.innerHTML =
    '<div class="tm-tape" aria-label="Tape"></div>' +
    '<p class="tm-status" aria-live="polite"></p>' +
    '<div class="tm-controls">' +
    '<button type="button" data-act="step">Step</button>' +
    '<button type="button" data-act="run">Run</button>' +
    '<button type="button" data-act="reset">Reset</button>' +
    '<label>Input <input type="text" value="1011" pattern="[01]+" maxlength="12" aria-label="Binary input"></label>' +
    "</div>";

  var tapeEl = mount.querySelector(".tm-tape");
  var statusEl = mount.querySelector(".tm-status");
  var runBtn = mount.querySelector('[data-act="run"]');
  var inputEl = mount.querySelector("input");

  function render() {
    var keys = Object.keys(tape).map(Number);
    var lo = Math.min(head, keys.length ? Math.min.apply(null, keys) : 0) - 1;
    var hi = Math.max(head, keys.length ? Math.max.apply(null, keys) : 0) + 1;
    var html = "";
    for (var i = lo; i <= hi; i++) {
      html += '<div class="tm-cell' + (i === head ? " head" : "") + '">' +
        (tape[i] === undefined ? BLANK : tape[i]) + "</div>";
    }
    tapeEl.innerHTML = html;
    statusEl.innerHTML = "state: <strong" + (state === "halt" ? ' class="halted"' : "") + ">" +
      state + "</strong> &nbsp;·&nbsp; steps: " + steps +
      (state === "halt" ? " &nbsp;·&nbsp; result: " + readout() : "");
  }
  function readout() {
    var keys = Object.keys(tape).map(Number).sort(function (a, b) { return a - b; });
    return keys.map(function (k) { return tape[k]; }).join("") || "ε";
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    runBtn.textContent = "Run";
  }
  function reset() {
    stop();
    var v = /^[01]{1,12}$/.test(inputEl.value) ? inputEl.value : "1011";
    inputEl.value = v;
    load(v);
    render();
  }

  mount.addEventListener("click", function (e) {
    var act = e.target.getAttribute && e.target.getAttribute("data-act");
    if (act === "step") { stop(); step(); render(); }
    if (act === "reset") reset();
    if (act === "run") {
      if (timer) { stop(); return; }
      runBtn.textContent = "Pause";
      timer = setInterval(function () {
        if (!step()) stop();
        render();
      }, 350);
    }
  });
  inputEl.addEventListener("change", reset);

  reset();
})();
