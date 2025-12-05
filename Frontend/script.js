// =============================
// 📌 Menu Toggle
// =============================
let menu = document.querySelector('#menu-bars');
let navbar = document.querySelector('.navbar');

if (menu) {
    menu.onclick = () => {
        menu.classList.toggle('fa-times');
        navbar.classList.toggle('active');
    };
}

// =============================
// 📌 Search Form Show / Hide
// =============================
let searchForm = document.querySelector('#search-form');
let searchBtn = document.querySelector('#search-icon');
let closeBtn = document.querySelector('#close');
let searchInput = document.querySelector('#search-box');
let searchResults = document.querySelector('#search-results');

function extractPrice(text) {
    if (!text) return 0;
    const numeric = String(text).replace(/[^\d.]/g, '');
    return numeric ? Number(numeric) : 0;
}

function collectDishData() {
    const dishCards = Array.from(document.querySelectorAll('.dishes .box')).map(card => {
        const detailBtn = card.querySelector('.view-details');
        const name = detailBtn?.getAttribute('data-name') || card.querySelector('h3')?.textContent || '';
        const priceAttr = detailBtn?.getAttribute('data-price');
        const price = priceAttr ? Number(priceAttr) : extractPrice(card.querySelector('.price')?.textContent);
        const description = detailBtn?.getAttribute('data-description') || card.querySelector('p')?.textContent || '';
        const image = detailBtn?.getAttribute('data-image') || card.querySelector('img')?.getAttribute('src') || '';
        return { name, price, description, image, element: card, type: 'dish' };
    });

    const heroSlides = Array.from(document.querySelectorAll('.home .slide')).map(slide => {
        const name = slide.querySelector('h3')?.textContent || '';
        const description = slide.querySelector('p')?.textContent || slide.querySelector('span')?.textContent || '';
        const price = Number(slide.getAttribute('data-price')) || 0;
        const image = slide.querySelector('.image img')?.getAttribute('src') || '';
        return { name, price, description, image, element: slide, type: 'hero' };
    });

    return [...dishCards, ...heroSlides].filter(item => item.name);
}

let dishDataset = collectDishData();

if (searchBtn) {
    searchBtn.onclick = () => {
        if (searchForm) searchForm.style.display = 'flex';
        dishDataset = collectDishData();
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        if (searchResults) {
            searchResults.innerHTML = '<p class="search-empty">Start typing to discover dishes...</p>';
        }
    };
}

if (closeBtn) {
    closeBtn.onclick = () => {
        if (searchForm) searchForm.style.display = 'none';
        if (searchResults) searchResults.innerHTML = '';
    };
}

function createThumbMarkup(image, name) {
    if (image) {
        return `<img src="${image}" alt="${name}">`;
    }
    const letter = name ? name.charAt(0).toUpperCase() : '?';
    return `<span class="placeholder">${letter}</span>`;
}

function renderSearchResults(term) {
    if (!searchResults) return;
    const keyword = term.trim().toLowerCase();
    if (!keyword) {
        searchResults.innerHTML = '<p class="search-empty">Start typing to discover dishes...</p>';
        return;
    }

    const matches = dishDataset.filter(item =>
        (item.name || '').toLowerCase().includes(keyword) ||
        (item.description || '').toLowerCase().includes(keyword)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = `<p class="search-empty">No dishes found for "${term}".</p>`;
        return;
    }

    searchResults.innerHTML = matches.map(item => `
        <article class="search-result" data-name="${item.name}">
            <div class="search-result__thumb">${createThumbMarkup(item.image, item.name)}</div>
            <div class="search-result__body">
                <h4>${item.name}</h4>
                <p>${item.description || 'No description available.'}</p>
                <div class="search-result__meta">${item.price ? `${item.price} TK` : 'Featured Dish'}</div>
            </div>
            <div class="search-result__actions">
                <button type="button"
                    class="btn search-result__add"
                    data-name="${item.name}"
                    data-price="${item.price}"
                    data-image="${item.image}">Add</button>
            </div>
        </article>
    `).join('');
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));
}

if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (searchInput) {
            renderSearchResults(searchInput.value);
        }
    });
}

if (searchResults) {
    searchResults.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.search-result__add');
        if (addBtn) {
            const detail = {
                name: addBtn.getAttribute('data-name'),
                price: Number(addBtn.getAttribute('data-price')) || 0,
                image: addBtn.getAttribute('data-image') || ''
            };
            document.dispatchEvent(new CustomEvent('cart:add', { detail }));
            return;
        }

        const card = e.target.closest('.search-result');
        if (card) {
            const name = card.getAttribute('data-name');
            const target = dishDataset.find(item => item.name === name)?.element;
            if (target) {
                if (searchForm) searchForm.style.display = 'none';
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('highlight');
                setTimeout(() => target.classList.remove('highlight'), 1200);
            }
        }
    });
}

// =============================
// 📌 Initialize Swiper Slider
// =============================
window.addEventListener('DOMContentLoaded', () => {
    // Wait for Swiper to be fully loaded
    setTimeout(() => {
        if (typeof Swiper !== 'undefined') {
            const homeSwiper = new Swiper('.home-slider', {
                loop: true,
                grabCursor: true,
                spaceBetween: 20,
                centeredSlides: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                    reverseDirection: false
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev'
                },
                slidesPerView: 1,
                effect: 'slide',
                speed: 500,
                observer: true,
                observeParents: true
            });
        } else {
            console.error('Swiper library not loaded');
        }
    }, 100);
});

// =============================
// 📌 Close menu on scroll
// =============================
window.onscroll = () => {
    if (menu && navbar) {
        menu.classList.remove('fa-times');
        navbar.classList.remove('active');
    }
};

// =============================
// Local storage helpers for profiles & orders (kept for compatibility fallback)
// =============================
const LEGACY_PROFILE_KEY = 'hungry_customer_profile';
const PROFILES_KEY = 'hungry_profiles_v1';
const ACTIVE_USER_KEY = 'hungry_active_user_v1';
const ORDER_HISTORY_KEY = 'hungry_orders_history_v1';
const HUNGRY_API_BASE = window.__HUNGRY_API_BASE__ || 'http://192.168.68.100:5000';
window.__HUNGRY_API_BASE__ = HUNGRY_API_BASE;

function saveProfiles(list) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
}

function loadProfiles() {
    let list = [];
    try {
        const raw = localStorage.getItem(PROFILES_KEY);
        list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
    } catch (_) {
        list = [];
    }
    try {
        const legacyRaw = localStorage.getItem(LEGACY_PROFILE_KEY);
        if (legacyRaw) {
            const legacyProfile = JSON.parse(legacyRaw);
            if (legacyProfile?.email && !list.some(p => p.email === legacyProfile.email)) {
                list.push(legacyProfile);
                saveProfiles(list);
                setActiveUserEmail(legacyProfile.email);
            }
            localStorage.removeItem(LEGACY_PROFILE_KEY);
        }
    } catch (_) {
        // ignore migration issues
    }
    return list;
}

function getActiveUserEmail() {
    return localStorage.getItem(ACTIVE_USER_KEY) || '';
}

function setActiveUserEmail(email) {
    if (email) {
        localStorage.setItem(ACTIVE_USER_KEY, email);
    } else {
        localStorage.removeItem(ACTIVE_USER_KEY);
    }
}

function getActiveProfile() {
    const email = getActiveUserEmail();
    if (!email) return null;
    return loadProfiles().find(profile => profile.email === email) || null;
}

function loadOrderHistoryMap() {
    try {
        const raw = localStorage.getItem(ORDER_HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
        return {};
    }
}

function saveOrderHistoryMap(map) {
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(map));
}

function appendOrderHistory(email, order) {
    const map = loadOrderHistoryMap();
    if (!map[email]) map[email] = [];
    map[email].push(order);
    saveOrderHistoryMap(map);
}

// =============================
// 🛒 Cart with localStorage
// =============================
(function initCart() {
    const CART_KEY = 'hungry_cart_v1';
    const API_BASE = HUNGRY_API_BASE;
    const cartToggle = document.querySelector('#cart-toggle');
    const cartPanel = document.querySelector('#cart-panel');
    const cartClose = document.querySelector('#cart-close');
    const cartItemsEl = document.querySelector('#cart-items');
    const cartTotalEl = document.querySelector('#cart-total');
    const cartCountEl = document.querySelector('#cart-count');
    const cartClearBtn = document.querySelector('#cart-clear');
    const cartOrderBtn = document.querySelector('#cart-order');
    const addButtons = document.querySelectorAll('.add-to-cart');

    if (!cartToggle || !cartPanel || !cartItemsEl || !cartTotalEl || !cartCountEl) {
        return; // Cart UI not present
    }

    let cart = loadCart();

    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed)
                ? parsed.map(item => ({ ...item, image: item.image || '' }))
                : [];
        } catch (_) {
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function getTotalCount() {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function getTotalPrice() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function getFallbackImage(el) {
        const box = el.closest('.box');
        const img = box ? box.querySelector('img') : null;
        return img ? img.getAttribute('src') : '';
    }

    function emitCartChanged() {
        document.dispatchEvent(new CustomEvent('cart:changed', {
            detail: { cart: cart.map(item => ({ ...item })) }
        }));
    }

    function renderCart() {
        cartItemsEl.innerHTML = '';
        cart.forEach((item, index) => {
            const thumb = createThumbMarkup(item.image, item.name);
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <div class="thumb">${thumb}</div>
                <div class="info">
                    <div class="name">${item.name}</div>
                    <div class="price">${item.price} TK</div>
                </div>
                <div class="qty">
                    <button data-action="dec" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button data-action="inc" data-index="${index}">+</button>
                </div>
                <button class="remove" data-action="remove" data-index="${index}">Remove</button>
            `;
            cartItemsEl.appendChild(row);
        });
        cartTotalEl.textContent = String(getTotalPrice());
        cartCountEl.textContent = String(getTotalCount());
        emitCartChanged();
    }

    function addItem(name, price, image) {
        const existing = cart.find(i => i.name === name && i.price === price);
        if (existing) {
            existing.quantity += 1;
            if (!existing.image && image) {
                existing.image = image;
            }
        } else {
            cart.push({ name, price, quantity: 1, image });
        }
        saveCart();
        renderCart();
    }

    function updateQty(index, delta) {
        const item = cart[index];
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        renderCart();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

    // Event wiring
    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        cartPanel.classList.toggle('active');
        cartPanel.setAttribute('aria-hidden', cartPanel.classList.contains('active') ? 'false' : 'true');
    });

    if (cartClose) {
        cartClose.addEventListener('click', () => {
            cartPanel.classList.remove('active');
            cartPanel.setAttribute('aria-hidden', 'true');
        });
    }

    if (cartClearBtn) {
        cartClearBtn.addEventListener('click', () => {
            cart = [];
            saveCart();
            renderCart();
        });
    }

    if (cartOrderBtn) {
        cartOrderBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                alert('Your cart is empty. Add some dishes first!');
                return;
            }
            
            // Check backend login status
            try {
                const res = await fetch(API_BASE + '/api/auth/profile', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                const body = await res.json();
                
                if (!res.ok || !body.success || !body.user) {
                    alert('Please sign in or sign up before placing an order.');
                    window.location.href = 'Auth.html';
                    return;
                }
            } catch (err) {
                alert('Please sign in or sign up before placing an order.');
                window.location.href = 'Auth.html';
                return;
            }
            
            saveCart();
            cartPanel.classList.remove('active');
            cartPanel.setAttribute('aria-hidden', 'true');
            window.location.href = 'Order.html';
        });
    }

    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = Number(btn.getAttribute('data-price')) || 0;
            const image = btn.getAttribute('data-image') || getFallbackImage(btn);
            addItem(name, price, image);
        });
    });

    cartItemsEl.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const action = target.getAttribute('data-action');
        const index = Number(target.getAttribute('data-index'));
        if (Number.isNaN(index)) return;
        if (action === 'inc') updateQty(index, +1);
        if (action === 'dec') updateQty(index, -1);
        if (action === 'remove') removeItem(index);
    });

    document.addEventListener('cart:add', (e) => {
        const detail = e.detail || {};
        if (!detail.name) return;
        addItem(detail.name, Number(detail.price) || 0, detail.image || '');
    });

    // Initial render from storage
    renderCart();
})();

// =============================
// 👁️ Dish Detail Modal
// =============================
(function initDishModal() {
    const modal = document.querySelector('#dish-modal');
    const detailButtons = document.querySelectorAll('.view-details');
    const imgEl = document.querySelector('#dish-modal-image');
    const nameEl = document.querySelector('#dish-modal-name');
    const descEl = document.querySelector('#dish-modal-desc');
    const priceEl = document.querySelector('#dish-modal-price');
    const closeBtn = document.querySelector('.dish-modal__close');
    const addBtn = document.querySelector('#modal-add-cart');
    const buyBtn = document.querySelector('#modal-buy-now');
    const cartPanel = document.querySelector('#cart-panel');

    if (!modal || detailButtons.length === 0) return;

    let currentDish = null;

    function openModal(data) {
        currentDish = data;
        if (imgEl) {
            imgEl.src = data.image || '';
            imgEl.alt = data.name || 'Dish preview';
        }
        if (nameEl) nameEl.textContent = data.name || '';
        if (descEl) descEl.textContent = data.description || '';
        if (priceEl) priceEl.textContent = data.price ? String(data.price) : '0';
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    detailButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const data = {
                name: btn.getAttribute('data-name') || '',
                price: Number(btn.getAttribute('data-price')) || 0,
                image: btn.getAttribute('data-image') || btn.closest('.box')?.querySelector('img')?.getAttribute('src') || '',
                description: btn.getAttribute('data-description') || ''
            };
            openModal(data);
        });
    });

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (!currentDish) return;
            document.dispatchEvent(new CustomEvent('cart:add', { detail: currentDish }));
            closeModal();
        });
    }

    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            if (!currentDish) return;
            document.dispatchEvent(new CustomEvent('cart:add', { detail: currentDish }));
            closeModal();
            cartPanel.classList.add('active');
            cartPanel.setAttribute('aria-hidden', 'false');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
})();

// =============================
// 📝 Order Form enhancements
// =============================
(function initOrderForm() {
    const form = document.querySelector('#order-form');
    if (!form) return;

    const API_BASE = window.__HUNGRY_API_BASE__ || 'http://localhost:5000';
    const CART_KEY = 'hungry_cart_v1';
    const summaryDelivery = document.querySelector('#summary-delivery');
    const summaryItemsEl = document.querySelector('#summary-items');
    const summaryTotalEl = document.querySelector('#summary-total');
    const historyListEl = document.querySelector('#order-history-list');
    const historyEmptyEl = document.querySelector('#order-history-empty');

    let latestCartSnapshot = [];
    let backendUser = null;

    function loadCartSnapshot() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed)
                ? parsed.map(item => ({ ...item, image: item.image || '' }))
                : [];
        } catch (_) {
            return [];
        }
    }

    async function apiFetch(path, opts = {}) {
        const res = await fetch(API_BASE + path, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            ...opts
        });
        const body = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, body };
    }

    function getCurrentProfile() {
        return backendUser || getActiveProfile();
    }

    function prefillFromProfile() {
        const profile = backendUser;
        if (!profile) return;
        
        // Auto-fill all user fields
        const fields = ['fullName','email','address','address2','city','postal'];
        fields.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input && profile[name]) {
                input.value = profile[name];
            }
        });
        
        // Handle phone number (remove +880 prefix for input)
        const phoneInput = form.querySelector('[name="phone"]');
        if (phoneInput && profile.phone) {
            phoneInput.value = profile.phone.replace(/^\+?880/, '');
        }
    }

    function renderCartSummary(cartData = loadCartSnapshot()) {
        if (!summaryItemsEl) return;
        latestCartSnapshot = cartData;
        if (!cartData.length) {
            summaryItemsEl.innerHTML = '<p class="summary-empty">Your cart is empty. Go back and add some dishes!</p>';
            if (summaryTotalEl) summaryTotalEl.textContent = '0 TK';
            return;
        }

        summaryItemsEl.innerHTML = cartData.map(item => `
            <div class="summary-item">
                <div>
                    <p class="summary-item__name">${item.name}</p>
                    <span class="summary-item__meta">${item.quantity} × ${item.price} TK</span>
                </div>
                <strong>${item.quantity * item.price} TK</strong>
            </div>
        `).join('');

        const total = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (summaryTotalEl) summaryTotalEl.textContent = `${total} TK`;
    }

    function formatOrderItems(items) {
        if (!Array.isArray(items)) return '';
        return items.map(item => {
            if (typeof item === 'object' && item.name) {
                return `${item.quantity || 1} × ${item.name}`;
            }
            if (typeof item === 'string') {
                return item;
            }
            return 'Unknown item';
        }).join(', ');
    }

    async function renderOrderHistory() {
        if (!historyListEl) return;
        if (!backendUser) {
            historyListEl.innerHTML = '';
            if (historyEmptyEl) {
                historyEmptyEl.textContent = 'Sign in to view your previous orders.';
                historyEmptyEl.style.display = 'block';
            }
            return;
        }

        if (historyEmptyEl) {
            historyEmptyEl.textContent = 'Loading your previous orders...';
            historyEmptyEl.style.display = 'block';
        }
        historyListEl.innerHTML = '';

        try {
            const { ok, body } = await apiFetch('/api/orders/my', { method: 'GET' });
            if (ok && body.success && Array.isArray(body.orders) && body.orders.length) {
                if (historyEmptyEl) historyEmptyEl.style.display = 'none';
                historyListEl.innerHTML = body.orders.slice().reverse().map(order => {
                    const placedAt = new Date(order.date || order.placedAt || order.createdAt || Date.now());
                    const formatted = placedAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                    return `
                        <div class="history-item">
                            <div>
                                <p class="history-item__title">Order #${order._id || order.id || ''}</p>
                                <p class="history-item__meta">${formatted} • ${formatOrderItems(order.items || [])}</p>
                            </div>
                            <strong>${order.total ?? 0} TK</strong>
                        </div>
                    `;
                }).join('');
            } else {
                if (historyEmptyEl) {
                    historyEmptyEl.textContent = 'No orders yet. Place your first order to see it here.';
                    historyEmptyEl.style.display = 'block';
                }
            }
        } catch (err) {
            console.error('Order history error', err);
            if (historyEmptyEl) {
                historyEmptyEl.textContent = 'Could not load orders. Please try again.';
                historyEmptyEl.style.display = 'block';
            }
        }
    }

    function updateSummary() {
        const data = new FormData(form);
        const date = data.get('deliveryDate') || '';
        if (summaryDelivery) {
            summaryDelivery.textContent = date ? date : '—';
        }
    }

    function clearCartStorage() {
        localStorage.setItem(CART_KEY, JSON.stringify([]));
        latestCartSnapshot = [];
        document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart: [] } }));
    }

    async function refreshBackendProfile() {
        try {
            const { ok, body } = await apiFetch('/api/auth/profile', { method: 'GET' });
            backendUser = (ok && body.success) ? body.user : null;
        } catch (_) {
            backendUser = null;
        }
    }

    renderCartSummary();
    renderOrderHistory();
    
    // Check if user is logged in on page load
    refreshBackendProfile().then(() => {
        if (!backendUser) {
            alert('Please log in to place an order.');
            window.location.href = 'Auth.html';
            return;
        }
        renderOrderHistory();
    });
    
    form.addEventListener('input', updateSummary);
    form.addEventListener('change', updateSummary);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        
        // Refresh profile if not loaded
        if (!backendUser) {
            await refreshBackendProfile();
        }
        
        // Check if user is logged in
        if (!backendUser) {
            alert('Please sign in to place an order.');
            window.location.href = 'Auth.html';
            return;
        }

        if (!latestCartSnapshot.length) {
            alert('Your cart is empty. Add some dishes before placing an order.');
            return;
        }

        const deliveryDate = data.get('deliveryDate') || '';
        const total = latestCartSnapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        // Clean and format items before sending
        const cleanItems = latestCartSnapshot.map(item => ({
            name: String(item.name || 'Unknown'),
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: String(item.image || '')
        }));
        
        try {
            const { ok, body } = await apiFetch('/api/orders/create', {
                method: 'POST',
                body: JSON.stringify({
                    items: cleanItems,
                    total,
                    deliveryDate,
                    instructions: data.get('instructions') || ''
                })
            });
            if (!ok || !body.success) {
                alert(body.message || 'Failed to place order. Please try again.');
                return;
            }
            await renderOrderHistory();
        } catch (err) {
            console.error('Order submit failed', err);
            alert('Failed to place order. Please try again.');
            return;
        }

        alert(`Thank you ${backendUser.fullName || 'User'}! Your order has been received. We'll confirm shortly.`);
        form.reset();
        clearCartStorage();
        renderCartSummary([]);
        updateSummary();
    });

    document.addEventListener('cart:changed', (e) => {
        if (!summaryItemsEl) return;
        renderCartSummary(e.detail?.cart || undefined);
    });

    updateSummary();
})();

// =============================
// 🔐 Auth Tab Switching
// =============================
(function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    if (!tabs.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target form, hide others
            forms.forEach(form => {
                if ('#' + form.id === target) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });
})();

// =============================
// 🔐 FIXED Auth Page (Signup / Login) - 100% Backend Compatible
// =============================
(function initAuthPageBackend() {
    const API_BASE = window.__HUNGRY_API_BASE__ || "http://localhost:5000";

    const signupForm = document.querySelector("#signup-form");
    const loginForm = document.querySelector("#login-form");

    const authSection = document.querySelector("#authSection");
    const profileSection = document.querySelector("#profileSection");

    const userNameEl = document.querySelector("#userName");
    const userEmailEl = document.querySelector("#userEmail");
    const userPhoneEl = document.querySelector("#userPhone");
    const userAddressEl = document.querySelector("#userAddress");

    const logoutBtn = document.querySelector("#logoutBtn");

    // Uniform API fetch wrapper
    async function apiFetch(path, opts = {}) {
        const res = await fetch(API_BASE + path, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            ...opts
        });
        const body = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, body };
    }

    // Show Auth forms
    function showAuthForms() {
        authSection?.removeAttribute("hidden");
        profileSection?.setAttribute("hidden", "");
    }

    // Show profile panel
    function showProfileUI(user) {
        authSection?.setAttribute("hidden", "");
        profileSection?.removeAttribute("hidden");

        userNameEl.textContent = user.fullName || "Unnamed User";
        userEmailEl.textContent = user.email || "—";
        userPhoneEl.textContent = user.phone || "—";
        userAddressEl.textContent = user.address || "—";
    }

    // Check login state
    async function checkProfileOnLoad() {
        try {
            const { ok, body } = await apiFetch("/api/auth/profile");
            if (ok && body.success && body.user) {
                showProfileUI(body.user);
            } else {
                showAuthForms();
            }
        } catch {
            showAuthForms();
        }
    }

    // =========================
    // SIGNUP
    // =========================
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = Object.fromEntries(new FormData(signupForm).entries());

            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postal: formData.postal
            };

            try {
                const { ok, body } = await apiFetch("/api/auth/signup", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                if (ok && body.success) {
                    alert("Signup successful! Please log in.");
                    // Switch to login tab
                    document.querySelector('.auth-tab[data-target="#login-form"]')?.click();
                } else {
                    alert(body.message || "Signup failed.");
                }
            } catch (err) {
                console.error("Signup error:", err);
                alert("Could not connect to server. Make sure the backend is running.");
            }
        });
    }

    // =========================
    // LOGIN
    // =========================
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const data = Object.fromEntries(new FormData(loginForm).entries());
            const { email, phone } = data;

            if (!email || !phone) {
                alert("Please enter email and phone number.");
                return;
            }

            try {
                const { ok, body } = await apiFetch("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ email, phone })
                });

                if (ok && body.success) {
                    window.location.href = "Dashboard.html";
                    return;
                } else {
                    alert(body.message || "Login failed.");
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Could not connect to server.");
            }
        });
    }

    // =========================
    // LOGOUT
    // =========================
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await apiFetch("/api/auth/logout", { method: "GET" });
            window.location.href = "Auth.html";
        });
    }
})();
