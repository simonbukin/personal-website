// Goofy mode - lazy loaded module
// Activated via Shift+G, adds overlay/scanline animations during page transitions

export function initGoofy() {
  if (window.__goofyInit) return;
  window.__goofyInit = true;

  var isGoofy = function () {
    return localStorage.getItem("goofy") === "true";
  };
  var rand = function (a, b) {
    return Math.random() * (b - a) + a;
  };
  var pick = function (a) {
    return a[Math.floor(Math.random() * a.length)];
  };
  var shuffle = function (a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  };

  var COLORS = [
    "#fafafa",
    "#fca5a5",
    "#fdba74",
    "#fcd34d",
    "#bef264",
    "#86efac",
    "#5eead4",
    "#7dd3fc",
    "#a5b4fc",
    "#c4b5fd",
    "#f0abfc",
    "#fda4af",
    "#ff6b6b",
    "#4ecdc4",
    "#ffe66d",
  ];
  var ANIM_IN = [
    "goofy-left",
    "goofy-right",
    "goofy-glitch",
    "goofy-slam",
    "goofy-bounce",
  ];
  var ANIM_OUT = [
    "goofy-out-explode",
    "goofy-out-dissolve",
    "goofy-out-glitch",
  ];

  function getLines(el) {
    var lines = [],
      range = document.createRange(),
      walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var node,
      lineTop = null,
      line = null;
    while ((node = walker.nextNode())) {
      if (!node.textContent?.trim()) continue;
      range.selectNodeContents(node);
      for (var r of range.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue;
        if (lineTop === null || Math.abs(r.top - lineTop) > 3) {
          if (line) lines.push(line);
          lineTop = r.top;
          line = {
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          };
        } else if (line) {
          line.width =
            Math.max(line.left + line.width, r.left + r.width) -
            Math.min(line.left, r.left);
          line.left = Math.min(line.left, r.left);
          line.height = Math.max(line.height, r.height);
        }
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function collectLines() {
    var main = document.querySelector("main");
    if (!main) return [];
    var all = [];
    main
      .querySelectorAll(
        "h1,h2,h3,h4,h5,h6,p,li,span,a,blockquote,td,th,label,dt,dd"
      )
      .forEach(function (el) {
        if (
          el.closest("pre") ||
          el.closest("code") ||
          el.closest("astro-island")
        )
          return;
        if (!el.textContent?.trim()) return;
        all.push.apply(all, getLines(el));
      });
    main.querySelectorAll("pre,img").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width > 1 && r.height > 1)
        all.push({ top: r.top, left: r.left, width: r.width, height: r.height });
    });
    all = all.filter(function (l, i, arr) {
      for (var j = 0; j < i; j++)
        if (Math.abs(arr[j].top - l.top) < 3 && Math.abs(arr[j].left - l.left) < 5)
          return false;
      return true;
    });
    return shuffle(all).slice(0, 80);
  }

  function getContainer() {
    var c = document.getElementById("goofy-container");
    if (!c || !document.body.contains(c)) {
      c = document.createElement("div");
      c.id = "goofy-container";
      document.body.appendChild(c);
    }
    return c;
  }

  function clear() {
    var c = document.getElementById("goofy-container");
    if (c) c.innerHTML = "";
    var s = document.getElementById("goofy-scanlines");
    if (s) s.classList.remove("active");
    document.body.classList.remove("goofy-shake");
  }

  function createOverlays(lines, isOut) {
    var c = getContainer();
    c.innerHTML = "";
    var sy = window.scrollY,
      sx = window.scrollX;
    return lines.map(function (l, i) {
      var div = document.createElement("div");
      div.className = "goofy-overlay";
      var color = pick(COLORS),
        anim = pick(isOut ? ANIM_OUT : ANIM_IN),
        dur = rand(60, 150),
        delay = rand(0, lines.length * 6),
        rot = rand(-3, 3),
        thick = rand(0.8, 1.5),
        extra = rand(0, 20);
      div.style.cssText =
        "top:" +
        (l.top + sy) +
        "px;left:" +
        (l.left + sx - extra / 2) +
        "px;width:" +
        (l.width + extra) +
        "px;height:" +
        l.height * thick +
        "px;background:" +
        color +
        ";--r:" +
        rot +
        "deg;animation:" +
        anim +
        " " +
        dur +
        "ms cubic-bezier(.34,1.56,.64,1) " +
        delay +
        "ms forwards;" +
        (isOut ? "transform:scaleX(1);" : "transform:scaleX(0);");
      if (Math.random() > 0.7)
        div.style.boxShadow = "0 0 " + rand(5, 15) + "px " + color;
      c.appendChild(div);
      return { delay: delay, dur: dur };
    });
  }

  function goofyEffects() {
    document.body.classList.add("goofy-shake");
    setTimeout(function () {
      document.body.classList.remove("goofy-shake");
    }, 150);
    var s = document.getElementById("goofy-scanlines");
    if (!s) {
      s = document.createElement("div");
      s.id = "goofy-scanlines";
      document.body.appendChild(s);
    }
    s.classList.add("active");
  }

  document.addEventListener("astro:before-preparation", function (e) {
    if (
      !isGoofy() ||
      window.matchMedia("(prefers-reduced-motion:reduce)").matches
    )
      return;
    var orig = e.loader;
    e.loader = async function () {
      clear();
      var lines = collectLines();
      if (lines.length) {
        goofyEffects();
        var overlays = createOverlays(lines, false);
        var max = Math.max.apply(null, overlays.map(function (o) { return o.delay + o.dur; })) + 50;
        await new Promise(function (r) {
          setTimeout(r, max);
        });
      }
      await orig();
    };
  });

  document.addEventListener("astro:after-swap", function () {
    if (
      !isGoofy() ||
      window.matchMedia("(prefers-reduced-motion:reduce)").matches
    ) {
      clear();
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var lines = collectLines();
        if (!lines.length) {
          clear();
          return;
        }
        goofyEffects();
        var overlays = createOverlays(lines, true);
        var max = Math.max.apply(null, overlays.map(function (o) { return o.delay + o.dur; })) + 100;
        setTimeout(clear, max);
      });
    });
  });
}
