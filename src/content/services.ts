/**
 * Datos iniciales de las líneas de servicio (secciones 2, 3 y 6 del brief).
 * Se cargan una sola vez en la base de datos al primer arranque (ver src/cms/seed.ts).
 * Después, la fuente de verdad es el panel: /admin → Agenda → Servicios.
 */

export type ServiceLine = "acompanamiento" | "clases-de-ingles";
export type Accent = "terracota" | "salvia";

export function accentForLine(line: ServiceLine): Accent {
  return line === "acompanamiento" ? "terracota" : "salvia";
}

export function hrefForService(line: ServiceLine, slug: string): string {
  return line === "acompanamiento" ? `/acompanamiento/${slug}` : "/clases-de-ingles";
}

export interface ServiceSeed {
  slug: string;
  line: ServiceLine;
  name: string;
  shortName: string;
  audience: string;
  summary: string;
  valueProposition: string;
  includes: string[];
  sessionsLabel: string;
  format: string;
  durationMinutes: number;
  priceCop: number | null;
  order: number;
}

export const serviceSeeds: ServiceSeed[] = [
  {
    slug: "adaptacion-escolar",
    line: "acompanamiento",
    name: "Acompañamiento en adaptación escolar",
    shortName: "Adaptación escolar",
    audience: "Familias con niños de 2 a 6 años",
    summary:
      "Para el ingreso al jardín, el cambio de colegio o esas mañanas en que la despedida se vuelve difícil.",
    valueProposition:
      "Acompaño a familias de niños de 2 a 6 años en el proceso de adaptación o cambio de colegio, con estrategias prácticas para la ansiedad de separación y la transición escolar.",
    includes: [
      "Lectura de la situación de tu hijo o hija y de la dinámica familiar",
      "Estrategias concretas para las despedidas y la rutina de entrada",
      "Plan de transición ajustado a la edad y al colegio",
      "Seguimiento entre sesiones por mensaje",
    ],
    sessionsLabel: "3 sesiones individuales de 45 a 60 minutos",
    format: "Por videollamada",
    durationMinutes: 60,
    priceCop: null,
    order: 1,
  },
  {
    slug: "bilinguismo-temprano",
    line: "acompanamiento",
    name: "Acompañamiento en bilingüismo temprano",
    shortName: "Bilingüismo temprano",
    audience: "Padres y madres de niños en primera infancia",
    summary:
      "Para apoyar el inglés desde casa sin saber inglés perfecto y sin convertir el juego en tarea.",
    valueProposition:
      "Ayudo a padres a apoyar el desarrollo del inglés en casa desde la primera infancia, con estrategias de estimulación basadas en metodologías de aula como CLIL y TPR.",
    includes: [
      "Diagnóstico de la exposición al inglés que ya existe en casa",
      "Rutinas y juegos en inglés adaptados a la edad",
      "Guía para elegir canciones, cuentos y materiales",
      "Ajustes entre sesiones según cómo responde tu hijo o hija",
    ],
    sessionsLabel: "3 a 4 sesiones espaciadas cada 1 a 2 semanas",
    format: "Por videollamada",
    durationMinutes: 60,
    priceCop: null,
    order: 2,
  },
  {
    slug: "clases-de-ingles",
    line: "clases-de-ingles",
    name: "Clases de inglés personalizadas",
    shortName: "Clases de inglés",
    audience: "Niños de primera infancia y niños mayores",
    summary:
      "Clases 1:1 por videollamada, diseñadas para la etapa de cada niño: juego y movimiento en los primeros años, múltiples caminos de aprendizaje después.",
    valueProposition:
      "Clases uno a uno por videollamada. En primera infancia el enfoque es TPR y CLIL a través del juego; con niños mayores pesan más los principios del Diseño Universal de Aprendizaje y la ventana favorable que ofrece la neuroplasticidad para un segundo idioma.",
    includes: [
      "Sesión inicial para conocer intereses, nivel y forma de aprender",
      "Plan de clases personalizado por etapa",
      "Materiales y actividades para continuar en casa",
      "Reporte sencillo de avances para la familia",
    ],
    sessionsLabel: "Clases individuales, frecuencia a convenir",
    format: "Por videollamada",
    durationMinutes: 45,
    priceCop: null,
    order: 3,
  },
];
