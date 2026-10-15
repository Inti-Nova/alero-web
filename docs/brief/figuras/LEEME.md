# Figuras de la línea animada

Aquí van las ilustraciones de un solo trazo que la línea dibuja al bajar.
Flujo: pedir los prompts a Claude → generar en Leonardo AI → guardar el PNG en
esta carpeta → (opcional) vectorizar en Inkscape → el equipo las integra.

## 1. Qué figuras hacen falta

Cada archivo se nombra exactamente así (minúsculas, sin tildes, con guiones).

| Archivo | Qué dibuja la línea | Dónde va |
| --- | --- | --- |
| `familia.png` | Madre o padre abrazando a un niño pequeño, de pie, cercanos | Portada, junto al título |
| `libro.png` | Libro abierto con una hoja que se levanta | Portada, "¿Qué estás buscando hoy?" |
| `nino-hablando.png` | Niño o niña con un globo de diálogo (en el globo, un corazón o "hi") | Portada, clases de inglés |
| `manos-planta.png` | Dos manos en cuenco sosteniendo un brote con dos o tres hojas | Portada, "Cómo trabajamos" |
| `marco.png` | Marco de foto sencillo, ligeramente inclinado, con un gancho arriba | Portada, "Quién te acompaña" |
| `manos-corazones.png` | Dos manos abiertas de las que salen dos o tres corazones flotando | Portada, antes de "¿Hablamos?" |
| `casita.png` | Casita con techo a dos aguas, puerta y una ventana, y un árbol pequeño | Adaptación escolar |
| `globo-terraqueo.png` | Globo terráqueo sobre su pie, continentes muy simplificados | Bilingüismo temprano |
| `osito.png` | Osito de peluche sentado, brazos abiertos | Clases de primera infancia |
| `buho.png` | Búho posado en una rama, ojos grandes | Sobre mí |
| `calendario.png` | Hoja de calendario con una fecha marcada con un círculo | Agenda |
| `sobre.png` | Sobre de carta abierto con una hoja asomando y un corazón pequeño | Contacto |

Prioridad: primero las seis de la portada, luego el resto.

## 2. Cómo pedirle los prompts a Claude (copiar y pegar en un chat nuevo)

```text
Actúa como director de arte. Necesito prompts para Leonardo AI que generen
ilustraciones de UN SOLO TRAZO CONTINUO (continuous one line drawing), estilo
Lemonade.com, para el sitio web de una educadora de primera infancia. Las
ilustraciones se vectorizan y una línea animada las dibuja al hacer scroll,
así que deben cumplir esto sin excepción:

- Una sola línea negra, fina y de grosor uniforme, sin sombras, sin grises,
  sin degradados, sin color, sin texturas, sin texto, fondo blanco puro.
- La línea ENTRA por el borde izquierdo y SALE por el borde derecho, a media
  altura, como si fuera un hilo que atraviesa el dibujo.
- Un solo sujeto, grande y centrado, que ocupe el 70 % del lienzo. Formas
  simples y redondeadas, sin detalles pequeños (ojos, dedos o pelo se
  resuelven con uno o dos giros de la línea, nunca con rayitas).
- Debe dejar dos o tres zonas cerradas donde luego pondremos un relleno de
  color plano (por ejemplo: una hoja, un corazón, una página).
- Tono cálido y amable, ni clínico ni infantil.

Escribe un prompt en inglés por cada figura de esta lista, de 40 a 70
palabras, repitiendo en todos el mismo bloque de estilo al pie de la letra
para que queden consistentes. Añade un único prompt negativo común. Al final,
dame una lista de 5 cosas que revisar en cada imagen antes de aceptarla.

Figuras:
1. familia: madre o padre abrazando a un niño pequeño, de pie, cercanos
2. libro: libro abierto con una hoja que se levanta
3. nino-hablando: niño o niña con un globo de diálogo y un corazón dentro
4. manos-planta: dos manos en cuenco sosteniendo un brote con tres hojas
5. marco: marco de foto sencillo, un poco inclinado, colgado de un gancho
6. manos-corazones: dos manos abiertas de las que salen tres corazones
7. casita: casita con techo a dos aguas, puerta, ventana y un árbol pequeño
8. globo-terraqueo: globo terráqueo sobre su pie, continentes simplificados
9. osito: osito de peluche sentado con los brazos abiertos
10. buho: búho posado en una rama, ojos grandes
11. calendario: hoja de calendario con una fecha marcada con un círculo
12. sobre: sobre de carta abierto con una hoja asomando y un corazón pequeño
```

## 3. Cómo generarlas en Leonardo AI

- **Modelo**: Leonardo Phoenix o Kino XL. Si hay preset de estilo, usar
  *Line Art* o *Sketch (B&W)*.
- **Tamaño**: cuadrado 1:1 o apaisado 4:3, mínimo 1024 px de lado. Mejor 1536.
- **Prompt negativo** (pegar el que dé Claude; si no, este):
  `shading, gradient, grayscale fill, color, texture, cross-hatching, text,
  watermark, frame, border, background, multiple separate lines, broken line,
  thick and thin line variation, realistic, 3d, photo`
- **Guidance** entre 7 y 9. Generar 4 variaciones por figura y quedarse con la
  que tenga la línea más continua y limpia. No hace falta que sea perfecta: el
  importador une los tramos sueltos.
- Antes de descargar, pasar la elegida por el **Upscaler** de Leonardo (2x),
  que mejora mucho la vectorización.
- Descargar en **PNG**.

Qué revisar antes de aceptar una imagen:

1. Fondo blanco liso, sin manchas ni grises.
2. Una sola línea, grosor parejo, sin sombras ni rellenos.
3. Los extremos tocan el borde izquierdo y el derecho.
4. El dibujo se entiende a 200 px de ancho (así se verá en el sitio).
5. Hay dos o tres zonas cerradas para los rellenos de color.

## 4. Dónde ponerlas

En esta misma carpeta: `docs/brief/figuras/<nombre>.png`, con el nombre exacto
de la tabla. Si además se vectorizan, el SVG va al lado con el mismo nombre:
`docs/brief/figuras/<nombre>.svg`. Con el PNG basta; el equipo vectoriza.

## 5. Cómo se vectorizan (automático)

Con las imágenes en esta carpeta, un solo comando genera las figuras:

```bash
node scripts/trace-figure.mjs docs/brief/figuras/*.jpg
```

Crea `src/components/figures/<nombre>.ts` por cada imagen y regenera el índice.
Las figuras quedan disponibles para cualquier página con `data-line="<nombre>"`.
Los rellenos suaves salen solos de las tres zonas cerradas más grandes del
dibujo (arena, melocotón y verde claro). Con `--debug carpeta` guarda un SVG de
control por figura. Inkscape ya no hace falta; lo siguiente queda como alternativa.

## 5b. Cómo vectorizarlas a mano (Inkscape, opcional)

1. Abrir el PNG en Inkscape.
2. Seleccionarlo y usar **Trayecto → Vectorizar mapa de bits** (Ctrl+Mayús+B).
3. Pestaña **Modo**: elegir **Trazado de línea central** (centerline). Aplicar.
4. Borrar la imagen original, dejar solo el trayecto.
5. Opcional: **Trayecto → Simplificar** (Ctrl+L) una o dos veces para suavizar.
6. **Archivo → Guardar como… → SVG plano**. Nombre: `nombre-de-la-figura.svg`.

Si el resultado tiene varios tramos sueltos no pasa nada: el importador los une.

## 6. Qué hace el equipo con el SVG

El `d` del path se pega en `src/components/figures/<nombre>.ts` usando
`svgFigure(...)` de `src/components/svg-figure.ts`, y la figura queda disponible
para cualquier página con `data-line="<nombre>"`. Los rellenos suaves (arena,
melocotón o verde claro de la paleta) se agregan como paths cerrados dentro del
mismo SVG o a mano.
