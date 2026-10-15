/**
 * Figuras de un solo trazo para la línea que recorre la página.
 *
 * Cada figura se define en su propio sistema de coordenadas (la caja `box`).
 * `stroke` es la secuencia de segmentos que la línea dibuja desde `entry`
 * hasta `exit`; `fills` son formas cerradas que aparecen detrás cuando la
 * línea pasa por ahí. Solo se usan segmentos cúbicos (C) y rectos (L) para que
 * escalarlas y moverlas sea una simple transformación de puntos.
 */

import { importedFigures } from "./figures";

export interface Point {
  x: number;
  y: number;
}

export type Segment = { c: "C"; p: number[] } | { c: "L"; p: number[] };

export interface Fill {
  /** Segmentos desde `from`, cerrados automáticamente. */
  from: Point;
  segments: Segment[];
  color: "terracota-soft" | "salvia-soft" | "salvia" | "crema-dark" | "crema";
}

export interface Figure {
  box: { width: number; height: number };
  entry: Point;
  /** Sin `exit`, la línea termina en esta figura. */
  exit?: Point;
  stroke: Segment[];
  fills: Fill[];
}

const C = (...p: number[]): Segment => ({ c: "C", p });
const L = (x: number, y: number): Segment => ({ c: "L", p: [x, y] });

const K = 0.5523;

/** Círculo en cuatro cúbicas, en sentido horario, empezando y terminando arriba. */
function circle(cx: number, cy: number, r: number): Segment[] {
  const k = K * r;
  return [
    C(cx + k, cy - r, cx + r, cy - k, cx + r, cy),
    C(cx + r, cy + k, cx + k, cy + r, cx, cy + r),
    C(cx - k, cy + r, cx - r, cy + k, cx - r, cy),
    C(cx - r, cy - k, cx - k, cy - r, cx, cy - r),
  ];
}

/** Lóbulo izquierdo del corazón: de la hendidura superior a la punta inferior. */
function heartLeft(x: number, y: number, s: number): Segment[] {
  return [
    C(x - 0.1 * s, y - 0.62 * s, x - 0.56 * s, y - 0.5 * s, x - 0.5 * s, y - 0.12 * s),
    C(x - 0.45 * s, y + 0.12 * s, x - 0.2 * s, y + 0.3 * s, x, y + 0.46 * s),
  ];
}

/** Lóbulo derecho del corazón: de la punta inferior a la hendidura superior. */
function heartRightUp(x: number, y: number, s: number): Segment[] {
  return [
    C(x + 0.2 * s, y + 0.3 * s, x + 0.45 * s, y + 0.12 * s, x + 0.5 * s, y - 0.12 * s),
    C(x + 0.56 * s, y - 0.5 * s, x + 0.1 * s, y - 0.62 * s, x, y - 0.26 * s),
  ];
}

/** Lóbulo derecho recorrido hacia abajo (repasa el mismo trazo para salir por la punta). */
function heartRightDown(x: number, y: number, s: number): Segment[] {
  return [
    C(x + 0.1 * s, y - 0.62 * s, x + 0.56 * s, y - 0.5 * s, x + 0.5 * s, y - 0.12 * s),
    C(x + 0.45 * s, y + 0.12 * s, x + 0.2 * s, y + 0.3 * s, x, y + 0.46 * s),
  ];
}

function heartFill(x: number, y: number, s: number, color: Fill["color"]): Fill {
  return {
    from: { x, y: y - 0.26 * s },
    segments: [...heartLeft(x, y, s), ...heartRightUp(x, y, s)],
    color,
  };
}

/* ------------------------------------------------------------------ */
/* Padre o madre abrazando a su hijo o hija                             */
/* ------------------------------------------------------------------ */
const parentChild: Figure = {
  box: { width: 220, height: 260 },
  entry: { x: 96, y: 0 },
  exit: { x: 120, y: 260 },
  stroke: [
    // Entra por arriba hasta la cabeza del adulto y la rodea.
    L(96, 24),
    ...circle(96, 56, 32),
    // Cuello y hombro derecho, espalda y base.
    C(112, 36, 150, 80, 160, 130),
    C(172, 170, 182, 210, 170, 244),
    C(160, 258, 100, 258, 66, 246),
    // Brazo que envuelve al niño desde la izquierda.
    C(28, 232, 18, 186, 44, 166),
    C(60, 154, 84, 158, 102, 172),
    // Cabeza del niño, apoyada en el pecho del adulto.
    C(112, 160, 122, 142, 136, 134),
    ...circle(136, 158, 24),
    // Brazos del niño rodeando al adulto y salida.
    C(118, 150, 102, 162, 98, 178),
    C(112, 190, 150, 196, 150, 214),
    C(150, 232, 130, 248, 120, 260),
  ],
  fills: [
    {
      from: { x: 96, y: 88 },
      color: "terracota-soft",
      segments: [
        C(112, 36, 150, 80, 160, 130),
        C(172, 170, 182, 210, 170, 244),
        C(160, 258, 100, 258, 66, 246),
        C(28, 232, 18, 186, 44, 166),
        C(56, 140, 70, 112, 80, 92),
      ],
    },
    { from: { x: 96, y: 24 }, color: "crema-dark", segments: circle(96, 56, 32) },
    { from: { x: 136, y: 134 }, color: "crema-dark", segments: circle(136, 158, 24) },
    {
      from: { x: 102, y: 172 },
      color: "salvia-soft",
      segments: [
        C(118, 184, 150, 196, 150, 214),
        C(150, 232, 130, 248, 120, 260),
        C(100, 236, 92, 200, 102, 172),
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Libro abierto                                                        */
/* ------------------------------------------------------------------ */
const book: Figure = {
  box: { width: 200, height: 160 },
  entry: { x: 100, y: 0 },
  exit: { x: 100, y: 160 },
  stroke: [
    L(100, 34),
    // Página izquierda.
    C(82, 22, 58, 20, 42, 26),
    L(42, 100),
    C(58, 96, 82, 98, 100, 112),
    // Página derecha.
    C(118, 98, 142, 96, 158, 100),
    L(158, 26),
    C(142, 20, 118, 22, 100, 34),
    // Lomo y salida.
    L(100, 112),
    L(100, 160),
  ],
  fills: [
    {
      from: { x: 100, y: 34 },
      color: "crema-dark",
      segments: [C(82, 22, 58, 20, 42, 26), L(42, 100), C(58, 96, 82, 98, 100, 112)],
    },
    {
      from: { x: 100, y: 34 },
      color: "crema-dark",
      segments: [C(118, 22, 142, 20, 158, 26), L(158, 100), C(142, 96, 118, 98, 100, 112)],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Corazón de paso: se dibuja en una transición y la línea sigue       */
/* ------------------------------------------------------------------ */
const heartPass: Figure = (() => {
  const x = 60;
  const y = 60;
  const s = 70;
  return {
    box: { width: 120, height: 140 },
    entry: { x: 60, y: 0 },
    exit: { x: 60, y: 140 },
    stroke: [
      L(x, y - 0.26 * s),
      ...heartLeft(x, y, s),
      ...heartRightUp(x, y, s),
      ...heartRightDown(x, y, s),
      L(60, 140),
    ],
    fills: [heartFill(x, y, s, "terracota-soft")],
  };
})();

/* ------------------------------------------------------------------ */
/* Persona con globo de diálogo                                         */
/* ------------------------------------------------------------------ */
const personSpeech: Figure = {
  box: { width: 230, height: 250 },
  entry: { x: 90, y: 0 },
  exit: { x: 110, y: 250 },
  stroke: [
    L(90, 44),
    ...circle(90, 72, 28),
    // Hombro izquierdo, costado y base del cuerpo.
    C(62, 52, 40, 96, 38, 136),
    L(38, 206),
    C(38, 220, 150, 220, 150, 206),
    L(150, 136),
    C(148, 96, 128, 56, 114, 62),
    // Cola y globo de diálogo.
    C(120, 54, 126, 46, 132, 40),
    C(128, 16, 160, 2, 184, 8),
    C(214, 16, 222, 46, 196, 58),
    C(176, 68, 146, 64, 136, 50),
    C(134, 46, 133, 43, 132, 40),
    // Salida cruzando el cuerpo.
    C(140, 120, 116, 200, 110, 250),
  ],
  fills: [
    { from: { x: 90, y: 44 }, color: "crema-dark", segments: circle(90, 72, 28) },
    {
      from: { x: 90, y: 100 },
      color: "terracota-soft",
      segments: [
        C(62, 52, 40, 96, 38, 136),
        L(38, 206),
        C(38, 220, 150, 220, 150, 206),
        L(150, 136),
        C(148, 96, 128, 56, 114, 62),
        C(104, 90, 96, 100, 90, 100),
      ],
    },
    {
      from: { x: 132, y: 40 },
      color: "salvia-soft",
      segments: [C(128, 16, 160, 2, 184, 8), C(214, 16, 222, 46, 196, 58), C(176, 68, 146, 64, 136, 50)],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Manos que cuidan un brote                                            */
/* ------------------------------------------------------------------ */
const handsSprout: Figure = {
  box: { width: 220, height: 210 },
  entry: { x: 110, y: 0 },
  exit: { x: 110, y: 210 },
  stroke: [
    L(110, 36),
    // Hoja izquierda.
    C(78, 24, 58, 48, 84, 72),
    C(100, 78, 110, 60, 110, 46),
    // Hoja derecha.
    C(110, 58, 122, 82, 146, 70),
    C(168, 58, 148, 22, 112, 38),
    // Tallo.
    L(110, 112),
    // Mano izquierda, de la muñeca al centro.
    C(90, 102, 50, 98, 36, 118),
    C(22, 142, 60, 176, 110, 180),
    // Mano derecha, del centro a la muñeca y vuelta al tallo.
    C(160, 176, 198, 142, 184, 118),
    C(170, 98, 130, 102, 110, 112),
    // Salida.
    L(110, 210),
  ],
  fills: [
    {
      from: { x: 110, y: 46 },
      color: "salvia-soft",
      segments: [C(110, 60, 100, 78, 84, 72), C(58, 48, 78, 24, 110, 36), C(110, 40, 110, 42, 110, 46)],
    },
    {
      from: { x: 112, y: 38 },
      color: "salvia-soft",
      segments: [C(148, 22, 168, 58, 146, 70), C(122, 82, 110, 58, 110, 46), C(110, 42, 111, 40, 112, 38)],
    },
    {
      from: { x: 110, y: 112 },
      color: "terracota-soft",
      segments: [
        C(90, 102, 50, 98, 36, 118),
        C(22, 142, 60, 176, 110, 180),
        C(160, 176, 198, 142, 184, 118),
        C(170, 98, 130, 102, 110, 112),
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Marco para la foto                                                   */
/* ------------------------------------------------------------------ */
const frame: Figure = {
  box: { width: 240, height: 290 },
  entry: { x: 120, y: 0 },
  exit: { x: 210, y: 290 },
  stroke: [
    // Cuelga de la línea; recorre el marco y sale por la esquina inferior derecha.
    L(120, 24),
    C(100, 24, 40, 24, 32, 32),
    L(32, 264),
    C(32, 272, 200, 272, 208, 264),
    L(208, 32),
    C(200, 24, 140, 24, 120, 24),
    L(208, 28),
    L(208, 264),
    L(210, 290),
  ],
  fills: [
    {
      from: { x: 48, y: 44 },
      color: "crema-dark",
      segments: [L(192, 44), L(192, 252), L(48, 252)],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Corazón final, relleno de salvia. La línea termina aquí.            */
/* ------------------------------------------------------------------ */
const heartEnd: Figure = (() => {
  const x = 60;
  const y = 58;
  const s = 72;
  return {
    box: { width: 120, height: 110 },
    entry: { x: 60, y: 0 },
    stroke: [L(x, y - 0.26 * s), ...heartLeft(x, y, s), ...heartRightUp(x, y, s)],
    fills: [heartFill(x, y, s, "salvia")],
  };
})();

/* ------------------------------------------------------------------ */
/* Espiral (disponible para otras páginas)                              */
/* ------------------------------------------------------------------ */
const spiral: Figure = (() => {
  const cx = 100;
  const cy = 100;
  const segments: Segment[] = [L(cx, cy - 80)];
  let r = 80;
  let angle = -Math.PI / 2;
  for (let i = 0; i < 9; i++) {
    const next = angle + Math.PI / 2;
    const r2 = r - 8;
    const a1 = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    const a2 = { x: cx + r2 * Math.cos(next), y: cy + r2 * Math.sin(next) };
    const k = 0.5523;
    const c1 = { x: a1.x - k * r * Math.sin(angle), y: a1.y + k * r * Math.cos(angle) };
    const c2 = { x: a2.x + k * r2 * Math.sin(next), y: a2.y - k * r2 * Math.cos(next) };
    segments.push(C(c1.x, c1.y, c2.x, c2.y, a2.x, a2.y));
    angle = next;
    r = r2;
  }
  segments.push(C(cx + 30, cy + 40, cx + 10, cy + 150, cx, cy + 200));
  return {
    box: { width: 200, height: 300 },
    entry: { x: cx, y: 0 },
    exit: { x: cx, y: 300 },
    stroke: segments,
    fills: [{ from: { x: cx, y: cy - 80 }, color: "crema-dark", segments: circle(cx, cy, 80) }],
  };
})();

/* ------------------------------------------------------------------ */
/* Corazón y libro unidos                                               */
/* ------------------------------------------------------------------ */
const heartBook: Figure = (() => {
  const hx = 100;
  const hy = 62;
  const s = 66;
  return {
    box: { width: 200, height: 200 },
    entry: { x: 100, y: 0 },
    exit: { x: 100, y: 200 },
    stroke: [
      L(hx, hy - 0.26 * s),
      ...heartLeft(hx, hy, s),
      ...heartRightUp(hx, hy, s),
      ...heartRightDown(hx, hy, s),
      L(100, 105),
      C(82, 94, 60, 92, 46, 97),
      L(46, 158),
      C(60, 154, 82, 156, 100, 168),
      C(118, 156, 140, 154, 154, 158),
      L(154, 97),
      C(140, 92, 118, 94, 100, 105),
      L(100, 168),
      L(100, 200),
    ],
    fills: [
      heartFill(hx, hy, s, "terracota-soft"),
      {
        from: { x: 100, y: 105 },
        color: "crema-dark",
        segments: [C(82, 94, 60, 92, 46, 97), L(46, 158), C(60, 154, 82, 156, 100, 168)],
      },
      {
        from: { x: 100, y: 105 },
        color: "crema-dark",
        segments: [C(118, 94, 140, 92, 154, 97), L(154, 158), C(140, 154, 118, 156, 100, 168)],
      },
    ],
  };
})();

/* ------------------------------------------------------------------ */
/* Planeta con órbita                                                   */
/* ------------------------------------------------------------------ */
const planet: Figure = {
  box: { width: 200, height: 210 },
  entry: { x: 100, y: 0 },
  exit: { x: 100, y: 210 },
  stroke: [
    L(100, 30),
    ...circle(100, 100, 70),
    C(118, 42, 138, 62, 128, 84),
    C(120, 100, 140, 112, 132, 132),
    C(124, 150, 98, 146, 92, 126),
    C(86, 108, 68, 100, 76, 80),
    C(84, 62, 92, 46, 100, 30),
    C(72, 34, 52, 58, 58, 84),
    C(63, 104, 86, 104, 84, 84),
    C(82, 66, 72, 48, 100, 30),
    C(100 + K * 70, 30, 170, 100 - K * 70, 170, 100),
    C(190, 104, 198, 110, 198, 118),
    C(198, 135, 150, 148, 100, 148),
    C(50, 148, 2, 135, 2, 118),
    C(2, 101, 50, 88, 100, 88),
    C(150, 88, 198, 101, 198, 118),
    C(198, 160, 130, 190, 100, 210),
  ],
  fills: [
    { from: { x: 100, y: 30 }, color: "crema-dark", segments: circle(100, 100, 70) },
    {
      from: { x: 100, y: 30 },
      color: "salvia-soft",
      segments: [
        C(118, 42, 138, 62, 128, 84),
        C(120, 100, 140, 112, 132, 132),
        C(124, 150, 98, 146, 92, 126),
        C(86, 108, 68, 100, 76, 80),
        C(84, 62, 92, 46, 100, 30),
      ],
    },
    {
      from: { x: 100, y: 30 },
      color: "salvia-soft",
      segments: [C(72, 34, 52, 58, 58, 84), C(63, 104, 86, 104, 84, 84), C(82, 66, 72, 48, 100, 30)],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Pequeño rizo que hace de mano o de nudo en la línea                  */
/* ------------------------------------------------------------------ */
function curl(x: number, y: number, r = 6): Segment[] {
  return [
    C(x + r * 0.8, y - r, x + r * 1.8, y - r * 0.4, x + r * 1.2, y + r * 0.5),
    C(x + r * 0.6, y + r * 1.3, x - r * 0.8, y + r * 0.8, x, y),
  ];
}

/* ------------------------------------------------------------------ */
/* Familia tomada de la mano: adulto, dos niños y adulta                */
/* Entra por la izquierda y sale por abajo a la derecha.                */
/* ------------------------------------------------------------------ */
const family: Figure = {
  box: { width: 440, height: 250 },
  entry: { x: 0, y: 232 },
  exit: { x: 352, y: 232 },
  stroke: [
    // Suelo hasta el primer adulto.
    L(60, 232),
    // Costado izquierdo, cabeza y hombro derecho.
    C(56, 180, 58, 130, 66, 104),
    C(62, 92, 66, 62, 85, 62),
    C(104, 62, 108, 92, 104, 104),
    // Costado derecho hasta el suelo, base y línea de las piernas.
    C(112, 140, 114, 190, 108, 232),
    C(100, 236, 68, 236, 60, 232),
    L(62, 230),
    C(74, 215, 82, 190, 85, 165),
    // Brazo hasta la mano, y mano del primer niño.
    C(98, 162, 124, 158, 136, 156),
    ...curl(136, 156),
    C(150, 160, 170, 166, 190, 160),
    // Primer niño: cabeza, costado derecho, base, costado izquierdo.
    C(186, 150, 190, 136, 200, 136),
    C(212, 136, 214, 152, 208, 160),
    C(216, 172, 218, 204, 216, 230),
    C(214, 236, 186, 236, 184, 230),
    C(182, 204, 184, 172, 190, 160),
    // Vuelve por el hombro derecho hacia la mano compartida.
    C(196, 158, 204, 158, 208, 160),
    C(222, 168, 240, 182, 250, 186),
    ...curl(250, 186),
    // Segundo niño.
    C(262, 186, 280, 180, 290, 168),
    C(286, 158, 290, 144, 300, 144),
    C(312, 144, 314, 160, 308, 168),
    C(316, 180, 318, 206, 316, 230),
    C(314, 236, 286, 236, 284, 230),
    C(282, 206, 284, 180, 290, 168),
    C(296, 166, 304, 166, 308, 168),
    // Brazo de la adulta.
    C(318, 166, 338, 160, 346, 164),
    ...curl(346, 164),
    // Adulta: lado izquierdo del vestido, cabeza, lado derecho y base.
    C(352, 190, 352, 212, 352, 232),
    C(352, 212, 352, 190, 350, 165),
    C(356, 145, 366, 124, 376, 104),
    C(372, 92, 376, 62, 395, 62),
    C(414, 62, 418, 92, 414, 104),
    C(424, 140, 434, 190, 438, 232),
    C(410, 238, 380, 238, 352, 232),
  ],
  fills: [
    { from: { x: 85, y: 62 }, color: "crema-dark", segments: circle(85, 83, 21) },
    { from: { x: 200, y: 136 }, color: "crema-dark", segments: circle(200, 148, 12) },
    { from: { x: 300, y: 144 }, color: "crema-dark", segments: circle(300, 156, 12) },
    { from: { x: 395, y: 62 }, color: "crema-dark", segments: circle(395, 83, 21) },
    {
      from: { x: 66, y: 104 },
      color: "terracota-soft",
      segments: [C(112, 140, 114, 190, 108, 232), C(100, 236, 68, 236, 60, 232), C(58, 190, 60, 140, 66, 104)],
    },
    {
      from: { x: 376, y: 104 },
      color: "salvia-soft",
      segments: [L(414, 104), C(424, 140, 434, 190, 438, 232), C(410, 238, 380, 238, 352, 232), C(356, 190, 366, 140, 376, 104)],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Manos que sostienen una planta                                       */
/* Entra por la izquierda y sale por la derecha, a media altura.        */
/* ------------------------------------------------------------------ */
const handsPlant: Figure = {
  box: { width: 340, height: 250 },
  entry: { x: 0, y: 150 },
  exit: { x: 340, y: 150 },
  stroke: [
    // Ola de entrada hasta la muñeca izquierda.
    C(40, 134, 70, 166, 100, 142),
    // Dorso de la mano izquierda y palma.
    C(94, 164, 98, 202, 118, 216),
    C(134, 226, 152, 226, 166, 214),
    // Dedos de la mano izquierda, curvados hacia el centro.
    C(154, 204, 150, 190, 160, 186),
    C(168, 184, 172, 194, 168, 202),
    C(176, 206, 180, 198, 172, 190),
    // Tallo hacia arriba.
    C(174, 170, 172, 140, 172, 104),
    // Hoja izquierda.
    C(150, 100, 132, 76, 148, 62),
    C(164, 54, 172, 82, 172, 96),
    // Tallo y hoja derecha.
    L(172, 74),
    C(192, 76, 208, 58, 198, 42),
    C(188, 30, 172, 46, 172, 64),
    // Hoja superior.
    C(166, 44, 168, 22, 180, 18),
    C(192, 16, 184, 40, 174, 54),
    // De vuelta por el tallo hasta las manos.
    L(172, 104),
    L(172, 196),
    // Dedos de la mano derecha y palma.
    C(180, 206, 188, 204, 184, 196),
    C(178, 188, 186, 180, 194, 186),
    C(200, 192, 194, 206, 182, 212),
    C(196, 224, 218, 226, 230, 214),
    // Dorso de la mano derecha y ola de salida.
    C(250, 200, 250, 162, 240, 142),
    C(270, 166, 300, 134, 340, 150),
  ],
  fills: [
    {
      from: { x: 100, y: 142 },
      color: "terracota-soft",
      segments: [C(94, 164, 98, 202, 118, 216), C(134, 226, 152, 226, 166, 214), C(170, 200, 172, 180, 172, 170), C(150, 160, 120, 150, 100, 142)],
    },
    {
      from: { x: 240, y: 142 },
      color: "terracota-soft",
      segments: [C(250, 162, 250, 200, 230, 214), C(218, 226, 196, 224, 182, 212), C(176, 198, 172, 180, 172, 170), C(190, 158, 220, 150, 240, 142)],
    },
    { from: { x: 172, y: 96 }, color: "salvia-soft", segments: [C(172, 82, 164, 54, 148, 62), C(132, 76, 150, 100, 172, 104)] },
    { from: { x: 172, y: 64 }, color: "salvia-soft", segments: [C(172, 46, 188, 30, 198, 42), C(208, 58, 192, 76, 172, 74)] },
    { from: { x: 174, y: 54 }, color: "salvia-soft", segments: [C(184, 40, 192, 16, 180, 18), C(168, 22, 166, 44, 174, 54)] },
  ],
};

/* ------------------------------------------------------------------ */
/* Manos levantadas con corazones: dos adultas y dos de niños           */
/* Entra por abajo a la izquierda y sale por abajo a la derecha.        */
/* ------------------------------------------------------------------ */
function raisedHand(x: number, w: number, top: number, base: number): { stroke: Segment[]; fills: Fill[] } {
  const palmTop = top + w * 0.55;
  const fw = w / 5;
  const stroke: Segment[] = [];
  // Lado izquierdo del brazo y pulgar.
  stroke.push(L(x, base));
  stroke.push(C(x - 2, base - (base - palmTop) * 0.5, x - 4, palmTop + w * 0.3, x - w * 0.12, palmTop + w * 0.12));
  stroke.push(C(x - w * 0.2, palmTop - w * 0.1, x + fw * 0.3, palmTop - w * 0.06, x + fw * 0.5, palmTop));
  // Cuatro dedos.
  for (let i = 0; i < 4; i++) {
    const fx = x + fw * 0.5 + fw * i;
    const tipY = top + (i === 0 || i === 3 ? w * 0.12 : 0);
    stroke.push(C(fx, palmTop - (palmTop - tipY) * 0.6, fx + fw * 0.15, tipY, fx + fw * 0.5, tipY));
    stroke.push(C(fx + fw * 0.85, tipY, fx + fw, palmTop - (palmTop - tipY) * 0.6, fx + fw, palmTop));
  }
  // Lado derecho hasta la base, y corazón en la palma.
  stroke.push(C(x + w + 2, palmTop + w * 0.3, x + w, base - (base - palmTop) * 0.5, x + w, base));
  const hx = x + w / 2;
  const hy = palmTop + w * 0.42;
  const s = w * 0.42;
  stroke.push(C(x + w - 6, base - 20, hx + s * 0.1, hy + s * 0.2, hx, hy - 0.26 * s));
  stroke.push(...heartLeft(hx, hy, s));
  stroke.push(...heartRightUp(hx, hy, s));
  stroke.push(C(hx + s * 0.2, hy + s * 0.1, x + w - 4, base - 16, x + w, base));
  const fills: Fill[] = [
    {
      from: { x, y: base },
      color: "crema-dark",
      segments: [
        C(x - 2, base - (base - palmTop) * 0.5, x - 4, palmTop + w * 0.3, x - w * 0.12, palmTop + w * 0.12),
        C(x - w * 0.2, palmTop - w * 0.1, x + fw * 0.3, palmTop - w * 0.06, x + fw * 0.5, palmTop),
        ...Array.from({ length: 4 }, (_, i) => {
          const fx = x + fw * 0.5 + fw * i;
          const tipY = top + (i === 0 || i === 3 ? w * 0.12 : 0);
          return [
            C(fx, palmTop - (palmTop - tipY) * 0.6, fx + fw * 0.15, tipY, fx + fw * 0.5, tipY),
            C(fx + fw * 0.85, tipY, fx + fw, palmTop - (palmTop - tipY) * 0.6, fx + fw, palmTop),
          ];
        }).flat(),
        C(x + w + 2, palmTop + w * 0.3, x + w, base - (base - palmTop) * 0.5, x + w, base),
      ],
    },
    heartFill(hx, hy, s, "terracota-soft"),
  ];
  return { stroke, fills };
}

const handsHearts: Figure = (() => {
  const base = 300;
  const hands = [
    raisedHand(70, 120, 110, base),
    raisedHand(215, 54, 220, base),
    raisedHand(290, 64, 196, base),
    raisedHand(380, 124, 40, base),
  ];
  return {
    box: { width: 520, height: 330 },
    entry: { x: 0, y: base },
    exit: { x: 520, y: base },
    stroke: [...hands.flatMap((h) => h.stroke), L(520, base)],
    fills: hands.flatMap((h) => h.fills),
  };
})();

export const figures = {
  ...importedFigures,
  family,
  "hands-plant": handsPlant,
  "hands-hearts": handsHearts,
  "parent-child": parentChild,
  book,
  "heart-pass": heartPass,
  "person-speech": personSpeech,
  "hands-sprout": handsSprout,
  frame,
  "heart-end": heartEnd,
  "heart-book": heartBook,
  planet,
  spiral,
} as const;

export type FigureName = keyof typeof figures;

/** Transforma segmentos locales a coordenadas de página y los serializa. */
export function segmentsToPath(segments: Segment[], scale: number, offset: Point) {
  const tx = (x: number) => (offset.x + x * scale).toFixed(1);
  const ty = (y: number) => (offset.y + y * scale).toFixed(1);
  return segments
    .map((s) => {
      if (s.c === "L") return ` L ${tx(s.p[0])} ${ty(s.p[1])}`;
      const [x1, y1, x2, y2, x, y] = s.p;
      return ` C ${tx(x1)} ${ty(y1)} ${tx(x2)} ${ty(y2)} ${tx(x)} ${ty(y)}`;
    })
    .join("");
}

export function fillToPath(fill: Fill, scale: number, offset: Point) {
  const start = `M ${(offset.x + fill.from.x * scale).toFixed(1)} ${(offset.y + fill.from.y * scale).toFixed(1)}`;
  return `${start}${segmentsToPath(fill.segments, scale, offset)} Z`;
}
