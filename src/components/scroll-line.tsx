"use client";

import { useEffect, useRef } from "react";
import { figures, fillToPath, segmentsToPath, type FigureName, type Point } from "./line-figures";

/**
 * Línea de un solo trazo que recorre la página y se dibuja con el scroll.
 *
 * 1. La página marca anclajes con `data-line` dentro de un contenedor
 *    `data-line-root`. Valores: "start", "pass" o el nombre de una figura de
 *    line-figures.ts. `data-line-size` fija la altura de la figura en píxeles.
 *    Cada figura queda centrada sobre su anclaje.
 * 2. Con las posiciones reales del DOM se construye un único trazado SVG:
 *    conectores que bailan entre anclajes y la figura correspondiente en cada uno.
 * 3. El avance se calcula por longitud: cada tramo del trazado se asocia a la
 *    franja vertical que ocupa, así la línea se llena de forma continua y no
 *    salta al llegar a una figura. Un suavizado entre cuadros redondea el movimiento.
 * 4. Al cargar, la línea se dibuja sola hasta donde alcanza la pantalla.
 *
 * Solo se muestra en pantallas grandes y respeta prefers-reduced-motion.
 */

const FILL_COLORS: Record<string, string> = {
  "terracota-soft": "var(--color-terracota-soft)",
  "salvia-soft": "var(--color-salvia-soft)",
  salvia: "var(--color-salvia)",
  "crema-dark": "var(--color-crema-dark)",
  crema: "var(--color-crema)",
};

const K = 0.5523;
const pt = (p: Point) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

/** Círculo en cuatro cúbicas desde el punto superior, en sentido horario. */
function loop(top: Point, r: number) {
  const cx = top.x;
  const cy = top.y + r;
  const k = K * r;
  return (
    ` C ${pt({ x: cx + k, y: cy - r })} ${pt({ x: cx + r, y: cy - k })} ${pt({ x: cx + r, y: cy })}` +
    ` C ${pt({ x: cx + r, y: cy + k })} ${pt({ x: cx + k, y: cy + r })} ${pt({ x: cx, y: cy + r })}` +
    ` C ${pt({ x: cx - k, y: cy + r })} ${pt({ x: cx - r, y: cy + k })} ${pt({ x: cx - r, y: cy })}` +
    ` C ${pt({ x: cx - r, y: cy - k })} ${pt({ x: cx - k, y: cy - r })} ${pt(top)}`
  );
}

function curve(from: Point, to: Point, sway: number, maxAmp = 110) {
  const dy = to.y - from.y;
  if (dy < 12) return ` L ${pt(to)}`;
  const amplitude = Math.min(dy * 0.3, maxAmp) * sway;
  const c1 = { x: from.x + amplitude, y: from.y + dy * 0.45 };
  const c2 = { x: to.x - amplitude, y: to.y - dy * 0.45 };
  return ` C ${pt(c1)} ${pt(c2)} ${pt(to)}`;
}

/** Tramo vertical dentro de una columna; cada tercer tramo largo lleva un rizo. */
function descend(from: Point, to: Point, index: number) {
  const dy = to.y - from.y;
  if (dy < 12) return ` L ${pt(to)}`;
  const sway = index % 2 === 0 ? 1 : -1;
  if (index % 3 === 1 && dy > 150) {
    const r = Math.min(20, dy * 0.08);
    const mid = { x: (from.x + to.x) / 2 + 24 * sway, y: from.y + dy * 0.5 - r };
    return curve(from, mid, sway, 40) + loop(mid, r) + curve(mid, to, -sway, 40);
  }
  return curve(from, to, sway, 40);
}

interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Conector entre dos puntos. Si cambia de columna, cruza solo por la franja
 * horizontal libre de texto que haya entre ambos: baja por su columna, cruza
 * por el hueco y vuelve a bajar en la columna de destino.
 */
function connector(from: Point, to: Point, index: number, blockers: Rect[]) {
  const dy = to.y - from.y;
  if (dy < 12) return ` L ${pt(to)}`;
  if (Math.abs(to.x - from.x) < 90) return descend(from, to, index);

  // Huecos verticales entre bloques de texto dentro del tramo.
  const span = blockers
    .filter((b) => b.bottom > from.y && b.top < to.y)
    .sort((a, b) => a.top - b.top);
  let cursor = from.y;
  let best: { top: number; bottom: number } | null = null;
  const consider = (top: number, bottom: number) => {
    if (bottom - top > (best ? best.bottom - best.top : -Infinity)) best = { top, bottom };
  };
  for (const b of span) {
    if (b.top > cursor) consider(cursor, b.top);
    cursor = Math.max(cursor, b.bottom);
  }
  if (to.y > cursor) consider(cursor, to.y);
  if (!best) return curve(from, to, index % 2 === 0 ? 1 : -1, 60);

  const band = best as { top: number; bottom: number };
  const pad = Math.min(10, (band.bottom - band.top) * 0.2);
  const m1 = { x: from.x, y: Math.max(from.y, Math.min(band.top + pad, to.y - 24)) };
  const m2 = { x: to.x, y: Math.max(m1.y + 8, Math.min(band.bottom - pad, to.y - 12)) };
  const sway = index % 2 === 0 ? 1 : -1;
  return (
    descend(from, m1, index) +
    ` C ${pt({ x: from.x, y: m1.y + (m2.y - m1.y) * 0.6 })} ${pt({ x: to.x, y: m1.y + (m2.y - m1.y) * 0.4 })} ${pt(m2)}` +
    curve(m2, to, -sway, 40)
  );
}

interface FillSpec {
  d: string;
  color: string;
  prefix: string;
}

interface Station {
  y: number;
  prefix: string;
}

function build(root: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  const anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
  const blockers: Rect[] = Array.from(root.querySelectorAll<HTMLElement>("[data-line-text]")).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: r.top - rootRect.top,
      bottom: r.bottom - rootRect.top,
      left: r.left - rootRect.left,
      right: r.right - rootRect.left,
    };
  });
  let d = "";
  let current: Point | null = null;
  const fills: FillSpec[] = [];
  const stations: Station[] = [];
  let index = 0;
  let ended = false;

  for (const el of anchors) {
    if (ended) break;
    const kind = el.dataset.line ?? "";
    const r = el.getBoundingClientRect();
    const center = {
      x: r.left + r.width / 2 - rootRect.left,
      y: r.top + r.height / 2 - rootRect.top,
    };

    if (kind === "start") {
      current = center;
      d = `M ${pt(current)}`;
      stations.push({ y: current.y, prefix: d });
      continue;
    }
    if (!current) continue;

    if (kind === "pass") {
      d += connector(current, center, index++, blockers);
      current = center;
      stations.push({ y: current.y, prefix: d });
      continue;
    }

    const figure = figures[kind as FigureName];
    if (!figure) continue;

    const size = Number(el.dataset.lineSize) || 200;
    const scale = size / figure.box.height;
    const offset = {
      x: center.x - (figure.box.width / 2) * scale,
      y: center.y - (figure.box.height / 2) * scale,
    };
    const entry = { x: offset.x + figure.entry.x * scale, y: offset.y + figure.entry.y * scale };

    d += connector(current, entry, index++, blockers);
    stations.push({ y: entry.y, prefix: d });
    for (const fill of figure.fills) {
      fills.push({ d: fillToPath(fill, scale, offset), color: FILL_COLORS[fill.color], prefix: d });
    }
    d += segmentsToPath(figure.stroke, scale, offset);

    if (!figure.exit) {
      stations.push({ y: offset.y + figure.box.height * scale, prefix: d });
      ended = true;
      break;
    }
    current = { x: offset.x + figure.exit.x * scale, y: offset.y + figure.exit.y * scale };
    stations.push({ y: current.y, prefix: d });
  }

  return { d, fills, stations };
}

export function ScrollLine() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const root = svg?.closest<HTMLElement>("[data-line-root]");
    if (!svg || !root) return;

    const ns = "http://www.w3.org/2000/svg";
    const fillGroup = svg.querySelector<SVGGElement>("[data-fills]")!;
    const path = svg.querySelector<SVGPathElement>("[data-stroke]")!;
    const tip = svg.querySelector<SVGCircleElement>("[data-tip]")!;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)");

    let length = 0;
    let stations: { y: number; len: number }[] = [];
    let fillStarts: { el: SVGPathElement; start: number }[] = [];
    let current = 0;
    let target = 0;
    let frame = 0;
    // Longitud hasta el final de la primera figura: al primer gesto de bajar
    // se dibuja de golpe, rápido, y desde ahí la línea sigue el ritmo normal.
    let firstFigureEnd = 0;
    let started = false;

    function measure(prefix: string) {
      const probe = document.createElementNS(ns, "path");
      probe.setAttribute("d", prefix);
      svg!.appendChild(probe);
      const len = probe.getTotalLength();
      probe.remove();
      return len;
    }

    function layout() {
      if (!desktop.matches) {
        svg!.style.display = "none";
        return;
      }
      svg!.style.display = "";
      const { width, height } = root!.getBoundingClientRect();
      svg!.setAttribute("width", String(width));
      svg!.setAttribute("height", String(height));
      svg!.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const built = build(root!);
      path.setAttribute("d", built.d);
      length = built.d ? path.getTotalLength() : 0;
      path.style.strokeDasharray = `${length} ${length}`;

      // Estaciones: altura de página → longitud dibujada, siempre crecientes.
      let lastY = -Infinity;
      firstFigureEnd = built.stations[2] ? measure(built.stations[2].prefix) : 0;
      stations = built.stations.map((s) => {
        const y = Math.max(s.y, lastY + 1);
        lastY = y;
        return { y, len: measure(s.prefix) };
      });

      fillGroup.replaceChildren();
      fillStarts = built.fills.map((f) => {
        const el = document.createElementNS(ns, "path");
        el.setAttribute("d", f.d);
        el.setAttribute("fill", f.color);
        el.style.opacity = "0";
        el.style.transition = "opacity 600ms ease";
        fillGroup.appendChild(el);
        return { el, start: measure(f.prefix) };
      });

      current = reduceMotion ? length : 0;
      updateTarget();
      render(target);
    }

    function lengthAt(y: number) {
      if (stations.length === 0) return 0;
      if (y <= stations[0].y) return 0;
      for (let i = 1; i < stations.length; i++) {
        const a = stations[i - 1];
        const b = stations[i];
        if (y <= b.y) {
          const t = (y - a.y) / (b.y - a.y);
          return a.len + (b.len - a.len) * t;
        }
      }
      return length;
    }

    function updateTarget() {
      if (length === 0) return;
      if (reduceMotion) {
        target = length;
        return;
      }
      const rootTop = root!.getBoundingClientRect().top + window.scrollY;
      // La punta va algo por debajo del centro de la pantalla: se ve cómo el
      // trazo avanza en la parte baja y queda completo antes de que el bloque
      // salga por arriba.
      const tipY = window.scrollY + window.innerHeight * 0.85 - rootTop;
      if (!started && window.scrollY > 4) started = true;
      if (!started) {
        target = 0;
        return;
      }
      target = Math.max(lengthAt(tipY), Math.min(firstFigureEnd, length));
    }

    function render(drawn: number) {
      path.style.strokeDashoffset = String(length - drawn);
      for (const f of fillStarts) {
        f.el.style.opacity = drawn >= f.start + 24 ? "1" : "0";
      }
      if (drawn > 1) {
        const p = path.getPointAtLength(Math.min(drawn, length));
        tip.setAttribute("cx", p.x.toFixed(1));
        tip.setAttribute("cy", p.y.toFixed(1));
        tip.style.opacity = "1";
      } else {
        tip.style.opacity = "0";
      }
    }

    function animate() {
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        current = target;
        render(current);
        return;
      }
      // Arranque rápido hasta completar la primera figura; después, más pausado.
      current += diff * (current < firstFigureEnd ? 0.2 : 0.11);
      render(current);
      frame = requestAnimationFrame(animate);
    }

    function onScroll() {
      updateTarget();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(animate);
    }

    layout();
    const observer = new ResizeObserver(() => layout());
    observer.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute top-0 left-0 z-[1] hidden lg:block"
    >
      <g data-fills />
      <path
        data-stroke
        fill="none"
        stroke="var(--color-tinta-soft)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle data-tip r={5} fill="var(--color-terracota)" style={{ opacity: 0 }} />
    </svg>
  );
}
