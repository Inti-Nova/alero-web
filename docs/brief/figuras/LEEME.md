# Figuras de la línea animada

Aquí van las ilustraciones de un solo trazo que la línea dibuja al bajar.

## Cómo generarlas con IA

Prompt base (en inglés suele dar mejor resultado):

> continuous one line drawing of [TEMA], minimalist single stroke, thin uniform
> black line on pure white background, no shading, no fills, no text, the line
> enters from the left edge and exits at the right edge

Pide formato cuadrado o apaisado, la mayor resolución posible.

## Cómo vectorizarlas (Inkscape, gratuito)

1. Abrir el PNG en Inkscape.
2. Seleccionarlo y usar **Trayecto → Vectorizar mapa de bits** (Ctrl+Mayús+B).
3. Pestaña **Modo**: elegir **Trazado de línea central** (centerline). Aplicar.
4. Borrar la imagen original, dejar solo el trayecto.
5. Opcional: **Trayecto → Simplificar** (Ctrl+L) una o dos veces para suavizar.
6. **Archivo → Guardar como… → SVG plano**. Nombre: `nombre-de-la-figura.svg`.

Si el resultado tiene varios tramos sueltos no pasa nada: el importador los une.

## Qué hace el equipo con el SVG

El `d` del path se pega en `src/components/figures/<nombre>.ts` usando
`svgFigure(...)` de `src/components/svg-figure.ts`, y la figura queda disponible
para cualquier página con `data-line="<nombre>"`. Los rellenos suaves se agregan
como paths cerrados dentro del mismo SVG o a mano.
