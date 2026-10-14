import type { Fill, Figure, Point, Segment } from "./line-figures";

/**
 * Convierte trazados SVG (atributo `d`) en figuras para la línea animada.
 *
 * Flujo previsto: se genera la ilustración de una sola línea, se vectoriza
 * (por ejemplo con Inkscape, Trazar mapa de bits → Trazado de línea central),
 * se guarda como SVG plano y se pega aquí el `d` del path. Los rellenos suaves
 * pueden venir como paths cerrados adicionales.
 *
 * Soporta todos los comandos de path (M L H V C S Q T A Z, absolutos y relativos).
 * Todo se normaliza a cúbicas (C) y rectas (L), que es lo que la línea sabe escalar.
 */

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

interface Parsed {
  start: Point;
  segments: Segment[];
  end: Point;
  /** Puntos de control y extremos, para calcular la caja. */
  points: Point[];
}

function tokenize(d: string): Array<{ cmd: string; args: number[] }> {
  const out: Array<{ cmd: string; args: number[] }> = [];
  const re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const args = (m[2].match(NUMBER) ?? []).map(Number);
    out.push({ cmd: m[1], args });
  }
  return out;
}

/** Arco elíptico a cúbicas (implementación estándar del apéndice del SVG). */
function arcToCubics(
  from: Point,
  rx: number,
  ry: number,
  rotation: number,
  largeArc: number,
  sweep: number,
  to: Point,
): number[][] {
  if (rx === 0 || ry === 0 || (from.x === to.x && from.y === to.y)) {
    return [[to.x, to.y, to.x, to.y, to.x, to.y]];
  }
  const phi = (rotation * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (from.x - to.x) / 2;
  const dy = (from.y - to.y) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  let rxs = rx * rx;
  let rys = ry * ry;
  const lambda = (x1 * x1) / rxs + (y1 * y1) / rys;
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
    rxs = rx * rx;
    rys = ry * ry;
  }
  const sign = largeArc === sweep ? -1 : 1;
  const num = Math.max(0, rxs * rys - rxs * y1 * y1 - rys * x1 * x1);
  const den = rxs * y1 * y1 + rys * x1 * x1;
  const coef = sign * Math.sqrt(den === 0 ? 0 : num / den);
  const cxp = (coef * rx * y1) / ry;
  const cyp = (-coef * ry * x1) / rx;
  const cx = cos * cxp - sin * cyp + (from.x + to.x) / 2;
  const cy = sin * cxp + cos * cyp + (from.y + to.y) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let a = Math.acos(Math.max(-1, Math.min(1, dot / len)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const theta1 = angle(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let delta = angle((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const n = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2)));
  const step = delta / n;
  const result: number[][] = [];
  let t = theta1;
  for (let i = 0; i < n; i++) {
    const t2 = t + step;
    const alpha = (4 / 3) * Math.tan(step / 4);
    const p = (a: number) => ({
      x: cx + rx * Math.cos(a) * cos - ry * Math.sin(a) * sin,
      y: cy + rx * Math.cos(a) * sin + ry * Math.sin(a) * cos,
    });
    const d1 = (a: number) => ({
      x: -rx * Math.sin(a) * cos - ry * Math.cos(a) * sin,
      y: -rx * Math.sin(a) * sin + ry * Math.cos(a) * cos,
    });
    const p1 = p(t);
    const p2 = p(t2);
    const q1 = d1(t);
    const q2 = d1(t2);
    result.push([
      p1.x + alpha * q1.x,
      p1.y + alpha * q1.y,
      p2.x - alpha * q2.x,
      p2.y - alpha * q2.y,
      p2.x,
      p2.y,
    ]);
    t = t2;
  }
  return result;
}

export function parsePath(d: string): Parsed {
  const segments: Segment[] = [];
  const points: Point[] = [];
  let cur = { x: 0, y: 0 };
  let start: Point | null = null;
  let subStart = { x: 0, y: 0 };
  let lastCtrl: Point | null = null;
  let lastCmd = "";

  const push = (seg: Segment) => {
    segments.push(seg);
    for (let i = 0; i < seg.p.length; i += 2) points.push({ x: seg.p[i], y: seg.p[i + 1] });
  };
  const lineTo = (x: number, y: number) => {
    push({ c: "L", p: [x, y] });
    cur = { x, y };
    lastCtrl = null;
  };
  const cubicTo = (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => {
    push({ c: "C", p: [x1, y1, x2, y2, x, y] });
    cur = { x, y };
    lastCtrl = { x: x2, y: y2 };
  };
  const quadTo = (qx: number, qy: number, x: number, y: number) => {
    const x1 = cur.x + (2 / 3) * (qx - cur.x);
    const y1 = cur.y + (2 / 3) * (qy - cur.y);
    const x2 = x + (2 / 3) * (qx - x);
    const y2 = y + (2 / 3) * (qy - y);
    push({ c: "C", p: [x1, y1, x2, y2, x, y] });
    cur = { x, y };
    lastCtrl = { x: qx, y: qy };
  };

  for (const { cmd, args } of tokenize(d)) {
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = () => (rel ? cur.x : 0);
    const oy = () => (rel ? cur.y : 0);
    let i = 0;
    const take = (n: number) => {
      const slice = args.slice(i, i + n);
      i += n;
      return slice;
    };

    if (C === "Z") {
      if (cur.x !== subStart.x || cur.y !== subStart.y) lineTo(subStart.x, subStart.y);
      lastCmd = C;
      continue;
    }

    while (i < args.length || (C === "M" && i === 0 && args.length === 0)) {
      switch (C) {
        case "M": {
          const [x, y] = take(2);
          const p = { x: x + ox(), y: y + oy() };
          if (!start) {
            start = p;
            cur = p;
            points.push(p);
          } else {
            // Un nuevo subtrazado se une con una recta para mantener un solo trazo.
            lineTo(p.x, p.y);
          }
          subStart = p;
          lastCtrl = null;
          // Coordenadas extra tras M se tratan como L.
          while (i < args.length) {
            const [lx, ly] = take(2);
            lineTo(lx + ox(), ly + oy());
          }
          break;
        }
        case "L": {
          const [x, y] = take(2);
          lineTo(x + ox(), y + oy());
          break;
        }
        case "H": {
          const [x] = take(1);
          lineTo(x + ox(), cur.y);
          break;
        }
        case "V": {
          const [y] = take(1);
          lineTo(cur.x, y + oy());
          break;
        }
        case "C": {
          const [x1, y1, x2, y2, x, y] = take(6);
          cubicTo(x1 + ox(), y1 + oy(), x2 + ox(), y2 + oy(), x + ox(), y + oy());
          break;
        }
        case "S": {
          const [x2, y2, x, y] = take(4);
          const reflect =
            lastCtrl && (lastCmd === "C" || lastCmd === "S")
              ? { x: 2 * cur.x - lastCtrl.x, y: 2 * cur.y - lastCtrl.y }
              : cur;
          cubicTo(reflect.x, reflect.y, x2 + ox(), y2 + oy(), x + ox(), y + oy());
          break;
        }
        case "Q": {
          const [qx, qy, x, y] = take(4);
          quadTo(qx + ox(), qy + oy(), x + ox(), y + oy());
          break;
        }
        case "T": {
          const [x, y] = take(2);
          const reflect =
            lastCtrl && (lastCmd === "Q" || lastCmd === "T")
              ? { x: 2 * cur.x - lastCtrl.x, y: 2 * cur.y - lastCtrl.y }
              : cur;
          quadTo(reflect.x, reflect.y, x + ox(), y + oy());
          break;
        }
        case "A": {
          const [rx, ry, rot, large, sweep, x, y] = take(7);
          const to = { x: x + ox(), y: y + oy() };
          for (const c of arcToCubics(cur, Math.abs(rx), Math.abs(ry), rot, large, sweep, to)) {
            cubicTo(c[0], c[1], c[2], c[3], c[4], c[5]);
          }
          break;
        }
        default:
          i = args.length;
      }
      if (C === "M") break;
    }
    lastCmd = C;
  }

  return { start: start ?? { x: 0, y: 0 }, segments, end: cur, points };
}

export interface SvgFigureOptions {
  /** Trazado principal, atributo `d` del path de la línea. */
  stroke: string;
  /** Rellenos suaves: paths cerrados y color de la paleta. */
  fills?: Array<{ d: string; color: Fill["color"] }>;
  /** Margen alrededor del dibujo, en unidades del SVG. */
  padding?: number;
  /** La línea termina en esta figura (sin salida). */
  terminal?: boolean;
}

/**
 * Crea una figura a partir de trazados SVG. La entrada es el primer punto del
 * trazo y la salida el último, así que conviene que el dibujo empiece por donde
 * debe llegar la línea y termine por donde debe irse.
 */
export function svgFigure(options: SvgFigureOptions): Figure {
  const parsed = parsePath(options.stroke);
  const fills = (options.fills ?? []).map((f) => ({ ...f, parsed: parsePath(f.d) }));
  const all = [parsed.start, ...parsed.points, ...fills.flatMap((f) => [f.parsed.start, ...f.parsed.points])];
  const pad = options.padding ?? 8;
  const minX = Math.min(...all.map((p) => p.x)) - pad;
  const minY = Math.min(...all.map((p) => p.y)) - pad;
  const maxX = Math.max(...all.map((p) => p.x)) + pad;
  const maxY = Math.max(...all.map((p) => p.y)) + pad;

  const shift = (segments: Segment[]): Segment[] =>
    segments.map((s) => ({
      c: s.c,
      p: s.p.map((v, i) => (i % 2 === 0 ? v - minX : v - minY)),
    })) as Segment[];

  return {
    box: { width: maxX - minX, height: maxY - minY },
    entry: { x: parsed.start.x - minX, y: parsed.start.y - minY },
    exit: options.terminal ? undefined : { x: parsed.end.x - minX, y: parsed.end.y - minY },
    stroke: shift(parsed.segments),
    fills: fills.map((f) => ({
      from: { x: f.parsed.start.x - minX, y: f.parsed.start.y - minY },
      segments: shift(f.parsed.segments),
      color: f.color,
    })),
  };
}
