/* @ds-bundle: {"format":4,"namespace":"Pivoshenko","components":[{"name":"Contours"},{"name":"SiteHeader"},{"name":"SectionHeading"},{"name":"Tag"},{"name":"ArrowLink"},{"name":"List"},{"name":"Card"},{"name":"Stat"},{"name":"Callout"},{"name":"Breadcrumb"},{"name":"SearchField"},{"name":"Dropdown"},{"name":"CodeBlock"},{"name":"Prose"},{"name":"TableOfContents"},{"name":"BackToTop"},{"name":"EmptyState"},{"name":"Swatch"},{"name":"MediaTile"},{"name":"TerminalWindow"},{"name":"SiteFooter"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useRef = React.useRef, useEffect = React.useEffect, useState = React.useState;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  /* local: lucide icons by name, replacing the text glyphs this bundle shipped with */
  function lucide(name, size) {
    var parts = window.lucide && window.lucide[name];
    if (!parts) return null;
    return h("svg", { width: size || 14, height: size || 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
      "stroke-width": 1.5, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" },
      parts.map(function (part, i) { return h(part[0], Object.assign({ key: i }, part[1])); }));
  }

  /* ── value noise (3D) for the contour field ── */
  function makeNoise(seed) {
    var p = new Uint8Array(512), s = (seed | 0) || 7;
    var perm = [];
    for (var i = 0; i < 256; i++) perm[i] = i;
    for (i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; var j = s % (i + 1); var t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    for (i = 0; i < 512; i++) p[i] = perm[i & 255];
    function hash(x, y, z) { return p[(p[(p[x & 255] + y) & 255] + z) & 255] / 255; }
    function fade(t) { return t * t * (3 - 2 * t); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    return function (x, y, z) {
      var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      var xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
      var a = lerp(lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), xf), lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), xf), yf);
      var b = lerp(lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), xf), lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), xf), yf);
      return lerp(a, b, zf);
    };
  }

  function cssVar(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  }

  /* Contours: an animated topographic field — the "floating lake of lines". */
  /* screen point -> the canvas's own coordinates, undoing its CSS transform (the lake tilt) */
  function unproject(m, u, v) {
    var a1 = m.m11 - u * m.m14, b1 = m.m21 - u * m.m24, c1 = m.m41 - u * m.m44;
    var a2 = m.m12 - v * m.m14, b2 = m.m22 - v * m.m24, c2 = m.m42 - v * m.m44;
    var det = a1 * b2 - a2 * b1;
    if (!det) return null;
    return [(-c1 * b2 + c2 * b1) / det, (-a1 * c2 + a2 * c1) / det];
  }

  function Contours(props) {
    var levels = props.levels || 14, cell = props.cell || 14, speed = props.speed == null ? 1 : props.speed;
    var scale = props.scale || 0.07, seed = props.seed || 11, accentEvery = props.accentEvery == null ? 5 : props.accentEvery;
    var interactive = props.interactive !== false, bump = props.bump == null ? 0.16 : props.bump;
    var reach = props.reach || 210, ripple = props.ripple !== false;
    var variant = props.variant || "topo", rowGap = props.rowGap || 26;
    var wrap = useRef(null), canvas = useRef(null);
    useEffect(function () {
      var el = wrap.current, cv = canvas.current;
      if (!el || !cv) return;
      var ctx = cv.getContext("2d"), noise = makeNoise(seed);
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var raf = 0, last = 0, visible = true, t0 = performance.now(), W = 0, H = 0, dpr = 1;
      var line = cssVar(el, props.colorVar || "--overlay0", "#57534e");
      var hi = cssVar(el, props.accentVar || "--accent", "#d97757");
      var ground = cssVar(el, props.groundVar || "--bg-canvas", "#1f1f1e");
      function size() {
        var r = el.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, r.width); H = Math.max(1, r.height);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      }
      /* pointer state: px/py where the cursor is over the field, a = how much it presses in */
      var ptr = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, seen: false };
      var waves = [];

      function local(e) {
        var r = el.getBoundingClientRect();
        var u = e.clientX - r.left, v = e.clientY - r.top;
        var tf = getComputedStyle(cv).transform;
        if (tf && tf !== "none" && window.DOMMatrix) {
          var ox = W * 0.5, oy = H * 0.7; // matches .pv-contours[data-lake] transform-origin
          var q = unproject(new DOMMatrix(tf), u - ox, v - oy);
          if (q) { u = q[0] + ox; v = q[1] + oy; }
        }
        return [u, v];
      }
      function onMove(e) {
        var q = local(e);
        ptr.tx = q[0]; ptr.ty = q[1]; ptr.ta = 1;
        if (!ptr.seen) { ptr.x = ptr.tx; ptr.y = ptr.ty; ptr.seen = true; }
      }
      function onLeave() { ptr.ta = 0; }
      function onDown(e) {
        if (!ripple) return;
        var q = local(e);
        waves.push({ x: q[0], y: q[1], t0: performance.now() });
        if (waves.length > 3) waves.shift();
      }

      function field(z, cols, rows, off, now) {
        var f = new Float32Array((cols + 1) * (rows + 1));
        var live = ptr.a > 0.004, R2 = 2 * reach * reach;
        for (var w = waves.length - 1; w >= 0; w--) if ((now - waves[w].t0) / 1000 > 2.4) waves.splice(w, 1);
        for (var y = 0; y <= rows; y++) for (var x = 0; x <= cols; x++) {
          var nx = (x + off) * scale, ny = y * scale;
          var val = noise(nx, ny, z) * 0.65 + noise(nx * 2.1 + 5, ny * 2.1 + 9, z * 1.3) * 0.35;
          if (live || waves.length) {
            var gx = x * cell, gy = y * cell, dx = gx - ptr.x, dy = gy - ptr.y, d2 = dx * dx + dy * dy;
            if (live) val += ptr.a * bump * Math.exp(-d2 / R2);
            for (var w2 = 0; w2 < waves.length; w2++) {
              var dt = (now - waves[w2].t0) / 1000;
              var wx = gx - waves[w2].x, wy = gy - waves[w2].y;
              var dist = Math.sqrt(wx * wx + wy * wy) - dt * 340;
              val += 0.2 * Math.exp(-dt * 1.6) * Math.exp(-(dist * dist) / 9000) * Math.cos(dist / 46);
            }
          }
          f[y * (cols + 1) + x] = val;
        }
        return f;
      }
      function draw(now) {
        var z = reduce ? 0 : ((now - t0) / 1000) * 0.045 * speed;
        var drift = reduce ? 0 : ((now - t0) / 1000) * 3 * speed;
        var cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
        ptr.x += (ptr.tx - ptr.x) * 0.16; ptr.y += (ptr.ty - ptr.y) * 0.16; ptr.a += (ptr.ta - ptr.a) * 0.08;
        var f = field(z, cols, rows, drift / cell, now), C = cols + 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        var at = function (gx, gy) { return f[Math.min(rows, Math.max(0, gy)) * C + Math.min(cols, Math.max(0, gx))]; };

        if (variant === "dots") {
          // a field of dots that swell where the ground rises
          for (var dy = 0; dy <= rows; dy++) for (var dx = 0; dx <= cols; dx++) {
            var v = at(dx, dy), r = 0.4 + v * 2.6;
            if (r <= 0.25) continue;
            var accentDot = accentEvery > 0 && v > 0.8;
            ctx.beginPath();
            ctx.arc(dx * cell, dy * cell, r, 0, 6.2832);
            ctx.fillStyle = accentDot ? hi : line;
            ctx.globalAlpha = accentDot ? 0.75 : 0.35 + v * 0.55;
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          return;
        }

        if (variant === "ridge") {
          // stacked ridgelines, front rows painted over the ones behind
          var amp = rowGap * 3.2, nRows = Math.ceil(H / rowGap) + 2;
          for (var ri = 0; ri < nRows; ri++) {
            var baseY = ri * rowGap;
            var accentRow = accentEvery > 0 && ri % accentEvery === 0;
            ctx.beginPath();
            ctx.moveTo(-2, baseY + amp);
            for (var rx = 0; rx <= cols; rx++) {
              var rv = at(rx, Math.round(baseY / cell));
              ctx.lineTo(rx * cell, baseY - (rv - 0.5) * amp);
            }
            ctx.lineTo(W + 2, baseY + amp);
            ctx.closePath();
            ctx.fillStyle = ground; ctx.globalAlpha = 1; ctx.fill();   // occlude the row behind
            ctx.strokeStyle = accentRow ? hi : line;
            ctx.globalAlpha = accentRow ? 0.7 : 0.4 + 0.5 * (ri / nRows);
            ctx.lineWidth = accentRow ? 1.25 : 1;
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          return;
        }

        for (var l = 1; l <= levels; l++) {
          var th = 0.18 + (l / (levels + 1)) * 0.64;
          var isHi = accentEvery > 0 && l % accentEvery === 0;
          ctx.beginPath();
          for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
            var a = f[y * C + x], b = f[y * C + x + 1], c = f[(y + 1) * C + x + 1], d = f[(y + 1) * C + x];
            var k = (a > th ? 8 : 0) | (b > th ? 4 : 0) | (c > th ? 2 : 0) | (d > th ? 1 : 0);
            if (k === 0 || k === 15) continue;
            var px = x * cell, py = y * cell;
            var T = [px + cell * (th - a) / (b - a), py], R = [px + cell, py + cell * (th - b) / (c - b)];
            var B = [px + cell * (th - d) / (c - d), py + cell], L = [px, py + cell * (th - a) / (d - a)];
            var segs;
            switch (k) {
              case 1: case 14: segs = [L, B]; break;
              case 2: case 13: segs = [B, R]; break;
              case 3: case 12: segs = [L, R]; break;
              case 4: case 11: segs = [T, R]; break;
              case 5: segs = [L, T, B, R]; break;
              case 6: case 9: segs = [T, B]; break;
              case 7: case 8: segs = [L, T]; break;
              case 10: segs = [L, B, T, R]; break;
            }
            if (variant === "step") { // rectilinear: snap the crossings to the cell edges
              for (var q = 0; q < segs.length; q++) { segs[q][0] = Math.round(segs[q][0] / cell) * cell; segs[q][1] = Math.round(segs[q][1] / cell) * cell; }
            }
            for (var sg = 0; sg < segs.length; sg += 2) { ctx.moveTo(segs[sg][0], segs[sg][1]); ctx.lineTo(segs[sg + 1][0], segs[sg + 1][1]); }
          }
          ctx.strokeStyle = isHi ? hi : line;
          ctx.globalAlpha = isHi ? 0.55 : 0.5 + 0.4 * (l / levels);
          ctx.lineWidth = isHi ? 1.25 : 1;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      function loop(now) {
        raf = requestAnimationFrame(loop);
        if (!visible || now - last < 42) return; // ~24fps is plenty for a slow drift
        // a still field with nobody touching it needs no repaint
        if (speed === 0 && !waves.length && ptr.a < 0.004 && ptr.ta < 0.004) return;
        last = now; draw(now);
      }
      size();
      draw(performance.now());
      if (!reduce) raf = requestAnimationFrame(loop);
      var host = el.parentElement || el;
      var listening = interactive && !reduce;
      if (listening) {
        host.addEventListener("pointermove", onMove, { passive: true });
        host.addEventListener("pointerleave", onLeave, { passive: true });
        host.addEventListener("pointerdown", onDown, { passive: true });
      }
      var ro = new ResizeObserver(function () { size(); draw(performance.now()); });
      ro.observe(el);
      var io = "IntersectionObserver" in window ? new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }) : null;
      if (io) io.observe(el);
      return function () {
        cancelAnimationFrame(raf); ro.disconnect(); if (io) io.disconnect();
        if (listening) {
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerleave", onLeave);
          host.removeEventListener("pointerdown", onDown);
        }
      };
    }, [levels, cell, speed, scale, seed, accentEvery, interactive, bump, reach, ripple, variant, rowGap, props.colorVar, props.accentVar, props.groundVar]);
    return h("div", { ref: wrap, className: cx("pv-contours", props.className), "data-variant": variant, "data-mask": props.mask || "none", "data-lake": props.lake ? "true" : "false", "aria-hidden": "true", style: { opacity: props.opacity == null ? 1 : props.opacity } },
      h("canvas", { ref: canvas }));
  }

  /* Brand: a typeset mark plus a two-part wordmark — no logo file. */
  function Brand(props) {
    var name = props.name || "example";
    var suffix = props.suffix == null ? "" : props.suffix;
    var initials = props.initials || name.slice(0, 2).toUpperCase();
    return h("a", { className: "pv-brand", href: props.href || "/" },
      props.mark === false ? null : h("span", { className: "pv-mark", "aria-hidden": "true" }, initials),
      h("span", null,
        h("span", { className: "pv-brand__root" }, name),
        suffix ? h("span", { className: "pv-brand__dot" }, props.separator || ".") : null,
        suffix ? h("span", { className: "pv-brand__suffix" }, suffix) : null));
  }

  function SiteHeader(props) {
    var nav = props.nav || [];
    return h("header", { className: cx("pv-header", props.className), "data-accent": props.accent, "data-sticky": props.sticky === false ? "false" : "true" },
      h("div", { className: "pv-header__in" },
        props.brand || h(Brand, { name: props.name, suffix: props.suffix, href: props.homeHref, initials: props.initials, mark: props.mark }),
        h("nav", { className: "pv-nav", "aria-label": props.navLabel || "Primary" },
          nav.map(function (n, i) {
            return h("a", { key: n.href || i, href: n.href, "aria-current": n.active ? "page" : undefined }, n.label);
          })),
        props.actions ? h("div", { className: "pv-header__actions" }, props.actions) : null));
  }

  function SectionHeading(props) {
    var Tag = "h" + (props.level || 2);
    return h("div", { className: "pv-section", id: props.id },
      h(Tag, { className: "pv-section__title pv-label" }, h("span", { className: "pv-section__slash", "aria-hidden": "true" }, "//"), " " + props.title),
      props.count != null ? h("span", { className: "pv-section__count" }, props.count) : null,
      h("span", { className: "pv-section__rule", "aria-hidden": "true" }),
      props.action ? h("span", { className: "pv-section__action" }, props.action) : null);
  }

  function Tag(props) {
    var common = { className: cx("pv-tag", props.className), "data-tone": props.tone, "data-active": props.active ? "true" : undefined };
    var kids = [
      props.tone ? h("span", { key: "d", className: "pv-tag__dot", "aria-hidden": "true" }) : null,
      h("span", { key: "l" }, props.children),
      props.count != null ? h("span", { key: "c", className: "pv-tag__count" }, props.count) : null
    ];
    if (props.href) return h("a", Object.assign(common, { href: props.href }), kids);
    if (props.onClick || props.pressable) return h("button", Object.assign(common, { type: "button", onClick: props.onClick, "aria-pressed": props.active ? "true" : "false", "data-active": undefined }), kids);
    return h("span", Object.assign(common, { "data-static": "true" }), kids);
  }

  function ArrowLink(props) {
    return h("a", { className: cx("pv-link", props.className), href: props.href || "#", "data-variant": props.variant || "text" },
      h("span", null, props.children), h("span", { className: "pv-link__arrow", "aria-hidden": "true" }, props.arrow || "→"));
  }

  /* List: rows of anything — posts, releases, changelog entries, files. */
  function List(props) {
    var items = props.items || [];
    return h("ul", { className: cx("pv-rows", props.className), "data-accent": props.accent, style: props.leadWidth ? { "--lead": props.leadWidth } : null },
      items.map(function (it, i) {
        var kids = [
          it.lead != null ? h("span", { key: "l", className: "pv-row__lead pv-meta" }, it.lead) : null,
          h("span", { key: "b", className: "pv-row__body" },
            h("span", { className: "pv-row__title" }, it.title),
            it.description ? h("span", { className: "pv-row__desc" }, it.description) : null),
          it.trail != null ? h("span", { key: "t", className: "pv-row__trail pv-meta" }, it.trail) : null,
          it.href ? h("span", { key: "g", className: "pv-row__go", "aria-hidden": "true" }, props.arrow || "→") : null
        ];
        return h("li", { key: it.href || it.id || i },
          it.href ? h("a", { className: "pv-row", href: it.href }, kids) : h("div", { className: "pv-row", "data-static": "true" }, kids));
      }));
  }

  function spotlight(e) {
    var r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", (e.clientX - r.left) + "px");
    e.currentTarget.style.setProperty("--my", (e.clientY - r.top) + "px");
  }

  /* Card: one linked thing — a project, a catalog entry, a doc, a site. */
  function Card(props) {
    var eyebrow = props.eyebrow;
    var strip = null;
    if (eyebrow != null) {
      if (typeof eyebrow === "string" && eyebrow.indexOf("/") > -1) {
        var parts = eyebrow.split("/"), tail = parts.pop();
        strip = [h("span", { key: "a" }, parts.join("/") + "/"), h("b", { key: "b" }, tail)];
      } else strip = eyebrow;
    }
    var kids = [
      strip ? h("div", { key: "e", className: "pv-card__eyebrow" }, strip) : null,
      h("div", { key: "t", className: "pv-card__top" },
        props.glyph ? h("span", { className: "pv-card__glyph", "aria-hidden": "true" }, props.glyph) : null,
        h(props.level ? "h" + props.level : "h3", { className: "pv-card__title" }, props.title),
        props.badge != null ? h("span", { className: "pv-card__badge" }, props.badge) : null),
      props.description ? h("p", { key: "d", className: cx("pv-card__desc", props.clamp !== false && "pv-card__desc--clamp") }, props.description) : null,
      props.children ? h("div", { key: "c", className: "pv-card__slot" }, props.children) : null,
      (props.tags || props.meta) ? h("div", { key: "f", className: "pv-card__foot" },
        h("div", { className: "pv-tags" }, (props.tags || []).map(function (t) { return h(Tag, { key: t }, t); })),
        h("div", { className: "pv-card__meta" }, (props.meta || []).map(function (m, i) { return h("span", { key: i, className: "pv-meta" }, m); }))) : null
    ];
    var common = { className: cx("pv-card", props.className), "data-accent": props.accent, onMouseMove: spotlight };
    return props.href ? h("a", Object.assign(common, { href: props.href }), kids) : h("div", Object.assign(common, { "data-static": "true" }), kids);
  }

  /* Stat: one number with its label. */
  function Stat(props) {
    return h("div", { className: cx("pv-stat", props.className), "data-accent": props.accent },
      h("div", { className: "pv-stat__value" }, props.value),
      h("div", { className: "pv-stat__label pv-label" }, props.label),
      props.hint ? h("div", { className: "pv-stat__hint pv-meta" }, props.hint) : null);
  }

  var GLYPH = { info: "●", success: "✓", warning: "▲", danger: "✕", note: "//" };

  /* Callout: a short aside that carries a status word, never colour alone. */
  function Callout(props) {
    var tone = props.tone || "note";
    return h("div", { className: cx("pv-callout", props.className), "data-tone": tone, role: tone === "danger" ? "alert" : undefined },
      h("div", { className: "pv-callout__head" },
        h("span", { className: "pv-callout__glyph", "aria-hidden": "true" }, props.glyph || GLYPH[tone] || GLYPH.note),
        h("span", { className: "pv-callout__label pv-label" }, props.title || tone)),
      h("div", { className: "pv-callout__body" }, props.children));
  }

  /* Breadcrumb: a path, mono, last segment current. */
  function Breadcrumb(props) {
    var items = props.items || [];
    return h("nav", { className: cx("pv-crumbs pv-meta", props.className), "aria-label": props.label || "Breadcrumb" },
      items.map(function (it, i) {
        var last = i === items.length - 1;
        return h(React.Fragment, { key: it.href || i },
          i ? h("span", { className: "pv-crumbs__sep", "aria-hidden": "true" }, props.separator || "/") : null,
          it.href && !last ? h("a", { href: it.href }, it.label) : h("span", { "aria-current": last ? "page" : undefined }, it.label));
      }));
  }

  /* SearchField: a prompt-style filter input. */
  function SearchField(props) {
    return h("div", { className: cx("pv-field", props.className), "data-accent": props.accent },
      h("span", { className: "pv-field__ps", "aria-hidden": "true" }, props.prompt || "❯"),
      h("input", { className: "pv-field__input", type: "search", value: props.value, defaultValue: props.defaultValue,
        placeholder: props.placeholder || "filter…", "aria-label": props.label || "Filter",
        onChange: props.onChange ? function (e) { props.onChange(e.target.value); } : undefined }),
      props.hint ? h("kbd", { className: "pv-field__hint" }, props.hint) : null);
  }

  /* Dropdown: a small menu of links or choices — also the select. */
  function Dropdown(props) {
    var items = props.items || [];
    var st = useState(false), open = st[0], setOpen = st[1];
    var wrap = useRef(null), btn = useRef(null);
    var select = props.select || props.value !== undefined;
    var current = null;
    for (var i = 0; i < items.length; i++) if (items[i].value !== undefined && items[i].value === props.value) current = items[i];

    useEffect(function () {
      if (!open) return;
      function away(e) { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); }
      function key(e) {
        if (e.key === "Escape") { setOpen(false); if (btn.current) btn.current.focus(); return; }
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
        var els = wrap.current ? wrap.current.querySelectorAll(".pv-menu__item:not([disabled])") : [];
        if (!els.length) return;
        e.preventDefault();
        var at = Array.prototype.indexOf.call(els, document.activeElement);
        var next = e.key === "Home" ? 0 : e.key === "End" ? els.length - 1
          : e.key === "ArrowDown" ? (at + 1) % els.length : (at <= 0 ? els.length - 1 : at - 1);
        els[next].focus();
      }
      document.addEventListener("pointerdown", away, true);
      document.addEventListener("keydown", key);
      var first = wrap.current && wrap.current.querySelector(".pv-menu__item:not([disabled])");
      if (first) first.focus();
      return function () { document.removeEventListener("pointerdown", away, true); document.removeEventListener("keydown", key); };
    }, [open]);

    function choose(it) {
      setOpen(false);
      if (it.onSelect) it.onSelect(it);
      if (props.onChange && it.value !== undefined) props.onChange(it.value, it);
      if (btn.current) btn.current.focus();
    }

    return h("div", { className: cx("pv-menu", props.className), ref: wrap, "data-accent": props.accent, "data-align": props.align || "start" },
      h("button", { type: "button", ref: btn, className: "pv-menu__btn", "aria-haspopup": select ? "listbox" : "menu", "aria-expanded": open ? "true" : "false",
        onClick: function () { setOpen(!open); } },
        props.icon ? h("span", { className: "pv-menu__icon", "aria-hidden": "true" }, props.icon) : null,
        h("span", { className: "pv-menu__value" }, current ? current.label : props.label || "Menu"),
        h("span", { className: "pv-menu__caret", "aria-hidden": "true" }, lucide("ChevronDown", 13))),
      open ? h("div", { className: "pv-menu__panel", role: select ? "listbox" : "menu", style: props.width ? { minWidth: props.width } : null },
        items.map(function (it, i) {
          if (it.separator) return h("div", { key: "s" + i, className: "pv-menu__sep", role: "separator" });
          if (it.heading) return h("div", { key: "h" + i, className: "pv-menu__heading pv-label" }, it.heading);
          var selected = select && it.value !== undefined && it.value === props.value;
          var kids = [
            select ? h("span", { key: "c", className: "pv-menu__check", "aria-hidden": "true" }, selected ? lucide("Check", 12) : null) : null,
            h("span", { key: "l", className: "pv-menu__label" }, it.label),
            it.meta ? h("span", { key: "m", className: "pv-menu__meta pv-meta" }, it.meta) : null
          ];
          var common = { key: it.value !== undefined ? it.value : (it.href || i), className: "pv-menu__item", "data-tone": it.tone,
            role: select ? "option" : "menuitem", "aria-selected": select ? (selected ? "true" : "false") : undefined, "aria-current": !select && it.active ? "true" : undefined };
          return it.href
            ? h("a", Object.assign(common, { href: it.href, onClick: function () { setOpen(false); } }), kids)
            : h("button", Object.assign(common, { type: "button", disabled: it.disabled, onClick: function () { choose(it); } }), kids);
        })) : null);
  }

  /* CodeBlock: a file of code with an optional name bar and a copy button. */
  function CodeBlock(props) {
    var st = useState(false), copied = st[0], setCopied = st[1];
    var code = props.code || "";
    function copy() {
      try { navigator.clipboard.writeText(code); } catch (e) {}
      setCopied(true); setTimeout(function () { setCopied(false); }, 1200);
    }
    return h("figure", { className: cx("pv-code", props.className) },
      (props.filename || props.lang || props.copy !== false) ? h("figcaption", { className: "pv-code__bar" },
        h("span", { className: "pv-code__name pv-meta" }, props.filename || props.lang || ""),
        props.copy === false ? null : h("button", { type: "button", className: "pv-code__copy", onClick: copy, "aria-live": "polite" }, copied ? "copied" : "copy")) : null,
      h("pre", { className: "pv-code__body" }, h("code", null, code)));
  }

  /* Prose: the article wrapper — everything inside is plain HTML. */
  function Prose(props) {
    return h(props.as || "div", { className: cx("pv-prose", props.className), "data-accent": props.accent }, props.children);
  }

  function scrollerOf(target) {
    if (!target) return null;
    if (typeof target === "string") return document.querySelector(target);
    if (target.current) return target.current;
    return target;
  }
  function smooth() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; }

  /* TableOfContents: the headings of a page, with the one you are reading marked. */
  function TableOfContents(props) {
    var items = props.items || [];
    var ids = items.map(function (i) { return i.id; }).join(",");
    var st = useState(null), seen = st[0], setSeen = st[1];
    var active = props.activeId !== undefined ? props.activeId : seen;
    var offset = props.offset == null ? 120 : props.offset;

    useEffect(function () {
      if (props.activeId !== undefined || !items.length) return;
      var els = items.map(function (i) { return document.getElementById(i.id); }).filter(Boolean);
      if (!els.length) return;
      var raf = 0;
      function pick() {
        raf = 0;
        var current = els[0].id;
        for (var i = 0; i < els.length; i++) if (els[i].getBoundingClientRect().top <= offset) current = els[i].id;
        setSeen(current);
      }
      function onScroll() { if (!raf) raf = requestAnimationFrame(pick); }
      var host = scrollerOf(props.scroller) || window;
      host.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      pick();
      return function () { cancelAnimationFrame(raf); host.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
    }, [ids, offset, props.activeId, props.scroller]);

    function go(e, id) {
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: smooth(), block: "start" });
      setSeen(id);
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    }

    return h("nav", { className: cx("pv-toc", props.className), "data-accent": props.accent, "data-sticky": props.sticky === false ? "false" : "true", "aria-label": props.label || "On this page" },
      props.title === null ? null : h("div", { className: "pv-toc__title pv-label" },
        h("span", { className: "pv-section__slash", "aria-hidden": "true" }, "//"), " " + (props.title || "on this page")),
      h("ul", null, items.map(function (it) {
        return h("li", { key: it.id, "data-level": it.level || 2 },
          h("a", { href: "#" + it.id, className: "pv-toc__link", "aria-current": active === it.id ? "true" : undefined,
            onClick: function (e) { go(e, it.id); } }, it.label));
      })));
  }

  /* BackToTop: appears once the page has scrolled, returns to the start. */
  function BackToTop(props) {
    var st = useState(false), shown = st[0], setShown = st[1];
    var threshold = props.threshold == null ? 400 : props.threshold;
    useEffect(function () {
      var host = scrollerOf(props.scroller) || window;
      var raf = 0;
      function read() {
        raf = 0;
        var y = host === window ? (window.pageYOffset || document.documentElement.scrollTop) : host.scrollTop;
        setShown(y > threshold);
      }
      function onScroll() { if (!raf) raf = requestAnimationFrame(read); }
      host.addEventListener("scroll", onScroll, { passive: true });
      read();
      return function () { cancelAnimationFrame(raf); host.removeEventListener("scroll", onScroll); };
    }, [threshold, props.scroller]);

    function up() {
      var host = scrollerOf(props.scroller) || window;
      if (host === window) window.scrollTo({ top: 0, behavior: smooth() });
      else host.scrollTo({ top: 0, behavior: smooth() });
      var focus = props.focus ? document.querySelector(props.focus) : null;
      if (focus) focus.focus({ preventScroll: true });
    }

    return h("button", { type: "button", className: cx("pv-top", props.className), "data-shown": shown ? "true" : "false",
      "data-align": props.align || "end", "data-inline": props.inline ? "true" : "false", "data-accent": props.accent,
      onClick: up, tabIndex: shown ? 0 : -1, "aria-hidden": shown ? undefined : "true", title: props.label || "Back to top" },
      h("span", { className: "pv-top__glyph", "aria-hidden": "true" }, props.glyph || "↑"),
      h("span", { className: "pv-top__label" }, props.label || "Top"));
  }

  /* EmptyState: nothing here yet, and what to do about it. */
  function EmptyState(props) {
    return h("div", { className: cx("pv-empty", props.className) },
      h("div", { className: "pv-empty__glyph", "aria-hidden": "true" }, props.glyph || "◌"),
      h("p", { className: "pv-empty__title" }, props.title || "Nothing here yet"),
      props.description ? h("p", { className: "pv-empty__desc" }, props.description) : null,
      props.children ? h("div", { className: "pv-empty__action" }, props.children) : null);
  }

  function Swatch(props) {
    var st = useState(false), copied = st[0], setCopied = st[1];
    function copy() {
      try { navigator.clipboard.writeText(props.value); } catch (e) {}
      setCopied(true); setTimeout(function () { setCopied(false); }, 1200);
    }
    return h("button", { type: "button", className: "pv-swatch", onClick: copy, "data-copied": copied ? "true" : "false", "aria-label": "Copy " + props.name + " " + props.value },
      h("span", { className: "pv-swatch__chip", style: { background: props.token ? "var(--" + props.token + ")" : props.value } }),
      h("span", { className: "pv-swatch__body" },
        h("span", { className: "pv-swatch__name" }, props.name),
        h("span", { className: "pv-swatch__hex", "aria-live": "polite" }, copied ? "copied" : props.value)));
  }

  function MediaTile(props) {
    return h("a", { className: "pv-tile", href: props.href || "#" },
      h("div", { className: "pv-tile__media" },
        props.src ? h("img", { src: props.src, alt: props.alt || "", loading: "lazy" }) : h("span", { className: "pv-tile__ph", "aria-hidden": "true" }),
        props.index == null ? null : h("span", { className: "pv-tile__idx" }, typeof props.index === "number" ? String(props.index).padStart(3, "0") : props.index)),
      h("div", { className: "pv-tile__body" },
        h("div", { className: "pv-tags" }, (props.tags || []).map(function (t) { return h(Tag, { key: t }, t); })),
        h("span", { className: "pv-tile__go" }, props.action || "details →"),
        (props.meta || []).map(function (m, i) { return h("span", { key: i, className: "pv-meta" }, m); })));
  }

  function TerminalWindow(props) {
    var lines = props.lines || [];
    return h("div", { className: cx("pv-term", props.className), "data-accent": props.accent },
      h("div", { className: "pv-term__bar" }, h("i"), h("i"), h("i"), h("span", { className: "pv-term__title" }, props.title || "~")),
      h("pre", { className: "pv-term__body" },
        lines.map(function (l, i) {
          if (l.cmd != null) return h("div", { key: i }, h("span", { className: "pv-term__ps" }, props.prompt || lucide("ChevronRight", 12)), " ", h("span", { className: "pv-term__cmd" }, l.cmd));
          return h("div", { key: i, className: l.tone ? "pv-term__" + l.tone : undefined }, l.out);
        }),
        props.children));
  }

  function SiteFooter(props) {
    var nav = props.nav || [];
    var links = props.links || [];
    return h("footer", { className: cx("pv-footer", props.className), "data-accent": props.accent },
      props.pattern ? h(Contours, { mask: "radial", levels: 10, cell: 16, speed: 0.5, opacity: 0.55, accentEvery: 0, seed: 7, interactive: props.patternInteractive === true, variant: props.patternVariant }) : null,
      h("div", { className: "pv-footer__in" },
        (nav.length || links.length) ? h("div", { className: "pv-footer__top" },
          h("nav", { className: "pv-footer__nav", "aria-label": props.navLabel || "Sitemap" },
            nav.map(function (n, i) {
              return h("a", { key: n.href || i, href: n.href, className: "pv-footer__navlink", "aria-current": n.active ? "true" : undefined }, n.label);
            })),
          h("nav", { className: "pv-footer__marks", "aria-label": props.linksLabel || "Elsewhere" },
            links.map(function (l, i) {
              return h("a", { key: l.href || i, href: l.href, className: "pv-footer__mark", title: l.label, "aria-label": l.label },
                l.icon || h("span", { "aria-hidden": "true" }, l.mark || l.label.slice(0, 2).toLowerCase()));
            }))) : null,
        h("div", { className: "pv-footer__bar pv-meta" },
          h("span", null, props.copyright || "© " + new Date().getFullYear()),
          props.email ? h("a", { className: "pv-footer__email", href: "mailto:" + props.email }, props.email) : null,
          props.children)));
  }

  var api = { Brand: Brand, Contours: Contours, SiteHeader: SiteHeader, SectionHeading: SectionHeading, Tag: Tag, ArrowLink: ArrowLink, List: List, Card: Card, Stat: Stat, Callout: Callout, Breadcrumb: Breadcrumb, SearchField: SearchField, Dropdown: Dropdown, CodeBlock: CodeBlock, Prose: Prose, TableOfContents: TableOfContents, BackToTop: BackToTop, EmptyState: EmptyState, Swatch: Swatch, MediaTile: MediaTile, TerminalWindow: TerminalWindow, SiteFooter: SiteFooter };
  window.Pivoshenko = Object.assign(window.Pivoshenko || {}, api);
})();
