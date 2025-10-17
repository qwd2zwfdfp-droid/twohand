const yilEl = document.getElementById("yil");
if (yilEl) yilEl.textContent = new Date().getFullYear();

const grid = document.getElementById("grid");
const sonuc = document.getElementById("sonuc");
const q = document.getElementById("q");
const kategori = document.getElementById("kategori");
const durum = document.getElementById("durum");
const min = document.getElementById("min");
const max = document.getElementById("max");
const filtreleBtn = document.getElementById("filtrele");
const sifirlaBtn = document.getElementById("sifirla");

let DATA = [];

async function load() {
  try {
    const res = await fetch("products.json?v=" + Date.now());
    DATA = await res.json();
    render(DATA);
  } catch (e) {
    grid.innerHTML = "<p>Ürünler yüklenemedi.</p>";
  }
}

function formatPrice(n){return "₺" + new Intl.NumberFormat('tr-TR').format(n)}

function card(p) {
  const defect = p.durum === "defolu";
  const badges = [`<span class="badge">${p.kategori}</span>`,
                  `<span class="badge">${p.beden}</span>`,
                  defect ? `<span class="badge defect">Defolu</span>` : `<span class="badge">Temiz</span>`]
                  .join("");
  const waText = encodeURIComponent(`Merhaba, ${p.kod} (${p.marka} ${p.model}) hakkında bilgi alabilir miyim? Fiyat: ${p.fiyat} TL. Durum: ${p.durum}.`);
  const wa = `https://wa.me/905555555555?text=${waText}`;

  return `<div class="card">
    <img src="${p.gorsel || "https://picsum.photos/seed/"+p.kod+"/600/450"}" alt="${p.marka} ${p.model}" loading="lazy">
    <div class="pad">
      <div class="badges">${badges}</div>
      <h3>${p.marka} ${p.model}</h3>
      <div class="meta">Omuz ${p.omuz} • Göğüs ${p.gogus} • Boy ${p.boy}</div>
      <div class="price">${formatPrice(p.fiyat)}</div>
      ${p.not ? `<p class="meta">${p.not}</p>` : ""}
    </div>
    <div class="actions">
      <a class="btn" href="${wa}" target="_blank" rel="noopener">WhatsApp ile Sor</a>
      <button class="btn" data-kod="${p.kod}" onclick="fav(this)">Favori</button>
    </div>
  </div>`;
}

function render(list) {
  if (!list.length) {
    grid.innerHTML = "";
    sonuc.textContent = "Sonuç bulunamadı.";
    return;
  }
  grid.innerHTML = list.map(card).join("");
  sonuc.textContent = `${list.length} ürün listeleniyor.`;
}

function applyFilters() {
  const s = (q.value || "").toLowerCase().trim();
  const k = kategori.value;
  const d = durum.value;
  const minV = min.value ? Number(min.value) : -Infinity;
  const maxV = max.value ? Number(max.value) : Infinity;

  const filtered = DATA.filter(p => {
    const hay = `${p.kod} ${p.marka} ${p.model} ${p.kategori} ${p.beden}`.toLowerCase();
    const matchSearch = s ? hay.includes(s) : true;
    const matchK = k ? p.kategori === k : true;
    const matchD = d ? p.durum === d : true;
    const matchPrice = p.fiyat >= minV && p.fiyat <= maxV;
    return matchSearch && matchK && matchD && matchPrice;
  });
  render(filtered);
}

function resetFilters(){
  q.value = ""; kategori.value = ""; durum.value = ""; min.value = ""; max.value = "";
  render(DATA);
}

function fav(btn){
  const kod = btn.dataset.kod;
  const key = "fav:"+kod;
  const val = localStorage.getItem(key);
  if (val) { localStorage.removeItem(key); btn.textContent = "Favori"; }
  else { localStorage.setItem(key, "1"); btn.textContent = "Favlandı"; }
}

filtreleBtn.addEventListener("click", applyFilters);

sifirlaBtn.addEventListener("click", resetFilters);
[q,kategori,durum,min,max].forEach(el => el.addEventListener("keydown", e => { if(e.key==="Enter"){applyFilters()} }));

load();
