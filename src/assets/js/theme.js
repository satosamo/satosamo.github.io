(function () {
  var btn = document.getElementById("theme-toggle");
  function current() {
    var set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  if (btn) {
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
    });
  }
  // zen mode: hides page chrome on article pages (see :root[data-zen] in style.css)
  var zen = document.getElementById("zen-toggle");
  if (zen) {
    var root = document.documentElement;
    var sync = function () { zen.setAttribute("aria-pressed", String("zen" in root.dataset)); };
    sync();
    zen.addEventListener("click", function () {
      if ("zen" in root.dataset) { delete root.dataset.zen; localStorage.removeItem("zen"); }
      else { root.dataset.zen = ""; localStorage.setItem("zen", "1"); }
      sync();
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
