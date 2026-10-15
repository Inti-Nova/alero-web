#!/usr/bin/env node
/**
 * Convierte ilustraciones de un solo trazo (JPG/PNG, línea oscura sobre fondo
 * claro) en figuras para la línea animada del sitio.
 *
 *   node scripts/trace-figure.mjs docs/brief/figuras/familia.jpg [más archivos…]
 *   node scripts/trace-figure.mjs docs/brief/figuras/*.jpg
 *
 * Por cada imagen genera `src/components/figures/<nombre>.ts` y regenera
 * `src/components/figures/index.ts`. El nombre de la figura es el del archivo.
 *
 * Pasos: binarizar → cerrar huecos → adelgazar a 1 px (Zhang-Suen) → grafo de
 * tramos → recorrido euleriano de un solo trazo (entra por el extremo más a la
 * izquierda y sale por el más a la derecha) → simplificar y suavizar en curvas.
 * Los huecos cerrados más grandes del dibujo se convierten en rellenos suaves.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const MAX_SIDE = 1000; // lado de trabajo
const INK = 150; // gris por debajo del cual el píxel es tinta
const SPUR = 20; // ramitas más cortas que esto (px) se podan
const EPS = 2.0; // tolerancia de simplificación del trazo (px)
const FILL_EPS = 3;
const CLOSE_RADIUS = 10; // huecos de hasta el doble (px) cuentan como cerrados para los rellenos
const MAX_FILLS = 3;
const MIN_COMPONENT = 40; // manchas con menos píxeles se descartan
const FILL_COLORS = ["crema-dark", "terracota-soft", "salvia-soft"];

const OUT_DIR = path.join("src", "components", "figures");

// ───────────────────────── imagen → binario ─────────────────────────

async function loadBinary(file) {
  const { data, info } = await sharp(file)
    .rotate()
    .flatten({ background: "#ffffff" })
    .grayscale()
    .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
    .blur(0.6)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const bin = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) bin[i] = data[i] < INK ? 1 : 0;
  // Borde limpio para que los algoritmos no miren fuera.
  for (let x = 0; x < w; x++) bin[x] = bin[(h - 1) * w + x] = 0;
  for (let y = 0; y < h; y++) bin[y * w] = bin[y * w + w - 1] = 0;
  return { bin, w, h };
}

function dilate(bin, w, h) {
  const out = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (
        bin[i] || bin[i - 1] || bin[i + 1] || bin[i - w] || bin[i + w] ||
        bin[i - w - 1] || bin[i - w + 1] || bin[i + w - 1] || bin[i + w + 1]
      ) out[i] = 1;
    }
  }
  return out;
}

/** Etiqueta componentes (8-conexos si eight, si no 4-conexos). */
function label(bin, w, h, eight) {
  const labels = new Int32Array(w * h).fill(-1);
  const sizes = [];
  const stack = [];
  for (let s = 0; s < w * h; s++) {
    if (!bin[s] || labels[s] !== -1) continue;
    const id = sizes.length;
    let size = 0;
    stack.push(s);
    labels[s] = id;
    while (stack.length) {
      const i = stack.pop();
      size++;
      const x = i % w;
      const y = (i - x) / w;
      const push = (j) => {
        if (bin[j] && labels[j] === -1) {
          labels[j] = id;
          stack.push(j);
        }
      };
      if (x > 0) push(i - 1);
      if (x < w - 1) push(i + 1);
      if (y > 0) push(i - w);
      if (y < h - 1) push(i + w);
      if (eight) {
        if (x > 0 && y > 0) push(i - w - 1);
        if (x < w - 1 && y > 0) push(i - w + 1);
        if (x > 0 && y < h - 1) push(i + w - 1);
        if (x < w - 1 && y < h - 1) push(i + w + 1);
      }
    }
    sizes.push(size);
  }
  return { labels, sizes };
}

function removeSmall(bin, w, h, min) {
  const { labels, sizes } = label(bin, w, h, true);
  for (let i = 0; i < w * h; i++) if (bin[i] && sizes[labels[i]] < min) bin[i] = 0;
  return bin;
}

/** Adelgazamiento de Zhang-Suen a un esqueleto de 1 px. */
function thin(src, w, h) {
  const img = Uint8Array.from(src);
  let changed = true;
  while (changed) {
    changed = false;
    for (let step = 0; step < 2; step++) {
      const del = [];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (!img[i]) continue;
          const p2 = img[i - w], p3 = img[i - w + 1], p4 = img[i + 1], p5 = img[i + w + 1];
          const p6 = img[i + w], p7 = img[i + w - 1], p8 = img[i - 1], p9 = img[i - w - 1];
          const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (b < 2 || b > 6) continue;
          let a = 0;
          if (p2 === 0 && p3 === 1) a++;
          if (p3 === 0 && p4 === 1) a++;
          if (p4 === 0 && p5 === 1) a++;
          if (p5 === 0 && p6 === 1) a++;
          if (p6 === 0 && p7 === 1) a++;
          if (p7 === 0 && p8 === 1) a++;
          if (p8 === 0 && p9 === 1) a++;
          if (p9 === 0 && p2 === 1) a++;
          if (a !== 1) continue;
          if (step === 0) {
            if (p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0) continue;
          } else if (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) continue;
          del.push(i);
        }
      }
      for (const i of del) img[i] = 0;
      if (del.length) changed = true;
    }
  }
  // Quita píxeles redundantes en escaleras (dejan esquinas de 2 px).
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!img[i]) continue;
      if ((img[i - 1] && img[i - w] && !img[i - w - 1]) || (img[i + 1] && img[i - w] && !img[i - w + 1]) ||
          (img[i - 1] && img[i + w] && !img[i + w - 1]) || (img[i + 1] && img[i + w] && !img[i + w + 1])) {
        // Solo si al quitarlo los vecinos siguen conectados entre sí (lo están: son 4-vecinos en L).
        const n = img[i - 1] + img[i + 1] + img[i - w] + img[i + w] + img[i - w - 1] + img[i - w + 1] + img[i + w - 1] + img[i + w + 1];
        if (n === 2) img[i] = 0;
      }
    }
  }
  return img;
}

// ───────────────────────── esqueleto → grafo ─────────────────────────

const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

function buildGraph(skel, w, h) {
  const deg = new Uint8Array(w * h);
  const pixels = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!skel[i]) continue;
      let d = 0;
      for (const [dx, dy] of N8) if (skel[i + dy * w + dx]) d++;
      deg[i] = d;
      pixels.push(i);
    }
  }
  // Agrupa píxeles nodo (grado ≠ 2) adyacentes en un mismo nodo.
  const cluster = new Int32Array(w * h).fill(-1);
  const nodes = []; // { pixels: number[], x, y }
  for (const s of pixels) {
    if (deg[s] === 2 || cluster[s] !== -1) continue;
    const id = nodes.length;
    const members = [];
    const stack = [s];
    cluster[s] = id;
    while (stack.length) {
      const i = stack.pop();
      members.push(i);
      for (const [dx, dy] of N8) {
        const j = i + dy * w + dx;
        if (skel[j] && deg[j] !== 2 && cluster[j] === -1) {
          cluster[j] = id;
          stack.push(j);
        }
      }
    }
    let sx = 0, sy = 0;
    for (const i of members) { sx += i % w; sy += (i - (i % w)) / w; }
    nodes.push({ pixels: members, x: sx / members.length, y: sy / members.length });
  }

  const edges = []; // { a, b, chain: [[x,y]...], len, kind }
  const visited = new Uint8Array(w * h);
  const toXY = (i) => [i % w, (i - (i % w)) / w];
  const pairSeen = new Set();

  const walk = (startNode, p, q) => {
    const chain = [toXY(p), toXY(q)];
    let prev = p, cur = q;
    visited[cur] = 1;
    for (let guard = 0; guard < w * h; guard++) {
      let next = -1;
      for (const [dx, dy] of N8) {
        const j = cur + dy * w + dx;
        if (skel[j] && j !== prev && !(deg[j] === 2 && visited[j])) { next = j; break; }
      }
      if (next === -1) {
        // Cadena que muere (no debería pasar): la cerramos como extremo nuevo.
        const id = nodes.length;
        nodes.push({ pixels: [cur], x: cur % w, y: (cur - (cur % w)) / w });
        cluster[cur] = id;
        return { b: id, chain };
      }
      chain.push(toXY(next));
      if (deg[next] !== 2) return { b: cluster[next], chain };
      visited[next] = 1;
      prev = cur;
      cur = next;
    }
    return { b: startNode, chain };
  };

  for (let a = 0; a < nodes.length; a++) {
    for (const p of nodes[a].pixels) {
      for (const [dx, dy] of N8) {
        const q = p + dy * w + dx;
        if (!skel[q]) continue;
        if (deg[q] !== 2) {
          const b = cluster[q];
          if (b === a) continue;
          const key = p < q ? `${p}:${q}` : `${q}:${p}`;
          if (pairSeen.has(key)) continue;
          pairSeen.add(key);
          edges.push({ a, b, chain: [toXY(p), toXY(q)], len: 1, kind: "ink" });
        } else if (!visited[q]) {
          const { b, chain } = walk(a, p, q);
          edges.push({ a, b, chain, len: chainLength(chain), kind: "ink" });
        }
      }
    }
  }
  // Ciclos puros sin nodos: se abre uno como nodo artificial.
  for (const s of pixels) {
    if (deg[s] !== 2 || visited[s]) continue;
    const id = nodes.length;
    nodes.push({ pixels: [s], x: s % w, y: (s - (s % w)) / w });
    cluster[s] = id;
    deg[s] = 1; // marcar como nodo para que walk se detenga al volver
    visited[s] = 1;
    for (const [dx, dy] of N8) {
      const q = s + dy * w + dx;
      if (skel[q] && deg[q] === 2 && !visited[q]) {
        const { b, chain } = walk(id, s, q);
        edges.push({ a: id, b, chain, len: chainLength(chain), kind: "ink" });
        break;
      }
    }
  }
  return { nodes, edges };
}

function chainLength(chain) {
  let l = 0;
  for (let i = 1; i < chain.length; i++) l += Math.hypot(chain[i][0] - chain[i - 1][0], chain[i][1] - chain[i - 1][1]);
  return l;
}

function degrees(nodes, edges) {
  const d = new Array(nodes.length).fill(0);
  for (const e of edges) { d[e.a]++; d[e.b]++; }
  return d;
}

/** Poda ramitas cortas que terminan en un extremo. */
function prune(nodes, edges) {
  for (let round = 0; round < 3; round++) {
    const d = degrees(nodes, edges);
    const keep = edges.filter((e) => !(e.len < SPUR && (d[e.a] === 1 || d[e.b] === 1) && !(d[e.a] === 1 && d[e.b] === 1 && edges.length === 1)));
    if (keep.length === edges.length) break;
    edges = keep;
  }
  return edges;
}

/** Une componentes separados con saltos rectos entre los nodos más cercanos. */
function connectComponents(nodes, edges) {
  const parent = nodes.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (const e of edges) parent[find(e.a)] = find(e.b);
  const used = new Set();
  for (const e of edges) { used.add(e.a); used.add(e.b); }
  const comps = new Map();
  for (const i of used) {
    const r = find(i);
    if (!comps.has(r)) comps.set(r, []);
    comps.get(r).push(i);
  }
  if (comps.size <= 1) return edges;
  // Prim: parte del componente más grande y va anexando el más cercano.
  const groups = [...comps.values()].sort((a, b) => b.length - a.length);
  let main = groups[0];
  let rest = groups.slice(1);
  while (rest.length) {
    let best = null;
    for (let gi = 0; gi < rest.length; gi++) {
      for (const i of rest[gi]) {
        for (const j of main) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (!best || dist < best.dist) best = { dist, i, j, gi };
        }
      }
    }
    edges.push({
      a: best.j, b: best.i, kind: "jump", len: best.dist,
      chain: [[nodes[best.j].x, nodes[best.j].y], [nodes[best.i].x, nodes[best.i].y]],
    });
    main = main.concat(rest[best.gi]);
    rest.splice(best.gi, 1);
  }
  return edges;
}

// ───────────────────────── recorrido euleriano ─────────────────────────

function dijkstra(nodes, adj, src) {
  const dist = new Array(nodes.length).fill(Infinity);
  const prev = new Array(nodes.length).fill(null); // edge index used to arrive
  dist[src] = 0;
  const open = [src];
  const done = new Uint8Array(nodes.length);
  while (open.length) {
    let bi = 0;
    for (let k = 1; k < open.length; k++) if (dist[open[k]] < dist[open[bi]]) bi = k;
    const u = open.splice(bi, 1)[0];
    if (done[u]) continue;
    done[u] = 1;
    for (const { to, edge, len } of adj[u]) {
      if (dist[u] + len < dist[to]) {
        dist[to] = dist[u] + len;
        prev[to] = { edge, from: u };
        open.push(to);
      }
    }
  }
  return { dist, prev };
}

function eulerTrail(nodes, edges) {
  const d = degrees(nodes, edges);
  const ends = nodes.map((_, i) => i).filter((i) => d[i] === 1);
  const byX = (list) => list.slice().sort((i, j) => nodes[i].x - nodes[j].x || nodes[i].y - nodes[j].y);
  const active = nodes.map((_, i) => i).filter((i) => d[i] > 0);
  const s = ends.length ? byX(ends)[0] : byX(active)[0];
  let t = ends.length > 1 ? byX(ends)[ends.length - 1] : byX(active)[active.length - 1];
  if (t === s) t = byX(active).find((i) => i !== s) ?? s;

  const work = edges.map((e) => ({ ...e }));
  const virtual = s !== t ? work.push({ a: s, b: t, chain: [], len: 0, kind: "virtual" }) - 1 : -1;

  const makeAdj = () => {
    const adj = nodes.map(() => []);
    work.forEach((e, idx) => {
      if (e.kind === "virtual") return;
      adj[e.a].push({ to: e.b, edge: idx, len: e.len });
      adj[e.b].push({ to: e.a, edge: idx, len: e.len });
    });
    return adj;
  };
  const adj = makeAdj();

  // Empareja nodos impares duplicando el camino más corto entre ellos.
  let odd = degrees(nodes, work).map((v, i) => (v % 2 ? i : -1)).filter((i) => i >= 0);
  const paths = new Map();
  for (const o of odd) paths.set(o, dijkstra(nodes, adj, o));
  while (odd.length > 1) {
    let best = null;
    for (let i = 0; i < odd.length; i++) {
      for (let j = i + 1; j < odd.length; j++) {
        const dd = paths.get(odd[i]).dist[odd[j]];
        if (!best || dd < best.dd) best = { dd, i, j };
      }
    }
    if (!best || !isFinite(best.dd)) break;
    const from = odd[best.i], to = odd[best.j];
    const { prev } = paths.get(from);
    let cur = to;
    while (cur !== from && prev[cur]) {
      work.push({ ...work[prev[cur].edge], kind: work[prev[cur].edge].kind === "jump" ? "jump" : "retrace" });
      cur = prev[cur].from;
    }
    odd = odd.filter((_, k) => k !== best.i && k !== best.j);
  }

  // Hierholzer.
  const full = nodes.map(() => []);
  work.forEach((e, idx) => {
    full[e.a].push({ to: e.b, edge: idx });
    full[e.b].push({ to: e.a, edge: idx });
  });
  const used = new Uint8Array(work.length);
  const ptr = new Array(nodes.length).fill(0);
  const stack = [{ node: s, via: -1 }];
  const circuit = [];
  while (stack.length) {
    const top = stack[stack.length - 1];
    const list = full[top.node];
    while (ptr[top.node] < list.length && used[list[ptr[top.node]].edge]) ptr[top.node]++;
    if (ptr[top.node] < list.length) {
      const { to, edge } = list[ptr[top.node]];
      used[edge] = 1;
      stack.push({ node: to, via: edge });
    } else {
      circuit.push(stack.pop());
    }
  }
  circuit.reverse();

  let steps;
  if (virtual >= 0) {
    const k = circuit.findIndex((c) => c.via === virtual);
    steps = circuit.slice(k + 1).concat(circuit.slice(1, k)).map((c) => c.via);
    const startNode = circuit[k].node;
    if (startNode !== s) steps.reverse();
  } else {
    steps = circuit.slice(1).map((c) => c.via);
  }

  // Edges → puntos
  const points = [];
  let at = s;
  const pushPt = (p) => {
    const last = points[points.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) points.push(p);
  };
  pushPt([nodes[s].x, nodes[s].y]);
  for (const idx of steps) {
    const e = work[idx];
    const chain = e.a === at ? e.chain : e.chain.slice().reverse();
    if (e.kind === "jump" || e.chain.length === 0) {
      const to = e.a === at ? e.b : e.a;
      pushPt([nodes[to].x, nodes[to].y]);
      at = to;
      continue;
    }
    for (const p of chain) pushPt(p);
    at = e.a === at ? e.b : e.a;
  }
  pushPt([nodes[at].x, nodes[at].y]);
  const inkLength = edges.filter((e) => e.kind === "ink").reduce((n, e) => n + e.len, 0);
  return { points, inkLength, trailLength: chainLength(points), start: s, end: at, jumps: edges.filter((e) => e.kind === "jump").length };
}

// ───────────────────────── geometría ─────────────────────────

function smooth(points, passes = 2) {
  let pts = points;
  for (let p = 0; p < passes; p++) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      out.push([(pts[i - 1][0] + 2 * pts[i][0] + pts[i + 1][0]) / 4, (pts[i - 1][1] + 2 * pts[i][1] + pts[i + 1][1]) / 4]);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

function rdp(points, eps) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1e-9;
    let maxD = -1, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      const d = len < 1e-6 ? Math.hypot(px - ax, py - ay) : Math.abs(dx * (ay - py) - (ax - px) * dy) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > eps) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const f1 = (v) => Math.round(v).toString();

/** Catmull-Rom → cúbicas. */
function toCubicPath(points, closed = false) {
  const n = points.length;
  if (n === 0) return "";
  const P = (i) => (closed ? points[((i % n) + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${f1(points[0][0])} ${f1(points[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return closed ? d + " Z" : d;
}

// ───────────────────────── rellenos ─────────────────────────

function traceContour(mask, w, h, start) {
  // Moore neighbour tracing (sentido horario) sobre la región 1 de `mask`.
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x] === 1;
  const sx = start % w, sy = (start - sx) / w;
  const contour = [[sx, sy]];
  let cx = sx, cy = sy;
  let dir = 0; // el primer píxel es el más alto a la izquierda: "llegamos desde el oeste" y giramos en sentido horario
  let first = null;
  for (let guard = 0; guard < w * h * 2; guard++) {
    let found = false;
    for (let k = 0; k < 8; k++) {
      const nd = (dir + 5 + k) % 8; // empieza dos pasos a la izquierda de la dirección previa
      const nx = cx + N8[nd][0], ny = cy + N8[nd][1];
      if (inside(nx, ny)) {
        if (first === null) first = nd;
        else if (cx === sx && cy === sy && nd === first && contour.length > 2) return contour;
        cx = nx; cy = ny; dir = nd;
        contour.push([cx, cy]);
        found = true;
        break;
      }
    }
    if (!found) return contour;
    if (contour.length > 200000) return contour;
  }
  return contour;
}

function erode(bin, w, h) {
  const inv = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) inv[i] = bin[i] ? 0 : 1;
  const d = dilate(inv, w, h);
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = d[i] ? 0 : 1;
  for (let x = 0; x < w; x++) out[x] = out[(h - 1) * w + x] = 0;
  for (let y = 0; y < h; y++) out[y * w] = out[y * w + w - 1] = 0;
  return out;
}

/** Cierre morfológico: tapa huecos de hasta 2·r px para que las formas casi cerradas cuenten como cerradas. */
function close(bin, w, h, r) {
  let img = bin;
  for (let i = 0; i < r; i++) img = dilate(img, w, h);
  for (let i = 0; i < r; i++) img = erode(img, w, h);
  return img;
}

function extractFills(binDilated, w, h) {
  const closed = close(binDilated, w, h, CLOSE_RADIUS);
  const bg = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) bg[i] = closed[i] ? 0 : 1;
  const { labels, sizes } = label(bg, w, h, false);
  const touchesBorder = new Uint8Array(sizes.length);
  for (let x = 0; x < w; x++) { if (labels[x] >= 0) touchesBorder[labels[x]] = 1; if (labels[(h - 1) * w + x] >= 0) touchesBorder[labels[(h - 1) * w + x]] = 1; }
  for (let y = 0; y < h; y++) { if (labels[y * w] >= 0) touchesBorder[labels[y * w]] = 1; if (labels[y * w + w - 1] >= 0) touchesBorder[labels[y * w + w - 1]] = 1; }
  if (process.env.TRACE_DEBUG) {
    const all = sizes.map((size, id) => ({ id, size, border: !!touchesBorder[id] })).sort((a, b) => b.size - a.size).slice(0, 10);
    console.log("huecos:", all.map((c) => `${c.size}${c.border ? "B" : ""}`).join(" "));
  }
  const candidates = sizes
    .map((size, id) => ({ id, size }))
    .filter((c) => !touchesBorder[c.id] && c.size > w * h * 0.0025 && c.size < w * h * 0.45)
    .sort((a, b) => b.size - a.size)
    .slice(0, MAX_FILLS);
  const fills = [];
  candidates.forEach((c, rank) => {
    const mask = new Uint8Array(w * h);
    let start = -1;
    for (let i = 0; i < w * h; i++) if (labels[i] === c.id) { mask[i] = 1; if (start < 0) start = i; }
    let contour = traceContour(mask, w, h, start);
    const raw = contour.length;
    contour = rdp(smooth(contour, 1), FILL_EPS);
    if (process.env.TRACE_DEBUG) console.log(`  hueco ${c.size}px: contorno ${raw} → ${contour.length} puntos`);
    if (contour.length < 4) return;
    fills.push({ d: toCubicPath(contour, true), color: FILL_COLORS[rank % FILL_COLORS.length] });
  });
  return fills;
}

// ───────────────────────── salida ─────────────────────────

const camel = (name) => name.replace(/[^a-z0-9]+([a-z0-9])/gi, (_, c) => c.toUpperCase()).replace(/^[^a-z_]/i, "_$&");

function writeFigure(name, source, stroke, fills, stats) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const body = `import { svgFigure } from "../svg-figure";

/**
 * Figura "${name}". Generada desde ${source.replace(/\\/g, "/")} con
 * scripts/trace-figure.mjs (${stats.segments} curvas, ${stats.jumps} saltos,
 * ${Math.round((stats.trailLength / stats.inkLength) * 100)} % de recorrido respecto al trazo). No editar a mano.
 */
export const ${camel(name)} = svgFigure({
  stroke:
    "${stroke}",
  fills: [
${fills.map((f) => `    { d: "${f.d}", color: "${f.color}" },`).join("\n")}
  ],
});
`;
  fs.writeFileSync(path.join(OUT_DIR, `${name}.ts`), body);
}

function writeIndex() {
  const names = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""))
    .sort();
  const lines = [
    "/* Generado por scripts/trace-figure.mjs. No editar a mano. */",
    ...names.map((n) => `import { ${camel(n)} } from "./${n}";`),
    "",
    "export const importedFigures = {",
    ...names.map((n) => `  "${n}": ${camel(n)},`),
    "};",
    "",
  ];
  fs.writeFileSync(path.join(OUT_DIR, "index.ts"), lines.join("\n"));
  return names;
}

async function traceFile(file, debugDir) {
  const name = path.basename(file).replace(/\.[^.]+$/, "").toLowerCase();
  const { bin, w, h } = await loadBinary(file);
  const closed = removeSmall(dilate(bin, w, h), w, h, MIN_COMPONENT);
  const skel = thin(closed, w, h);
  let { nodes, edges } = buildGraph(skel, w, h);
  edges = prune(nodes, edges);
  edges = connectComponents(nodes, edges);
  const trail = eulerTrail(nodes, edges);
  const pts = rdp(smooth(trail.points), EPS);
  const stroke = toCubicPath(pts);
  const fills = extractFills(closed, w, h);
  const stats = { segments: pts.length - 1, jumps: trail.jumps, trailLength: trail.trailLength, inkLength: trail.inkLength };
  writeFigure(name, file, stroke, fills, stats);
  if (debugDir) {
    const colors = { "crema-dark": "#ebd2ad", "terracota-soft": "#f1c8a5", "salvia-soft": "#e1e7d9" };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#fff"/>${fills
      .map((f) => `<path d="${f.d}" fill="${colors[f.color]}"/>`)
      .join("")}<path d="${stroke}" fill="none" stroke="#2e1135" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="9" fill="#d56631"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="9" fill="#49624f"/></svg>`;
    fs.writeFileSync(path.join(debugDir, `${name}.svg`), svg);
  }
  console.log(
    `${name.padEnd(18)} ${String(stats.segments).padStart(4)} curvas · ${fills.length} rellenos · ${stats.jumps} saltos · recorrido ${Math.round((stats.trailLength / stats.inkLength) * 100)} % · ${w}x${h}`,
  );
}

const args = process.argv.slice(2);
const debugFlag = args.indexOf("--debug");
let debugDir = null;
if (debugFlag >= 0) {
  debugDir = args[debugFlag + 1];
  args.splice(debugFlag, 2);
  fs.mkdirSync(debugDir, { recursive: true });
}
if (!args.length) {
  console.error("Uso: node scripts/trace-figure.mjs <imagen.jpg|png> [...más] [--debug carpeta]");
  process.exit(1);
}
for (const file of args) await traceFile(file, debugDir);
const names = writeIndex();
console.log(`index.ts con ${names.length} figuras: ${names.join(", ")}`);
