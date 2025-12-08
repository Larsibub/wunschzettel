// --- 1. DATENHALTUNG (Model) ---
// Hier trägst du deine Wünsche ein.
// category: 'tech', 'home', 'hobby' (muss zu den Buttons im HTML passen)
const wishData = [
    {
        id: 1,
        title: "Mechanische Tastatur",
        price: 149.99,
        category: "tech",
        rank: 5,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=60",
        description: "Keychron K2, Brown Switches. Brauche ich dringend fürs Coden.",
        link: "https://example.com",
        done: false
    },
    {
        id: 2,
        title: "Ergonomischer Stuhl",
        price: 350.00,
        category: "home",
        rank: 4,
        image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=500&q=60",
        description: "Mein Rücken bringt mich sonst um. Herman Miller wäre ein Traum.",
        link: "https://example.com",
        done: false
    },
    {
        id: 3,
        title: "Raspberry Pi 5",
        price: 90.50,
        category: "tech",
        rank: 3,
        image: "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=500&q=60",
        description: "Für das Home-Server Projekt und C-Übungen.",
        link: "https://example.com",
        done: true // Schon gekauft/erledigt
    },
    {
        id: 4,
        title: "Laufschuhe",
        price: 120.00,
        category: "hobby",
        rank: 2,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60",
        description: "Zum Ausgleich neben dem Studium.",
        link: "https://example.com",
        done: false
    }
];

// Aktueller Filter-Status (Global State)
let currentFilter = 'all';


// --- 2. LOGIK & HELPER FUNCTIONS ---

// Währung formatieren (Euro)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Sterne generieren (wie in Version 1, aber als Funktion die String zurückgibt)
const getStarsHTML = (rank) => {
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += i < rank ? '★' : '☆';
    }
    return html;
};

// Gesamtpreis berechnen
// Summiert nur Wünsche, die NICHT 'done' sind und im aktuellen Filter sichtbar sind.
const calculateTotal = (items) => {
    // Filterlogik für die Berechnung: Nur Items, die nicht erledigt sind
    const openItems = items.filter(item => !item.done);
    
    // Reduce ist wie eine Accumulator-Schleife in C
    const total = openItems.reduce((sum, item) => sum + item.price, 0);
    
    document.getElementById('total-price').innerText = formatCurrency(total);
};


// --- 3. RENDER ENGINE (View) ---

const renderWishes = () => {
    const grid = document.getElementById('wish-grid');
    grid.innerHTML = ''; // Canvas leeren

    // 1. Filtern
    let filteredData = wishData;
    if (currentFilter !== 'all') {
        filteredData = wishData.filter(item => item.category === currentFilter);
    }

    // 2. Iterieren und HTML bauen
    filteredData.forEach(item => {
        // Karte erstellen
        const card = document.createElement('article');
        card.className = `wish-card ${item.done ? 'done' : ''}`;
        
        // Template String für den Inhalt
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
                    <a href="${item.link}" target="_blank" class="btn btn-link">Ansehen</a>
                    <button class="btn btn-check" onclick="toggleStatus(${item.id})">
                        ${item.done ? 'Erledigt ✓' : 'Als erledigt markieren'}
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });

    // Preis neu berechnen basierend auf dem aktuellen View
    calculateTotal(filteredData);
};


// --- 4. CONTROLLER / EVENTS ---

// Status ändern (Wird vom Button onclick aufgerufen)
window.toggleStatus = (id) => {
    // Finde das Item im Array (wie Pointer-Suche)
    const item = wishData.find(w => w.id === id);
    if (item) {
        item.done = !item.done; // Boolean flippen
        renderWishes(); // UI neu zeichnen (Re-Render)
    }
};

// Filter Buttons Event Listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Active Klasse verschieben
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Filter setzen und neu rendern
        currentFilter = e.target.getAttribute('data-filter');
        renderWishes();
    });
});

// Initiale Ausführung beim Laden
document.addEventListener('DOMContentLoaded', renderWishes);