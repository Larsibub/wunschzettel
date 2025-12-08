// --- 1. DATENHALTUNG (Model) ---
const wishData = [
    {
        id: 1,
        title: "Samsung 980 Pro",
        price: 300.00,
        category: "tech",
        rank: 2,
        shop: "Geizhals",
        link: "https://geizhals.de/samsung-ssd-980-pro-2tb-mz-v8p2t0bw-a2454607.html", 
        image: "https://m.media-amazon.com/images/I/812DsfxDSVL._AC_UF350,350_QL80_.jpg",
        description: "M.2 SSD mit 2 Terrabyte (aktuell sehr teuer)",
        done: false // Standardwert, wird ggf. durch localStorage überschrieben
    },
    {
        id: 2,
        title: "Staedtler Noris Digital Jumbo",
        price: 35.54,
        category: "tech",
        rank: 4,
        shop: "Galaxus",
        link: "https://www.galaxus.de/de/s1/product/staedtler-noris-digital-jumbo-stylus-14676787?supplier=2705624&utm_source=google&utm_medium=cpc&utm_campaign=Prod_DE_Pmax_M5_C3_T31&campaignid=21735140291&adtype=pla&adgroupid=&adid=&dgCidg=Cj0KCQiAi9rJBhCYARIsALyPDtsAM3Di3S4qc7JE7wFvMot8nuedNQYxJsDNuejmNHZMeOAy-8SaR-0aAqjWEALw_wcB&gclsrc=aw.ds&gad_source=1&gad_campaignid=21728839119&gbraid=0AAAAAC7ye-5zhL2pBF9J1xIGdP54SOwj5&gclid=Cj0KCQiAi9rJBhCYARIsALyPDtsAM3Di3S4qc7JE7wFvMot8nuedNQYxJsDNuejmNHZMeOAy-8SaR-0aAqjWEALw_wcB",
        image: "https://static01.galaxus.com/productimages/5/1/5/7/2/2/6/3/4/4/6/7/9/1/6/9/5/4/8/019ae3ef-e4ec-76f3-8f47-89282e4602b0_720.avif",
        description: "Zum schreiben auf dem Galaxy Book",
        done: false
    },
    {
        id: 3,
        title: "Raspberry Pi 5",
        price: 90.50,
        category: "tech",
        rank: 3,
        shop: "BerryBase",
        link: "https://berrybase.de/...",
        image: "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=500&q=60",
        description: "Für Home-Server Projekte.",
        done: false
    },
    {
        id: 4,
        title: "Air Force",
        price: 120.00,
        category: "else",
        rank: 5,
        shop: "Nike",
        link: "https://www.nike.com/de/t/air-force-1-07-herrenschuh-E5NnNyBr/CW2288-111",
        image: "https://m.media-amazon.com/images/I/618FhFPg8+L._AC_UY900_.jpg",
        description: "Nike Air Force (EU: 'Größe')",
        done: false
    }
];

let currentFilter = 'all';

// --- NEU: PERSISTENZ (LocalStorage) ---

// Speichert eine Liste der IDs, die erledigt sind
// Vergleichbar mit dem Schreiben eines Arrays in eine .dat Datei
const saveStatus = () => {
    // Wir filtern nur die Items, die 'true' sind und mapen sie auf ihre ID
    // Ergebnis z.B.: [1, 3]
    const doneIds = wishData
        .filter(item => item.done)
        .map(item => item.id);
        
    localStorage.setItem('wishlist_done_ids', JSON.stringify(doneIds));
};

// Lädt die IDs beim Start und aktualisiert das wishData Array
const loadStatus = () => {
    const storedString = localStorage.getItem('wishlist_done_ids');
    
    if (storedString) {
        const doneIds = JSON.parse(storedString); // String zu Array [1, 3]
        
        // Wir iterieren über unsere Daten und gleichen ab
        wishData.forEach(item => {
            // Wenn die ID im gespeicherten Array ist, setze done auf true
            if (doneIds.includes(item.id)) {
                item.done = true;
            }
        });
    }
};


// --- 2. LOGIK & HELPER ---

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getStarsHTML = (rank) => {
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += i < rank ? '★' : '☆';
    }
    return html;
};

const calculateTotal = (items) => {
    const openItems = items.filter(item => !item.done);
    const total = openItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-price').innerText = formatCurrency(total);
};


// --- 3. RENDER ENGINE ---

const renderWishes = () => {
    const grid = document.getElementById('wish-grid');
    grid.innerHTML = ''; 

    let filteredData = wishData;
    if (currentFilter !== 'all') {
        filteredData = wishData.filter(item => item.category === currentFilter);
    }

    filteredData.forEach(item => {
        const card = document.createElement('article');
        // Hier prüfen wir das Status-Bit für die CSS-Klasse
        card.className = `wish-card ${item.done ? 'done' : ''}`;
        
        // Shop Anzeige Logik (Fallback falls leer)
        const shopText = item.shop ? item.shop : 'Zum Produkt';

        card.innerHTML = `
            <div class="image-container">
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
                        ${shopText}
                    </a>
                    <button class="btn btn-check" onclick="toggleStatus(${item.id})">
                        ${item.done ? 'Erledigt ✓' : 'Als erledigt markieren'}
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });

    calculateTotal(filteredData);
};


// --- 4. CONTROLLER / EVENTS ---

window.toggleStatus = (id) => {
    const item = wishData.find(w => w.id === id);
    if (item) {
        item.done = !item.done; 
        
        // WICHTIG: Nach Änderung sofort speichern
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
    // Zuerst Speicher laden und Daten updaten
    loadStatus();
    // Dann rendern
    renderWishes();
});