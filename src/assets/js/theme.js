(function () {
  // theme picker: "auto" removes data-theme so prefers-color-scheme decides
  var btn = document.getElementById("theme-toggle");
  var menu = document.getElementById("theme-menu");
  if (btn && menu) {
    var items = Array.prototype.slice.call(menu.querySelectorAll("button"));
    var choice = function () { return document.documentElement.dataset.theme || "auto"; };
    var mark = function () {
      items.forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.themeChoice === choice())); });
    };
    var close = function (refocus) {
      menu.hidden = true; btn.setAttribute("aria-expanded", "false");
      if (refocus) btn.focus();
    };
    var open = function () {
      mark(); menu.hidden = false; btn.setAttribute("aria-expanded", "true");
      var on = items.filter(function (b) { return b.getAttribute("aria-checked") === "true"; })[0];
      (on || items[0]).focus();
    };
    btn.addEventListener("click", function () { if (menu.hidden) open(); else close(false); });
    items.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.dataset.themeChoice;
        if (t === "auto") { delete document.documentElement.dataset.theme; localStorage.removeItem("theme"); }
        else { document.documentElement.dataset.theme = t; localStorage.setItem("theme", t); }
        close(true);
      });
    });
    menu.addEventListener("keydown", function (e) {
      var i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") items[(i + 1) % items.length].focus();
      else if (e.key === "ArrowUp") items[(i + items.length - 1) % items.length].focus();
      else if (e.key === "Home") items[0].focus();
      else if (e.key === "End") items[items.length - 1].focus();
      else if (e.key === "Escape" || e.key === "Tab") { close(e.key === "Escape"); return; }
      else return;
      e.preventDefault();
    });
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) close(false);
    });
  }
  // zen mode: hides page chrome on article pages (see :root[data-zen] in style.css)
  var zen = document.getElementById("zen-toggle");
  if (zen) {
    var root = document.documentElement;
    var sync = function () { zen.setAttribute("aria-pressed", String("zen" in root.dataset)); };
    sync();
    var toggleZen = function () {
      if ("zen" in root.dataset) { delete root.dataset.zen; localStorage.removeItem("zen"); }
      else { root.dataset.zen = ""; localStorage.setItem("zen", "1"); }
      sync();
    };
    zen.addEventListener("click", toggleZen);
    // Ctrl+Z toggles, except where it means undo
    document.addEventListener("keydown", function (e) {
      if (e.key.toLowerCase() !== "z" || !e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      toggleZen();
    });
  }
  // press "/" anywhere to jump to search
  var search = document.getElementById("search-link");
  if (search) {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      window.location.href = search.href;
    });
  }
})();
