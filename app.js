// Инициализация VK Bridge
if (window.vkBridge) {
    vkBridge.send('VKWebAppInit').catch(console.error);
}

let currentFilter = 'all';
let searchQuery = '';
let minAge = 0;
let maxAge = 100;

const categories = [
    { id: 'all', label: 'Все', emoji: '' },
    { id: 'light', label: 'Лёгкие', emoji: '☀️' },
    { id: 'hot', label: 'Страстные', emoji: '🔥' },
    { id: 'dark', label: 'Тёмные', emoji: '🌙' },
    { id: 'adventure', label: 'Приключенческие', emoji: '🗡️' }
];

function init() {
    renderFilters();
    initAgeSlider();
    renderCharacters();

    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderCharacters();
    });
}

function renderFilters() {
    const container = document.getElementById('filters');
    container.innerHTML = '';
    const catRow = document.createElement('div');
    catRow.className = 'filter-row';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat.id === currentFilter ? ' active' : '');
        btn.textContent = `${cat.emoji} ${cat.label}`;
        btn.dataset.filter = cat.id;
        btn.dataset.type = 'category';
        btn.onclick = () => {
            currentFilter = cat.id;
            document.querySelectorAll('[data-type="category"]').forEach(b => b.classList.toggle('active', b.dataset.filter === cat.id));
            renderCharacters();
        };
        catRow.appendChild(btn);
    });
    container.appendChild(catRow);
}

function initAgeSlider() {
    const minInput = document.getElementById('minAge');
    const maxInput = document.getElementById('maxAge');
    const ageDisplay = document.getElementById('ageDisplay');

    function updateSlider() {
        if (parseInt(minInput.value) > parseInt(maxInput.value) - 1) {
            minInput.value = parseInt(maxInput.value) - 1;
        }
        minAge = parseInt(minInput.value);
        maxAge = parseInt(maxInput.value);

        const maxText = maxAge === 100 ? '100+' : maxAge;
        ageDisplay.textContent = `${minAge} — ${maxText}`;

        const minPercent = ((minAge - 0) / (100 - 0)) * 100;
        const maxPercent = ((maxAge - 0) / (100 - 0)) * 100;
        document.getElementById('ageTrack').style.left = `${minPercent}%`;
        document.getElementById('ageTrack').style.right = `${100 - maxPercent}%`;

        renderCharacters();
    }

    minInput.addEventListener('input', updateSlider);
    maxInput.addEventListener('input', updateSlider);
    updateSlider();
}

function getFilteredCharacters() {
    return charactersData.filter(char => {
        const matchesCategory = currentFilter === 'all' || char.category === currentFilter;

        // Магия: если возраст 9999 (вне возраста), он ВСЕГДА проходит фильтр
        const matchesAge = char.age === 9999 || (char.age >= minAge && char.age <= maxAge);

        const matchesSearch = !searchQuery ||
            char.name.toLowerCase().includes(searchQuery) ||
            char.description.toLowerCase().includes(searchQuery) ||
            char.tags.some(t => t.toLowerCase().includes(searchQuery));

        return matchesCategory && matchesAge && matchesSearch;
    });
}

function renderCharacters() {
    const grid = document.getElementById('charactersGrid');
    const stats = document.getElementById('stats');
    const filtered = getFilteredCharacters();

    stats.textContent = `Найдено: ${filtered.length} из ${charactersData.length}`;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">😿 Персонажи не найдены</div>';
        return;
    }

    grid.innerHTML = filtered.map(char => {
        const initials = char.name.replace(/[^\wа-яА-ЯёЁ]/g, '').substring(0, 2).toUpperCase() || '?';
        const hasImage = char.image && char.image.trim() !== '';

        // Отображение возраста: для 9999 показываем символ бесконечности
        const ageText = char.age === 9999 ? '∞' : `${char.age}`;

        const imageHtml = hasImage
            ? `<img src="${char.image}" alt="${char.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="image-fallback" style="display:none;">${initials}</div>`
            : `<div class="image-fallback">${initials}</div>`;

        return `
        <div class="character-card">
            <div class="character-image">${imageHtml}</div>
            <div class="character-header">
                <div class="character-name">${char.name}</div>
                <div class="badges">
                    <div class="character-position">#${char.position}</div>
                    <div class="character-age">${ageText}</div>
                </div>
            </div>
            <div class="character-description">${char.description}</div>
            <div class="character-tags">${char.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            
            <div class="command-wrapper">
                <input type="text" class="command-input" readonly value="/select ${char.slug}" onclick="this.select()" title="Выдели и скопируй">
                <button class="copy-btn" onclick="copyCommand('${char.slug}', this)">📋</button>
            </div>
        </div>`;
    }).join('');
}

function copyCommand(slug, btn) {
    const command = `/select ${slug}`;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(command).then(() => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '✅';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            btn.innerHTML = '✋';
            setTimeout(() => { btn.innerHTML = '📋'; }, 2000);
        });
    } else {
        btn.innerHTML = '✋';
        setTimeout(() => { btn.innerHTML = '📋'; }, 2000);
    }
}

init();