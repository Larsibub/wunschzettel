// --- 1. KONFIGURATION & STATE ---

const MAX_BUDGET = 300.00;

// Array startet leer, wird durch fetch gefüllt
let wishData = []; 
let currentFilter = 'all';

// --- 2. ASYNC DATA LOADING (I/O) ---

const fetchData = async () => {
    const grid = document.getElementById('wish-grid');
    
    // 1. Skeletons anzeigen (Dummy Cards)
    grid.innerHTML = '';
    for(let i=0; i<4; i++) { // 4 Platzhalter anzeigen
        grid.innerHTML += '<div class="skeleton-card"></div>';
    }

    try {
        // ... (Simuliere kurze Ladezeit, wenn du den Effekt sehen willst)
        // await new Promise(r => setTimeout(r, 800)); 
        
        const response = await fetch('wishes.json'); 
        const data = await response.json();
        
        wishData = data; 
        loadStatus();
        renderWishes(); // Dies überschreibt die Skeletons mit echten Daten
        
    } catch (error) {
        // ... Error Handling
    }
};

// --- 3. PERSISTENZ (LocalStorage) ---

const saveStatus = () => {
    const doneIds = wishData.filter(item => item.done).map(item => item.id);
    localStorage.setItem('wishlist_done_ids', JSON.stringify(doneIds));
};

const loadStatus = () => {
    const storedString = localStorage.getItem('wishlist_done_ids');
    if (storedString) {
        const doneIds = JSON.parse(storedString);
        wishData.forEach(item => {
            if (doneIds.includes(item.id)) item.done = true;
        });
    }
};

// --- 4. HELPER ---

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getStarsHTML = (rank) => {
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += i < rank ? '<span style="color:#ffcc00">★</span>' : '<span style="color:#444">☆</span>';
    }
    return html;
};

// NEU: Holt das Icon der Webseite (Favicon API)
const getFavicon = (url) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (e) {
        return ''; // Fallback, falls URL kaputt ist
    }
};

// --- 5. PROGRESS BAR (Budget verbraucht) ---

const updateProgressBar = (items) => {
    // 1. Nur "done" Items zählen (Ausgaben)
    const boughtItems = items.filter(item => item.done);
    const currentTotal = boughtItems.reduce((sum, item) => sum + item.price, 0);
    
    // 2. Prozent berechnen
    let percentage = (currentTotal / MAX_BUDGET) * 100;
    if (percentage > 100) percentage = 100;

    // 3. DOM Update
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');

    if(bar && text) {
        bar.style.width = percentage + "%";
        text.innerText = `${formatCurrency(currentTotal)} / ${formatCurrency(MAX_BUDGET)}`;
        
        if(currentTotal > MAX_BUDGET) {
            bar.style.backgroundColor = "#ff4444";
            bar.style.boxShadow = "0 0 10px #ff4444";
        } else {
            bar.style.backgroundColor = "var(--accent)";
            bar.style.boxShadow = "0 0 10px var(--accent-glow)";
        }
    }
};

// --- 6. RENDER ENGINE ---

const calculateTotal = (items) => {
    const openItems = items.filter(item => !item.done);
    const total = openItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-price').innerText = formatCurrency(total);
};

const renderWishes = () => {
    const grid = document.getElementById('wish-grid');
    grid.innerHTML = ''; 

    let filteredData = wishData;
    if (currentFilter !== 'all') {
        filteredData = wishData.filter(item => item.category === currentFilter);
    }

    filteredData.forEach(item => {
        const card = document.createElement('article');
        card.className = `wish-card ${item.done ? 'done' : ''}`;
        
        // 1. SHOP LOGIK: Text oder Icon?
        const shopText = item.shop ? item.shop : 'Zum Shop';
        const faviconUrl = getFavicon(item.link);
        
        // 2. PRIORITY LOGIK: Farbe und Text bestimmen
        // Default ist 'medium', falls nichts im JSON steht
        const priority = item.priority || 'medium'; 
        const priorityMap = {
            'high': 'Hoch',
            'medium': 'Mittel',
            'low': 'Niedrig'
        };
        const badgeLabel = priorityMap[priority];
        const badgeClass = `badge-${priority}`;

        card.innerHTML = `
            <div class="image-container">
                <span class="badge ${badgeClass}">${badgeLabel}</span>
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="content">
                <div class="meta-info">
                    <span class="price-tag">${formatCurrency(item.price)}</span>
                    <div class="stars">${getStarsHTML(item.rank)}</div>
                </div>
                
                <h2>${item.title}</h2>
                <p class="description">${item.description}</p>
                
                <div class="actions">
                    <a href="${item.link}" target="_blank" class="btn btn-link">
                        <img src="${faviconUrl}" class="shop-icon" onerror="this.style.display='none'">
                        ${shopText}
                    </a>
                    <button class="btn btn-check" onclick="toggleStatus(${item.id})">
                        ${item.done ? 'Erledigt ✓' : 'Markieren'}
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    calculateTotal(filteredData);
    updateProgressBar(wishData); 
};

// --- 7. CONTROLLER ---

window.toggleStatus = (id) => {
    const item = wishData.find(w => w.id === id);
    if (item) {
        item.done = !item.done; 
        saveStatus();
        renderWishes(); 
    }
};

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderWishes();
    });
});

// INITIALISIERUNG
document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Lädt JSON
});

