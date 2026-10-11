// ============================================
// ФИКСИРОВАННЫЕ КАТЕГОРИИ (ровно 5 кнопок)
// ============================================
const categories = [
    { id: 'all',       label: 'Все',              emoji: '' },
    { id: 'light',     label: 'Лёгкие',           emoji: '☀️' },
    { id: 'hot',       label: 'Страстные',        emoji: '🔥' },
    { id: 'dark',      label: 'Тёмные',           emoji: '🌙' },
    { id: 'adventure', label: 'Приключенческие',  emoji: '🗡️' }
];

// ============================================
// СОСТОЯНИЕ
// ============================================
let currentFilter = 'all';
let searchQuery = '';

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function init() {
    renderFilters();
    renderCharacters();
    attachEventListeners();
}

function attachEventListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderCharacters();
    });
}

// ============================================
// РЕНДЕР ФИЛЬТРОВ (фиксированный список)
// ============================================
function renderFilters() {
    const container = document.getElementById('filters');
    container.innerHTML = '';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat.id === currentFilter ? ' active' : '');
        btn.textContent = `${cat.emoji} ${cat.label}`;
        btn.dataset.filter = cat.id;
        btn.onclick = () => setFilter(cat.id);
        container.appendChild(btn);
    });
}

function setFilter(filter) {
    currentFilter = filter;

    // Обновляем визуальное состояние кнопок
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    renderCharacters();
}

// ============================================
// ФИЛЬТРАЦИЯ
// ============================================
function getFilteredCharacters() {
    return charactersData.filter(char => {
        const matchesCategory = currentFilter === 'all' || char.category === currentFilter;
        const matchesSearch = !searchQuery ||
            char.name.toLowerCase().includes(searchQuery) ||
            char.description.toLowerCase().includes(searchQuery) ||
            char.slug.toLowerCase().includes(searchQuery) ||
            char.tags.some(tag => tag.toLowerCase().includes(searchQuery));
        return matchesCategory && matchesSearch;
    });
}

// ============================================
// РЕНДЕР КАРТОЧЕК
// ============================================
function renderCharacters() {
    const grid = document.getElementById('charactersGrid');
    const stats = document.getElementById('stats');
    const filtered = getFilteredCharacters();

    stats.textContent = `Найдено: ${filtered.length} из ${charactersData.length}`;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">😿 Персонажи не найдены<br>Попробуйте изменить поиск или фильтр</div>';
        return;
    }

    grid.innerHTML = filtered.map(char => {
        const safeName = encodeURIComponent(char.name.replace(/[^\w\sа-яА-ЯёЁ]/g, '').substring(0, 15));
        const fallbackImage = `https://placehold.co/400x600/2c2d2e/71aaeb?text=${safeName}`;

        return `
        <div class="character-card">
            <div class="character-image">
                <img src="${char.image || fallbackImage}" alt="${char.name}"
                     onerror="this.src='${fallbackImage}'; this.onerror=null;">
            </div>
            <div class="character-header">
                <div class="character-name">${char.name}</div>
                <div class="character-position">#${char.position}</div>
            </div>
            <div class="character-description">${char.description}</div>
            <div class="character-tags">
                ${char.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <button class="copy-btn" data-slug="${char.slug}">
                📋 Скопировать: /select ${char.slug}
            </button>
        </div>
    `}).join('');

    // Навешиваем обработчики на кнопки копирования
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.onclick = () => copyCommand(btn.dataset.slug, btn);
    });
}

// ============================================
// КОПИРОВАНИЕ
// ============================================
function copyCommand(slug, btn) {
    const command = `/select ${slug}`;
    navigator.clipboard.writeText(command).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '✅ Скопировано!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        btn.innerHTML = '❌ Ошибка';
    });
}

// Запуск
init();