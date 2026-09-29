/* ==========================================================================
   OSS Grappling · tienda
   Para cambiar precios, tallas, textos o fotos, edita solo el bloque CONFIG.
   ========================================================================== */

/* ====== CONFIG ============================================================ */
const WHATSAPP = "56940445826";   // número que recibe los pedidos (sin + ni espacios)

const IMG = "assets/img/";

const PRODUCTS = [
  {
    id: "polera-negra",
    name: "Polera Negra",
    cat: "Rashguard · manga corta",
    price: 37990,
    sizes: ["S", "M", "L"],
    badge: "Nuevo",
    front: "polera-negra-frente",
    back: "polera-negra-espalda",
    photos: ["lookbook-solo", "lookbook-newdrop"],
    desc: "Rashguard negra con el logo OSS al pecho y las rosas en tono sobre tono. Ajustada al cuerpo, con logo en la manga y en la nuca.",
  },
  {
    id: "polera-blanca",
    name: "Polera Blanca",
    cat: "Rashguard · manga corta",
    price: 37990,
    sizes: ["S", "M", "L"],
    badge: "Nuevo",
    front: "polera-blanca-frente",
    back: "polera-blanca-espalda",
    photos: ["lookbook-protagonista", "lookbook-drop1"],
    desc: "Rashguard blanca con rosas en línea negra que suben por el costado y el logo OSS al pecho. En la espalda, un ramo de rosas a la altura de la cadera.",
  },
  {
    id: "short",
    name: "Short Blanco",
    cat: "Fight short",
    price: 34900,
    sizes: ["S", "M", "L"],
    badge: "Nuevo",
    front: "short-frente",
    back: "short-espalda",
    photos: ["lookbook-equipo-2", "lookbook-takedown"],
    desc: "Fight short blanco con rosas en una pierna y OSS GRAPPLING 押忍グラップリング en la otra. Pretina negra con logo y borde curvo con ribete negro.",
  },
];

// Pack: se elige una talla para la polera y otra para el short.
const PACK = {
  id: "conjunto",
  name: "Conjunto Sakura",
  cat: "Pack · Polera negra + Short blanco",
  price: 68990,
  oldPrice: 72890,
  parts: [
    { key: "polera", label: "Polera", sizes: ["S", "M", "L"] },
    { key: "short", label: "Short", sizes: ["S", "M", "L"] },
  ],
  front: "conjunto",
  back: "lookbook-equipo",
  photos: ["polera-negra-frente", "short-frente", "lookbook-sakura"],
  desc: "Polera negra + short blanco. El combo completo para entrar al tatami, a menor precio que por separado.",
};
/* ========================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CLP = (n) => "$" + n.toLocaleString("es-CL");
const src = (name, small) => {
  if (!small) return IMG + name + ".webp";
  // Las fotos de producto tienen versión -600, las de lookbook versión -800
  return IMG + name + (name.startsWith("lookbook") || name.startsWith("hero") ? "-800" : "-600") + ".webp";
};
const ALL = [...PRODUCTS, PACK];
const findP = (id) => ALL.find((p) => p.id === id);

/* ---------- Estado persistente (carrito y datos del formulario) --------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: seguimos en memoria */ } },
};
let cart = store.get("oss-cart", []).filter((l) => findP(l.id));
const picked = {}; // selección de talla por tarjeta: { "polera-negra": "M", "conjunto": {polera:"M", short:"L"} }

/* ---------- Render de productos ----------------------------------------- */
function sizeButtons(scope, sizes, part) {
  return sizes.map((s) =>
    `<button type="button" class="size" role="radio" aria-checked="false" data-scope="${scope}" ${part ? `data-part="${part}"` : ""} data-size="${s}">${s}</button>`
  ).join("");
}

function productCard(p) {
  return `
  <article class="card" data-id="${p.id}">
    <div class="card-media swipe">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <div class="slides" data-slides>
        <button type="button" class="slide" data-open="${p.id}" aria-label="Ver ${p.name} en detalle">
          <img src="${src(p.front, true)}" srcset="${src(p.front, true)} 600w, ${src(p.front)} 1000w" sizes="(max-width: 560px) 92vw, (max-width: 980px) 46vw, 30vw" width="1000" height="1000" alt="${p.name}, vista frontal" loading="lazy">
        </button>
        <button type="button" class="slide" data-open="${p.id}" tabindex="-1" aria-hidden="true">
          <img src="${src(p.back, true)}" srcset="${src(p.back, true)} 600w, ${src(p.back)} 1000w" sizes="(max-width: 560px) 92vw, (max-width: 980px) 46vw, 30vw" width="1000" height="1000" alt="" loading="lazy">
        </button>
      </div>
      <span class="dots" aria-hidden="true"><i class="on"></i><i></i></span>
      <span class="view-hint">Ver detalle</span>
    </div>
    <div class="card-body">
      <div class="card-top">
        <div>
          <p class="card-cat">${p.cat}</p>
          <h3 class="card-name"><button type="button" data-open="${p.id}">${p.name}</button></h3>
        </div>
        <p class="price">${CLP(p.price)}</p>
      </div>
      <div class="sizes" role="radiogroup" aria-label="Talla de ${p.name}">
        <span class="sizes-label">Talla</span>${sizeButtons(p.id, p.sizes)}
      </div>
      <p class="hint" id="hint-${p.id}" aria-live="polite"></p>
      <button type="button" class="btn btn-ink btn-block" data-add="${p.id}">Agregar al carrito</button>
    </div>
  </article>`;
}

function packCard(p) {
  const save = p.oldPrice - p.price;
  return `
  <article class="pack card" data-id="${p.id}">
    <button type="button" class="card-media" data-open="${p.id}" aria-label="Ver ${p.name} en detalle">
      <img src="${src(p.front, true)}" srcset="${src(p.front, true)} 600w, ${src(p.front)} 1000w" sizes="(max-width: 860px) 92vw, 46vw" width="1000" height="1000" alt="Conjunto: polera negra y short blanco, frente y espalda" loading="lazy">
      <span class="view-hint">Ver detalle</span>
    </button>
    <div class="pack-body">
      <span class="badge sakura">Pack · Ahorra ${CLP(save)}</span>
      <div>
        <p class="card-cat">${p.cat}</p>
        <h3 class="display pack-title"><button type="button" class="plain" data-open="${p.id}">${p.name}</button></h3>
      </div>
      <p class="pack-desc">${p.desc}</p>
      <p class="price">${CLP(p.price)}<span class="price-old">${CLP(p.oldPrice)}</span></p>
      <div class="pack-sizes">
        ${p.parts.map((part) => `
          <div class="sizes" role="radiogroup" aria-label="Talla de ${part.label.toLowerCase()} del conjunto">
            <span class="sizes-label">${part.label}</span>${sizeButtons(p.id, part.sizes, part.key)}
          </div>`).join("")}
      </div>
      <p class="hint" id="hint-${p.id}" aria-live="polite"></p>
      <button type="button" class="btn btn-sakura" data-add="${p.id}">Agregar conjunto</button>
    </div>
  </article>`;
}

$("#grid").innerHTML = PRODUCTS.map(productCard).join("");
$("#packSlot").innerHTML = packCard(PACK);

// Fotos deslizables (frente / espalda) en pantallas táctiles
$$("[data-slides]").forEach((track) => {
  const dots = $$(".dots i", track.parentElement);
  track.addEventListener("scroll", () => {
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
  }, { passive: true });
});

/* ---------- Selección de talla ------------------------------------------ */
function setSize(scope, size, part) {
  if (part) {
    picked[scope] = Object.assign({}, picked[scope], { [part]: size });
  } else {
    picked[scope] = size;
  }
  $$(`.size[data-scope="${scope}"]${part ? `[data-part="${part}"]` : ""}`).forEach((b) => {
    b.setAttribute("aria-checked", String(b.dataset.size === size));
  });
  $$(`[id="hint-${scope}"], [id="qvhint-${scope}"]`).forEach((h) => (h.textContent = ""));
}

document.addEventListener("click", (e) => {
  const sizeBtn = e.target.closest(".size");
  if (sizeBtn) { setSize(sizeBtn.dataset.scope, sizeBtn.dataset.size, sizeBtn.dataset.part); return; }

  const addBtn = e.target.closest("[data-add]");
  if (addBtn) { addToCart(addBtn.dataset.add, addBtn.dataset.qty ? Number(addBtn.dataset.qty) : 1, addBtn.dataset.hint); return; }

  const openBtn = e.target.closest("[data-open]");
  if (openBtn) { openQuickView(openBtn.dataset.open); return; }
});

/* ---------- Carrito ------------------------------------------------------ */
function missingSize(p) {
  const sel = picked[p.id];
  if (p.parts) {
    const miss = p.parts.filter((pt) => !(sel && sel[pt.key]));
    return miss.length ? `Elige talla de ${miss.map((m) => m.label.toLowerCase()).join(" y ")}` : "";
  }
  return sel ? "" : "Elige una talla primero";
}

function sizeText(line) {
  return typeof line.size === "object"
    ? `Polera ${line.size.polera} · Short ${line.size.short}`
    : `Talla ${line.size}`;
}

function addToCart(id, qty = 1, hintId) {
  const p = findP(id);
  const miss = missingSize(p);
  if (miss) {
    $$(`#hint-${id}, #qvhint-${id}`).forEach((h) => (h.textContent = miss + " ↑"));
    if (hintId) { const h = document.getElementById(hintId); if (h) h.textContent = miss + " ↑"; }
    return;
  }
  const size = typeof picked[id] === "object" ? { ...picked[id] } : picked[id];
  const key = id + "|" + JSON.stringify(size);
  const line = cart.find((l) => l.key === key);
  if (line) line.qty += qty; else cart.push({ key, id, size, qty });
  saveCart();
  renderCart(true);
  toast(`${p.name} · ${sizeText({ size })} agregado`);
  $$(`.card [data-add="${id}"]`).forEach((b) => {
    if (!b.dataset.label) b.dataset.label = b.textContent;
    b.textContent = "✓ Agregado";
    b.classList.add("done");
    clearTimeout(b._t);
    b._t = setTimeout(() => { b.textContent = b.dataset.label; b.classList.remove("done"); }, 1600);
  });
  if ($("#qv").open) $("#qv").close();
}

function saveCart() { store.set("oss-cart", cart); }

function renderCart(bump) {
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + l.qty * findP(l.id).price, 0);
  const badge = $("#cartCount");
  badge.textContent = count;
  badge.classList.toggle("has", count > 0);
  if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }
  $("#cartTotal").textContent = CLP(total);

  const body = $("#cartBody");
  if (!cart.length) {
    body.innerHTML = `<div class="empty"><span class="jp" lang="ja" aria-hidden="true">空</span><p>Tu carrito está vacío.<br>Elige tus piezas y vuelve aquí.</p><a class="btn btn-ghost" href="#coleccion" data-close-cart>Ver colección</a></div>`;
  } else {
    body.innerHTML = cart.map((l, i) => {
      const p = findP(l.id);
      return `<div class="ci">
        <img src="${src(p.front, true)}" alt="" width="72" height="72">
        <div>
          <p class="ci-name">${p.name}</p>
          <p class="ci-size">${sizeText(l)}</p>
          <div class="qty" role="group" aria-label="Cantidad de ${p.name}">
            <button type="button" data-q="${i}" data-d="-1" aria-label="Quitar uno">−</button>
            <span>${l.qty}</span>
            <button type="button" data-q="${i}" data-d="1" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <div>
          <p class="ci-price">${CLP(p.price * l.qty)}</p>
          <button type="button" class="ci-rm" data-rm="${i}">Quitar</button>
        </div>
      </div>`;
    }).join("");
  }
  updateCheckout();
}

$("#cartBody").addEventListener("click", (e) => {
  const q = e.target.closest("[data-q]");
  if (q) {
    const i = Number(q.dataset.q);
    cart[i].qty += Number(q.dataset.d);
    if (cart[i].qty <= 0) cart.splice(i, 1);
    saveCart(); renderCart(); return;
  }
  const rm = e.target.closest("[data-rm]");
  if (rm) { cart.splice(Number(rm.dataset.rm), 1); saveCart(); renderCart(); return; }
  if (e.target.closest("[data-close-cart]")) closeCart();
});

/* Datos opcionales del cliente */
const form = $("#cartForm");
const savedForm = store.get("oss-form", {});
if (savedForm.nombre) $("#fName").value = savedForm.nombre;
if (savedForm.comuna) $("#fComuna").value = savedForm.comuna;
if (savedForm.entrega === "Retiro en persona") $("#fRetiro").checked = true;
form.addEventListener("input", () => {
  store.set("oss-form", { nombre: $("#fName").value, comuna: $("#fComuna").value, entrega: form.entrega.value });
  updateCheckout();
});
form.addEventListener("submit", (e) => e.preventDefault());

function orderMessage() {
  const total = cart.reduce((a, l) => a + l.qty * findP(l.id).price, 0);
  let msg = "Hola OSS Grappling 👋 Quiero hacer este pedido:\n\n";
  cart.forEach((l) => {
    const p = findP(l.id);
    msg += `• ${p.name} — ${sizeText(l)} — x${l.qty} — ${CLP(p.price * l.qty)}\n`;
  });
  msg += `\nTotal: ${CLP(total)}\n`;
  const nombre = $("#fName").value.trim();
  const comuna = $("#fComuna").value.trim();
  const entrega = form.entrega.value;
  msg += `Entrega: ${entrega}${comuna ? " · " + comuna : ""}\n`;
  if (nombre) msg += `Nombre: ${nombre}\n`;
  msg += "\n¿Me ayudan a coordinar pago y despacho? 🙏";
  return msg;
}

function updateCheckout() {
  const a = $("#checkout");
  if (!cart.length) {
    a.setAttribute("aria-disabled", "true");
    a.href = `https://wa.me/${WHATSAPP}`;
    return;
  }
  a.removeAttribute("aria-disabled");
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(orderMessage())}`;
}

/* Abrir / cerrar carrito */
let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  $("#toast").hidden = true;
  $("#overlay").hidden = false;
  const c = $("#cart");
  c.classList.add("open");
  c.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#cartClose").focus(), 50);
}
function closeCart() {
  $("#overlay").hidden = true;
  const c = $("#cart");
  c.classList.remove("open");
  c.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#cart").classList.contains("open")) closeCart();
});

/* ---------- Toast -------------------------------------------------------- */
let toastT;
function toast(text) {
  const t = $("#toast");
  $("#toastText").textContent = text;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.hidden = true), 3200);
}
$("#toastCart").addEventListener("click", () => { $("#toast").hidden = true; openCart(); });

/* ---------- Vista rápida ------------------------------------------------- */
function openQuickView(id) {
  const p = findP(id);
  const images = [p.front, p.back, ...(p.photos || [])];
  const sizesHtml = p.parts
    ? p.parts.map((pt) => `<div class="sizes" role="radiogroup" aria-label="Talla de ${pt.label.toLowerCase()}"><span class="sizes-label">${pt.label}</span>${sizeButtons(p.id, pt.sizes, pt.key)}</div>`).join("")
    : `<div class="sizes" role="radiogroup" aria-label="Talla"><span class="sizes-label">Talla</span>${sizeButtons(p.id, p.sizes)}</div>`;

  $("#qvInner").innerHTML = `
    <div class="qv-gallery">
      <div class="qv-main"><img id="qvMain" src="${src(images[0])}" width="1000" height="1000" alt="${p.name}"></div>
      <div class="qv-thumbs" role="group" aria-label="Fotos de ${p.name}">
        ${images.map((im, i) => `<button type="button" data-img="${im}" aria-current="${i === 0}" aria-label="Foto ${i + 1} de ${images.length}"><img src="${src(im, true)}" alt="" loading="lazy"></button>`).join("")}
      </div>
    </div>
    <div class="qv-info">
      <button class="icon-btn" type="button" data-qv-close aria-label="Cerrar">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <div>
        <p class="card-cat">${p.cat}</p>
        <h2 class="display qv-name" id="qvName">${p.name}</h2>
      </div>
      <p class="price">${CLP(p.price)}${p.oldPrice ? `<span class="price-old">${CLP(p.oldPrice)}</span><span class="save">Ahorra ${CLP(p.oldPrice - p.price)}</span>` : ""}</p>
      <p class="qv-desc">${p.desc}</p>
      <ul class="qv-specs">
        <li><strong>Tela:</strong> 85% poliéster · 15% spandex</li>
        <li><strong>Tallas:</strong> S, M y L · <a href="#tallas" data-qv-close>ver medidas</a></li>
        <li><strong>Envío:</strong> a todo Chile o retiro en persona</li>
      </ul>
      ${sizesHtml}
      <p class="hint" id="qvhint-${p.id}" aria-live="polite"></p>
      <div class="qv-buy">
        <div class="qty" role="group" aria-label="Cantidad">
          <button type="button" data-qvq="-1" aria-label="Quitar uno">−</button>
          <span id="qvQty">1</span>
          <button type="button" data-qvq="1" aria-label="Agregar uno">+</button>
        </div>
        <button type="button" class="btn btn-sakura" id="qvAdd" data-add="${p.id}" data-qty="1" data-hint="qvhint-${p.id}">Agregar al carrito</button>
      </div>
    </div>`;

  // reflejar talla ya elegida en la tarjeta
  const sel = picked[p.id];
  if (sel && typeof sel === "object") Object.entries(sel).forEach(([k, v]) => setSize(p.id, v, k));
  else if (sel) setSize(p.id, sel);

  const d = $("#qv");
  if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
}

$("#qv").addEventListener("click", (e) => {
  const d = $("#qv");
  if (e.target === d || e.target.closest("[data-qv-close]")) { d.close(); return; }
  const t = e.target.closest("[data-img]");
  if (t) {
    $("#qvMain").src = src(t.dataset.img);
    $$(".qv-thumbs button").forEach((b) => b.setAttribute("aria-current", String(b === t)));
    return;
  }
  const q = e.target.closest("[data-qvq]");
  if (q) {
    const el = $("#qvQty");
    const n = Math.max(1, Math.min(20, Number(el.textContent) + Number(q.dataset.qvq)));
    el.textContent = n;
    $("#qvAdd").dataset.qty = n;
  }
});

/* ---------- Lookbook: lightbox ----------------------------------------- */
const shots = $$("#lookbookGrid .shot");
let lbIndex = 0;
function showShot(i) {
  lbIndex = (i + shots.length) % shots.length;
  const s = shots[lbIndex];
  const img = $("#lbImg");
  img.src = s.dataset.full;
  img.alt = s.querySelector("img").alt;
}
shots.forEach((s, i) => s.addEventListener("click", () => {
  showShot(i);
  const d = $("#lightbox");
  if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
}));
$("#lbClose").addEventListener("click", () => $("#lightbox").close());
$("#lbPrev").addEventListener("click", () => showShot(lbIndex - 1));
$("#lbNext").addEventListener("click", () => showShot(lbIndex + 1));
$("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") $("#lightbox").close(); });
$("#lightbox").addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") showShot(lbIndex - 1);
  if (e.key === "ArrowRight") showShot(lbIndex + 1);
});

/* ---------- Menú móvil --------------------------------------------------- */
const nav = $("#nav"), menuBtn = $("#menuBtn");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.querySelector(".sr").textContent = open ? "Cerrar menú" : "Abrir menú";
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
});

/* ---------- Ticker ------------------------------------------------------- */
const unit = `<span>OSS <i>/</i> Grappling <span class="jp" lang="ja">押忍</span> <i>/</i> Drop 01 Sakura <i>/</i> Jiu-Jitsu Wear <i>/</i> Valparaíso · Viña del Mar <i>/</i></span>`;
$("#ticker").innerHTML = unit.repeat(8);

/* ---------- Inicio ------------------------------------------------------- */
$("#year").textContent = new Date().getFullYear();
renderCart();
