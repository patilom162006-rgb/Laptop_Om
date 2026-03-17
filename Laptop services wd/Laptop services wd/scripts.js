/* =============================================
   LAPTOP HUB - Global State & Data
   ============================================= */

const API_BASE = '/api';
let LAPTOPS = [];
let laptopsLoaded = false;
const laptopLoadPromise = loadLaptopData();

async function loadLaptopData() {
  try {
    const resp = await fetch(`${API_BASE}/laptops`);
    if (!resp.ok) throw new Error('Failed to load laptops');
    LAPTOPS = await resp.json();
  } catch (error) {
    console.error('Unable to load laptops from API', error);
    LAPTOPS = [];
  }
  laptopsLoaded = true;
  return LAPTOPS;
}

function ensureLaptopsLoaded() {
  return laptopsLoaded ? Promise.resolve(LAPTOPS) : laptopLoadPromise;
}

function findLaptop(id) {
  return LAPTOPS.find(laptop => laptop.id === id) ?? null;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (char) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[char] ?? '';
  });
}

let selectedShopLaptopId = null;
let shopDetailElements = null;
let detailAddResetTimer = null;

function hydrateShopDetailElements() {
  if (shopDetailElements) return shopDetailElements;
  const panel = document.getElementById('shop-detail-panel');
  if (!panel) return null;
  shopDetailElements = {
    panel,
    title: document.getElementById('details-panel-title'),
    subtitle: document.getElementById('details-panel-subtitle'),
    body: document.getElementById('details-panel-body'),
  };
  return shopDetailElements;
}

function selectShopLaptop(laptop) {
  selectedShopLaptopId = laptop ? laptop.id : null;
  updateShopDetailPanel(laptop);
}

function updateShopDetailPanel(laptop) {
  const elems = hydrateShopDetailElements();
  if (!elems) return;
  if (!laptop) {
    elems.title.textContent = 'Select a laptop to unlock its details';
    elems.subtitle.textContent = 'Click the "Details" button on any laptop card to explore specs, pricing, and highlights.';
    elems.body.innerHTML = `
      <div class="shop-detail-placeholder">
        <div class="detail-placeholder-icon">🎯</div>
        <p>Click "Details" on a laptop card to see price, specs, feature highlights, and quick actions right here.</p>
      </div>`;
    return;
  }
  const safeName = escapeHtml(laptop.name);
  const specRows = Object.entries(laptop.specsFull || {}).map(([key, value]) =>
    `<div class="detail-spec-row">
      <span>${escapeHtml(key)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>`).join('');
  const featureChips = (laptop.features || []).map(f => `<span class="feature-chip">${escapeHtml(f)}</span>`).join('') ||
    '<span class="feature-chip muted-chip">No extra highlights</span>';
  const priceLabel = `₹${laptop.price.toLocaleString()}`;
  const ratingLabel = `${laptop.rating}⭐ (${laptop.reviews} reviews)`;
  elems.title.textContent = safeName;
  elems.subtitle.textContent = `${ratingLabel} · ${laptop.category} · Starts at ${priceLabel}`;
  elems.body.innerHTML = `
    <div class="detail-panel">
      <div class="detail-visual">
        <img src="${laptop.image}" alt="${safeName}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'"/>
        <div class="detail-badge-row">
          <span class="price">${priceLabel}</span>
          <span class="rating-badge">${ratingLabel}</span>
        </div>
      </div>
      <div class="detail-info">
        <p class="detail-label">${escapeHtml(laptop.description)}</p>
        <details open class="detail-card">
          <summary>Key Specifications</summary>
          <div class="detail-spec-grid">
            ${specRows}
          </div>
        </details>
        <details class="detail-card">
          <summary>Description</summary>
          <p>${escapeHtml(laptop.description)}</p>
        </details>
        <details class="detail-card">
          <summary>Feature Highlights</summary>
          <div class="feature-chip-list">
            ${featureChips}
          </div>
        </details>
        <div class="detail-actions">
          <button class="btn btn-primary detail-add-btn" type="button">🛒 Add to Cart</button>
          <button class="btn btn-outline detail-modal-btn" type="button">View in Modal</button>
        </div>
      </div>
    </div>`;
  const detailAddBtn = elems.body.querySelector('.detail-add-btn');
  if (detailAddBtn) {
    const defaultLabel = detailAddBtn.innerHTML;
    detailAddBtn.addEventListener('click', () => {
      addToCart(laptop.id);
      updateNavBadges();
      showToast('🛒', 'Added to Cart!', `${laptop.name}`);
      detailAddBtn.classList.add('btn-added');
      detailAddBtn.innerHTML = '✔️ Added';
      clearTimeout(detailAddResetTimer);
      detailAddResetTimer = setTimeout(() => {
        detailAddBtn.classList.remove('btn-added');
        detailAddBtn.innerHTML = defaultLabel;
      }, 1400);
    });
  }
  const detailModalBtn = elems.body.querySelector('.detail-modal-btn');
  if (detailModalBtn) {
    detailModalBtn.addEventListener('click', () => openLaptopModal(laptop));
  }
}

// =============================================
// State Management with localStorage
// =============================================

function getState(key, defaultVal = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? defaultVal; }
  catch { return defaultVal; }
}

function setState(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

async function persistCartState(cart) {
  try {
    await fetch(`${API_BASE}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });
  } catch (error) {
    console.warn('Unable to sync cart with backend', error);
  }
}

async function persistFavouritesState(items) {
  try {
    await fetch(`${API_BASE}/favourites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch (error) {
    console.warn('Unable to sync favourites with backend', error);
  }
}

function getLiked() { return getState('laptopLiked', []); }
function setLiked(arr, opts = {}) {
  setState('laptopLiked', arr);
  updateNavBadges();
  if (!opts.skipSync) persistFavouritesState(arr);
}
function getCart() { return getState('laptopCart', []); }
function setCart(arr, opts = {}) {
  setState('laptopCart', arr);
  updateNavBadges();
  if (!opts.skipSync) persistCartState(arr);
}
function getCompare() { return getState('laptopCompare', []); }
function setCompare(arr) { setState('laptopCompare', arr); }

async function hydrateRemoteState() {
  try {
    const [cartRes, favRes] = await Promise.all([
      fetch(`${API_BASE}/cart`),
      fetch(`${API_BASE}/favourites`),
    ]);
    if (cartRes.ok) {
      const serverCart = await cartRes.json();
      if (Array.isArray(serverCart)) setCart(serverCart, { skipSync: true });
    }
    if (favRes.ok) {
      const serverFavs = await favRes.json();
      if (Array.isArray(serverFavs)) setLiked(serverFavs, { skipSync: true });
    }
  } catch (error) {
    console.warn('Unable to hydrate state from backend', error);
  }
}
hydrateRemoteState();

function isLiked(id) { return getLiked().includes(id); }

function toggleLike(id) {
  let liked = getLiked();
  if (liked.includes(id)) {
    liked = liked.filter(x => x !== id);
    showToast('💔', 'Removed from Favourites');
  } else {
    liked.push(id);
    showToast('❤️', 'Added to Favourites');
  }
  setLiked(liked);
  return liked.includes(id);
}

function addToCart(id) {
  let cart = getCart();
  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
    showToast('🛒', 'Quantity updated in Cart!');
  } else {
    cart.push({ id, qty: 1 });
    showToast('🛒', 'Added to Cart!');
  }
  setCart(cart);
}

function removeFromCart(id) {
  let cart = getCart().filter(x => x.id !== id);
  setCart(cart);
}

function updateCartQty(id, delta) {
  let cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) {
    item.qty = Math.max(1, (item.qty || 1) + delta);
  }
  setCart(cart);
}

function addToCompare(id) {
  let compare = getCompare();
  if (compare.includes(id)) {
    compare = compare.filter(x => x !== id);
    setCompare(compare);
    return false;
  }
  if (compare.length >= 3) {
    showToast('⚠️', 'Max 3 laptops to compare!');
    return false;
  }
  compare.push(id);
  setCompare(compare);
  showToast('⚖️', 'Added to Comparison!');
  return true;
}

// =============================================
// Toast Notification
// =============================================

let toastTimer;
function showToast(icon, msg, sub = '') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon"></span><div class="toast-text"><strong></strong><span></span></div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-icon').textContent = icon;
  toast.querySelector('strong').textContent = msg;
  toast.querySelector('span').textContent = sub;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// =============================================
// Nav Badge Updater
// =============================================

function updateNavBadges() {
  const liked = getLiked();
  const cart = getCart();
  const totalQty = cart.reduce((sum, x) => sum + (x.qty || 1), 0);

  document.querySelectorAll('.badge-liked').forEach(el => {
    el.textContent = liked.length;
    el.style.display = liked.length > 0 ? 'inline' : 'none';
  });
  document.querySelectorAll('.badge-cart').forEach(el => {
    el.textContent = totalQty;
    el.style.display = totalQty > 0 ? 'inline' : 'none';
  });
}

// =============================================
// Laptop Card Renderer
// =============================================

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '⭐';
  if (half) s += '✨';
  return s;
}

function createLaptopCard(laptop, opts = {}) {
  const liked = isLiked(laptop.id);
  const compare = getCompare();
  const inCompare = compare.includes(laptop.id);
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = laptop.id;
  const safeName = escapeHtml(laptop.name);
  const safeSpecs = escapeHtml(laptop.specs);
  const safeCategory = escapeHtml(laptop.category);

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${laptop.image}" alt="${safeName}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'"/>
      <span class="card-category-badge">${safeCategory}</span>
      <div class="card-actions">
        <button type="button" class="btn-icon like-btn ${liked ? 'liked' : ''}" title="Add to Favourites" data-id="${laptop.id}">
          ${liked ? '❤️' : '🤍'}
        </button>
        <button type="button" class="btn-icon compare-btn ${inCompare ? 'in-compare' : ''}" title="Add to Compare" data-id="${laptop.id}">
          ⚖️
        </button>
      </div>
    </div>
    <h3>${safeName}</h3>
    <p class="specs-text">${safeSpecs}</p>
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem;">
      <p class="price">₹${laptop.price.toLocaleString()}</p>
      <span style="font-size:0.72rem;color:var(--text-muted);">${laptop.rating}⭐ (${laptop.reviews})</span>
    </div>
    <div class="card-footer">
      <button type="button" class="btn btn-primary btn-sm view-btn" data-id="${laptop.id}">👁 Details</button>
      <button type="button" class="btn btn-accent btn-sm cart-btn" data-id="${laptop.id}">🛒 Add</button>
    </div>
  `;

  // Like button
  card.querySelector('.like-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const nowLiked = toggleLike(laptop.id);
    btn.classList.toggle('liked', nowLiked);
    btn.textContent = nowLiked ? '❤️' : '🤍';
    if (opts.onLikeChange) opts.onLikeChange(laptop.id, nowLiked);
  });

  // Compare button
  card.querySelector('.compare-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const added = addToCompare(laptop.id);
    const inC = getCompare().includes(laptop.id);
    btn.classList.toggle('in-compare', inC);
    updateCompareBar();
    if (opts.onCompareChange) opts.onCompareChange();
  });

  // Cart button
  card.querySelector('.cart-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(laptop.id);
    updateNavBadges();
  });

  // View details
  card.querySelector('.view-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (opts.onViewDetails) opts.onViewDetails(laptop);
    openLaptopModal(laptop);
  });

  return card;
}

// =============================================
// Laptop Detail Modal
// =============================================

function openLaptopModal(laptop) {
  let overlay = document.getElementById('laptop-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'laptop-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" id="laptop-modal">
        <div class="modal-header">
          <h3 id="modal-title">Laptop Details</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div id="modal-body"></div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('modal-close-btn').addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }

  document.getElementById('modal-title').textContent = laptop.name;

  const specRows = Object.entries(laptop.specsFull).map(([k, v]) =>
    `<div style="display:flex;justify-content:space-between;padding:0.55rem 0;border-bottom:1px solid var(--glass-border);font-size:0.88rem;">
      <span style="color:var(--text-muted);font-weight:600;">${k}</span>
      <span style="color:var(--text-primary);">${v}</span>
    </div>`).join('');

  document.getElementById('modal-body').innerHTML = `
    <img src="${laptop.image}" alt="${laptop.name}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:1.2rem;" onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'"/>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <p class="price" style="font-size:1.4rem;">₹${laptop.price.toLocaleString()}</p>
      <span style="background:rgba(108,99,255,0.12);border:1px solid rgba(108,99,255,0.25);color:var(--primary-light);padding:3px 10px;border-radius:50px;font-size:0.78rem;font-weight:600;">${laptop.category}</span>
    </div>
    <div style="margin-bottom:1.2rem;">${specRows}</div>
    <div style="display:flex;gap:0.7rem;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="addToCart(${laptop.id});showToast('🛒','Added to Cart!');updateNavBadges();" style="flex:1;justify-content:center;">🛒 Add to Cart</button>
      <button class="btn btn-outline" onclick="window.location.href='cart.html'" style="flex:1;justify-content:center;">Buy Now →</button>
    </div>`;

  overlay.classList.add('active');
}

// =============================================
// Compare Bar (visible on shop page)
// =============================================

function updateCompareBar() {
  const bar = document.getElementById('compare-bar');
  if (!bar) return;
  const compare = getCompare();
  if (compare.length === 0) { bar.classList.remove('visible'); return; }
  bar.classList.add('visible');
  const itemsEl = document.getElementById('compare-items');
  itemsEl.innerHTML = compare.map(id => {
    const l = LAPTOPS.find(x => x.id === id);
    return l ? `<div class="compare-chip">${l.name}<span class="remove-chip" data-id="${id}">×</span></div>` : '';
  }).join('');
  itemsEl.querySelectorAll('.remove-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      let c = getCompare().filter(x => x !== parseInt(btn.dataset.id));
      setCompare(c);
      updateCompareBar();
      // update card buttons
      document.querySelectorAll('.compare-btn').forEach(b => {
        const bid = parseInt(b.dataset.id);
        b.classList.toggle('in-compare', c.includes(bid));
      });
    });
  });
}

// =============================================
// SHOP PAGE
// =============================================

async function initShopPage() {
  await ensureLaptopsLoaded();
  const productGrid = document.getElementById('product-grid');
  const searchBox = document.getElementById('search-box');
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const priceRadios = document.querySelectorAll('input[name="price"]');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const sortSelect = document.getElementById('sort-select');
  const resultsCount = document.getElementById('results-count');

  if (!productGrid) return;

  function renderLaptops(list) {
    productGrid.innerHTML = '';
    if (resultsCount) resultsCount.textContent = `${list.length} laptop${list.length !== 1 ? 's' : ''} found`;
    if (list.length === 0) {
      productGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <span class="icon">🔍</span>
        <h3>No laptops found</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">Try adjusting your filters</p>
      </div>`;
      selectShopLaptop(null);
      return;
    }
    list.forEach(l => productGrid.appendChild(createLaptopCard(l, { onViewDetails: selectShopLaptop })));
    const activeLaptop = list.find(l => l.id === selectedShopLaptopId) ?? list[0];
    selectShopLaptop(activeLaptop);
  }

  function filterAndSearch() {
    let filtered = [...LAPTOPS];
    const selectedCats = [...categoryCheckboxes].filter(cb => cb.checked).map(cb => cb.value);
    if (selectedCats.length) filtered = filtered.filter(l => selectedCats.includes(l.category));

    const selectedPrice = [...priceRadios].find(r => r.checked)?.value;
    if (selectedPrice === 'under75000') filtered = filtered.filter(l => l.price < 75000);
    else if (selectedPrice === '75000to120000') filtered = filtered.filter(l => l.price >= 75000 && l.price <= 120000);
    else if (selectedPrice === 'above120000') filtered = filtered.filter(l => l.price > 120000);

    const searchText = (searchBox?.value || '').toLowerCase();
    if (searchText) filtered = filtered.filter(l =>
      l.name.toLowerCase().includes(searchText) || l.specs.toLowerCase().includes(searchText)
    );

    if (sortSelect) {
      if (sortSelect.value === 'price-asc') filtered.sort((a, b) => a.price - b.price);
      else if (sortSelect.value === 'price-desc') filtered.sort((a, b) => b.price - a.price);
      else if (sortSelect.value === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    }

    renderLaptops(filtered);
  }

  if (searchBox) searchBox.addEventListener('input', filterAndSearch);
  categoryCheckboxes.forEach(cb => cb.addEventListener('change', filterAndSearch));
  priceRadios.forEach(rb => rb.addEventListener('change', filterAndSearch));
  if (sortSelect) sortSelect.addEventListener('change', filterAndSearch);
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      categoryCheckboxes.forEach(cb => cb.checked = false);
      priceRadios.forEach(rb => rb.checked = false);
      if (searchBox) searchBox.value = '';
      if (sortSelect) sortSelect.value = 'default';
      filterAndSearch();
    });
  }

  filterAndSearch();
  updateCompareBar();
  updateNavBadges();
}

// =============================================
// CART PAGE
// =============================================

async function initCartPage() {
  await ensureLaptopsLoaded();
  const cartContainer = document.getElementById('cart-container');
  if (!cartContainer) return;

  function renderCart() {
    const cart = getCart();
    const totalQty = cart.reduce((s, x) => s + (x.qty || 1), 0);
    const subtotal = cart.reduce((s, x) => {
      const l = LAPTOPS.find(p => p.id === x.id);
      return s + (l ? l.price * (x.qty || 1) : 0);
    }, 0);
    const shipping = subtotal > 100000 ? 0 : 499;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="cart-empty" style="grid-column:1/-1;text-align:center;padding:5rem 2rem;">
          <span class="empty-icon">🛒</span>
          <h3 style="font-size:1.5rem;color:var(--text-secondary);margin-bottom:0.5rem;">Your cart is empty</h3>
          <p style="color:var(--text-muted);margin-bottom:2rem;">Explore laptops and add them to your cart!</p>
          <a href="shop.html" class="btn btn-primary">Browse Laptops →</a>
        </div>`;
      return;
    }

    const itemsHtml = cart.map(item => {
      const l = LAPTOPS.find(p => p.id === item.id);
      if (!l) return '';
      return `
        <div class="cart-item" data-id="${l.id}">
          <img src="${l.image}" alt="${l.name}" onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'"/>
          <div>
            <div class="cart-item-name">${l.name}</div>
            <div class="cart-item-specs">${l.specs}</div>
            <div class="qty-control">
              <button class="qty-btn qty-minus" data-id="${l.id}">−</button>
              <span class="qty-num">${item.qty || 1}</span>
              <button class="qty-btn qty-plus" data-id="${l.id}">+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <div class="cart-item-price">₹${(l.price * (item.qty || 1)).toLocaleString()}</div>
            <button class="remove-item-btn" data-id="${l.id}" title="Remove">🗑️</button>
          </div>
        </div>`;
    }).join('');

    cartContainer.innerHTML = `
      <div class="cart-layout">
        <div>
          <h2 style="font-family:'Outfit',sans-serif;font-size:1.4rem;font-weight:700;margin-bottom:1.2rem;">
            Shopping Cart <span style="color:var(--text-muted);font-size:0.9rem;font-weight:400;">(${totalQty} item${totalQty !== 1 ? 's' : ''})</span>
          </h2>
          <div class="cart-items-list">${itemsHtml}</div>
        </div>
        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString()}</span></div>
          <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:var(--success)">FREE</span>' : '₹' + shipping}</span></div>
          <div class="summary-row"><span>GST (18%)</span><span>₹${tax.toLocaleString()}</span></div>
          <div class="summary-row total"><span>Total</span><span>₹${total.toLocaleString()}</span></div>
          ${shipping === 0 ? '' : `<p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">🎉 Add ₹${(100000 - subtotal).toLocaleString()} more for FREE shipping!</p>`}
          <button class="btn btn-primary" onclick="openCheckoutModal()" style="width:100%;justify-content:center;margin-top:1.5rem;">Proceed to Checkout →</button>
          <a href="shop.html" class="btn btn-outline" style="width:100%;justify-content:center;margin-top:0.7rem;">← Continue Shopping</a>
        </div>
      </div>`;

    // Bind events
    cartContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => { removeFromCart(parseInt(btn.dataset.id)); renderCart(); updateNavBadges(); });
    });
    cartContainer.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => { updateCartQty(parseInt(btn.dataset.id), -1); renderCart(); updateNavBadges(); });
    });
    cartContainer.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => { updateCartQty(parseInt(btn.dataset.id), +1); renderCart(); updateNavBadges(); });
    });
  }

  renderCart();
  updateNavBadges();
}

function openCheckoutModal() {
  let overlay = document.getElementById('checkout-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'checkout-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Complete Your Order</h3>
          <button class="modal-close" onclick="document.getElementById('checkout-modal-overlay').classList.remove('active')">✕</button>
        </div>
        <form id="checkout-form">
          <div class="form-group"><label>Full Name</label><input name="fullName" type="text" placeholder="Rahul Sharma" required/></div>
          <div class="form-group"><label>Email Address</label><input name="email" type="email" placeholder="rahul@example.com" required/></div>
          <div class="form-group"><label>Phone Number</label><input name="phone" type="tel" placeholder="+91 98765 43210" required/></div>
          <div class="form-group"><label>Delivery Address</label><textarea name="address" placeholder="House No., Street, City, State, PIN" required></textarea></div>
          <div class="form-group"><label>Payment Method</label>
            <select name="paymentMethod" required>
              <option value="">Select payment method</option>
              <option>UPI / Google Pay</option>
              <option>Credit / Debit Card</option>
              <option>Net Banking</option>
              <option>Cash on Delivery</option>
            </select>
          </div>
          <button type="submit" style="width:100%;justify-content:center;">🎉 Place Order</button>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    overlay.querySelector('#checkout-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const payload = {
        name: form.fullName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim(),
        paymentMethod: form.paymentMethod.value,
        items: getCart(),
      };
      try {
        const response = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to place order');
        setCart([], { skipSync: true });
        updateNavBadges();
        overlay.classList.remove('active');
        showToast('🎉', 'Order placed successfully!', data.orderId ? `Order #${data.orderId}` : 'We\'ll contact you soon');
        setTimeout(() => { window.location.reload(); }, 1500);
      } catch (error) {
        showToast('⚠', 'Order failed', error.message || 'Please try again');
      }
    });
  }
  overlay.classList.add('active');
}

// =============================================
// FAVOURITES PAGE
// =============================================

async function initFavouritesPage() {
  await ensureLaptopsLoaded();
  const container = document.getElementById('favourites-container');
  if (!container) return;

  function render() {
    const liked = getLiked();
    if (liked.length === 0) {
      container.innerHTML = `
        <div class="fav-empty">
          <span class="empty-icon">🤍</span>
          <h2>No favourites yet</h2>
          <p style="color:var(--text-muted);margin-bottom:2rem;">Browse laptops and click the heart icon to save your favourites!</p>
          <a href="shop.html" class="btn btn-primary">Browse Laptops →</a>
        </div>`;
      return;
    }
    const laptopList = LAPTOPS.filter(l => liked.includes(l.id));
    const grid = document.createElement('div');
    grid.className = 'laptop-cards';
    laptopList.forEach(l => {
      grid.appendChild(createLaptopCard(l, {
        onLikeChange: (id, nowLiked) => {
          if (!nowLiked) { render(); }
        }
      }));
    });
    container.innerHTML = '';
    container.appendChild(grid);
  }

  render();
  updateNavBadges();
}

// =============================================
// COMPARE PAGE
// =============================================

async function initComparePage() {
  await ensureLaptopsLoaded();
  const container = document.getElementById('compare-container');
  if (!container) return;
  renderComparePage(container);
  updateNavBadges();
}

function renderComparePage(container) {
  const compareIds = getCompare();
  const MAX = 3;

  // Building the header cards row
  const slots = Array.from({ length: MAX }, (_, i) => compareIds[i] ?? null);

  const specKeys = ['CPU', 'GPU', 'RAM', 'Storage', 'Display', 'Battery', 'Weight'];
  const laptopsInCompare = slots.map(id => id ? LAPTOPS.find(l => l.id === id) : null);

  // Determine best/worst for price
  const prices = laptopsInCompare.filter(Boolean).map(l => l.price);
  const minPrice = Math.min(...prices);

  const headerCols = slots.map((id, i) => {
    if (!id) {
      return `<th><div class="compare-select-area" onclick="window.location.href='shop.html'">
        <span class="plus-icon">➕</span>
        Add from Shop
      </div></th>`;
    }
    const l = LAPTOPS.find(x => x.id === id);
    if (!l) return '<th></th>';
    return `<th>
      <div class="compare-laptop-header">
        <button class="compare-remove-btn" data-id="${id}">✕</button>
        <img src="${l.image}" alt="${l.name}" onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'"/>
        <h4>${l.name}</h4>
        <span class="price">₹${l.price.toLocaleString()}</span>
        <div style="display:flex;gap:0.4rem;margin-top:0.8rem;flex-wrap:wrap;justify-content:center;">
          <button class="btn btn-accent btn-sm" onclick="addToCart(${id});updateNavBadges();showToast('🛒','Added to Cart!')">🛒 Cart</button>
        </div>
      </div>
    </th>`;
  }).join('');

  const specRows = specKeys.map(key => {
    const vals = laptopsInCompare.map(l => l?.specsFull?.[key] ?? '—');
    const cells = slots.map((id, i) => {
      const val = laptopsInCompare[i]?.specsFull?.[key] ?? '—';
      return `<td>${val}</td>`;
    }).join('');
    return `<tr><th>${key}</th>${cells}</tr>`;
  }).join('');

  const priceRow = `<tr>
    <th>Price</th>
    ${slots.map((id, i) => {
      const l = laptopsInCompare[i];
      if (!l) return '<td>—</td>';
      const isBest = l.price === minPrice && prices.length > 1;
      return `<td class="${isBest ? 'compare-best' : ''}">₹${l.price.toLocaleString()}${isBest ? ' 🏆' : ''}</td>`;
    }).join('')}
  </tr>`;

  const ratingRow = `<tr>
    <th>Rating</th>
    ${slots.map((id, i) => {
      const l = laptopsInCompare[i];
      if (!l) return '<td>—</td>';
      return `<td>${l.rating}⭐ (${l.reviews} reviews)</td>`;
    }).join('')}
  </tr>`;

  container.innerHTML = compareIds.length === 0
    ? `<div class="empty-state" style="text-align:center;padding:5rem 2rem;">
        <span class="icon">⚖️</span>
        <h3>No laptops to compare</h3>
        <p style="color:var(--text-muted);margin-bottom:2rem;">Go to the shop and click ⚖️ on laptops to compare them side-by-side.</p>
        <a href="shop.html" class="btn btn-primary">Browse Laptops →</a>
      </div>`
    : `<div class="compare-table-wrap">
        <table class="compare-table">
          <thead><tr><th>Specification</th>${headerCols}</tr></thead>
          <tbody>
            ${priceRow}
            ${ratingRow}
            ${specRows}
          </tbody>
        </table>
      </div>`;

  // Remove compare buttons
  container.querySelectorAll('.compare-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      let c = getCompare().filter(x => x !== parseInt(btn.dataset.id));
      setCompare(c);
      renderComparePage(container);
    });
  });
}

// =============================================
// HOME PAGE
// =============================================

async function initHomePage() {
  await ensureLaptopsLoaded();
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid) {
    const featured = LAPTOPS.slice(0, 3);
    featured.forEach(l => featuredGrid.appendChild(createLaptopCard(l)));
  }

  // Newsletter
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const email = (emailInput?.value || '').trim();
      if (!email) {
        showToast('⚠', 'Enter an email', 'Please provide an email address');
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/newsletter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Subscription failed');
        showToast('✅', 'Subscribed!', `Welcome, ${email}`);
        newsletterForm.reset();
      } catch (error) {
        showToast('⚠', 'Subscription failed', error.message || 'Please try again later');
      }
    });
  }

  updateNavBadges();

  // Animated counter for stats
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseInt(el.dataset.target || 0);
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}

// =============================================
// CONTACT PAGE
// =============================================

function initContactPage() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: contactForm.fullName.value.trim(),
        email: contactForm.email.value.trim(),
        phone: contactForm.phone.value.trim(),
        subject: contactForm.subject.value,
        message: contactForm.message.value.trim(),
      };
      try {
        const response = await fetch(`${API_BASE}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to send message');
        showToast('✅', 'Message Sent!', "We'll reply within 24 hours");
        contactForm.reset();
      } catch (error) {
        showToast('⚠', 'Message failed', error.message || 'Please try again later');
      }
    });
  }
  updateNavBadges();
}

// =============================================
// SERVICES PAGE
// =============================================

function initServicesPage() {
  const serviceForm = document.getElementById('service-request-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: serviceForm.name.value.trim(),
        phone: serviceForm.phone.value.trim(),
        email: serviceForm.email.value.trim(),
        brandModel: serviceForm.brandModel.value.trim(),
        service: serviceForm.service.value,
        details: serviceForm.details.value.trim(),
      };
      try {
        const response = await fetch(`${API_BASE}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to submit request');
        showToast('✅', 'Request Submitted!', "We'll contact you soon");
        serviceForm.reset();
      } catch (error) {
        showToast('⚠', 'Request failed', error.message || 'Please try again later');
      }
    });
  }
  updateNavBadges();
}

// =============================================
// ABOUT PAGE
// =============================================

function initAboutPage() {
  updateNavBadges();
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseInt(el.dataset.target || 0);
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString() + (el.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}






