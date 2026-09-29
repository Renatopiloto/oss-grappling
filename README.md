# OSS Grappling · sitio web

Tienda de una sola página para **OSS Grappling** (rashguards y fight shorts de grappling, Drop 01 Sakura).
Sitio estático: HTML, CSS y JavaScript sin dependencias ni paso de compilación.

- Colección con fotos frente/espalda, selector de talla y vista rápida con galería.
- Pack «Conjunto Sakura» con talla independiente para polera y short.
- Carrito que se guarda en el navegador y arma el pedido completo en un mensaje de WhatsApp (nombre, comuna y tipo de entrega opcionales).
- Lookbook con visor de fotos, guía de tallas en cm, filosofía OSS, preguntas frecuentes y enlace a Instagram.
- Fuentes alojadas en el propio sitio, imágenes en WebP y metadatos para compartir en redes (Open Graph).

## Estructura

```
index.html              página
assets/css/styles.css   estilos
assets/js/app.js        productos, carrito y pedido por WhatsApp
assets/img/             fotos (WebP), logo, íconos, imagen para redes
assets/fonts/           Saira, Montserrat y glifos japoneses (subconjuntos)
netlify.toml            configuración de Netlify (sin build)
```

## Cambiar precios, tallas o textos de productos

Todo está al inicio de `assets/js/app.js`, en el bloque **CONFIG**:

```js
const WHATSAPP = "56940445826";      // número que recibe los pedidos
const PRODUCTS = [ { id: "polera-negra", name: "Polera Negra", price: 37990, sizes: ["S","M","L"], ... } ];
const PACK = { price: 68990, oldPrice: 72890, ... };
```

- **Precio:** cambia `price` (número sin puntos).
- **Tallas:** edita la lista `sizes`.
- **Fotos:** `front` y `back` son las fotos de la tarjeta; `photos` son las extra de la vista rápida. Usa el nombre del archivo en `assets/img/` sin la extensión (cada foto tiene una versión `-600` o `-800` más liviana).
- **Etiqueta:** `badge: "Nuevo"` (bórrala para quitarla).

La guía de tallas, las preguntas y los textos están directamente en `index.html`.

Si cambias `styles.css` o `app.js`, cambia también el número `?v=` con que se cargan en `index.html` para que los navegadores no muestren la versión antigua guardada.

## Publicar

El sitio se publica tal cual desde la raíz del repositorio.

**GitHub Pages (activo):** https://renatopiloto.github.io/oss-grappling/ se actualiza solo con cada cambio en `main`.

**Netlify:** *Add new site → Import an existing project → GitHub →* elegir este repositorio. No hay comando de build y el directorio de publicación es la raíz (ya está en `netlify.toml`). Cada cambio que se suba a `main` se publica solo.


Si cambias de dominio, actualiza las URL de `canonical`, `og:image` y el bloque JSON-LD en el `<head>` de `index.html`.

## Probar en tu computador

Abre `index.html` en el navegador, o levanta un servidor local:

```
python -m http.server 8000
```

y entra a http://localhost:8000
