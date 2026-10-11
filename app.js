// ============================================
// СОСТОЯНИЕ
// ============================================
if (window.vkBridge) {
    vkBridge.send('VKWebAppInit').catch(console.error);
}

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
// РЕНДЕР ФИЛЬТРОВ (ровно 5 кнопок)
// ============================================
function renderFilters() {
    const container = document.getElementById('filters');
    const categories = [
        { id: 'all', label: 'Все', emoji: '' },
        { id: 'light', label: 'Лёгкие', emoji: '☀️' },
        { id: 'hot', label: 'Страстные', emoji: '🔥' },
        { id: 'dark', label: 'Тёмные', emoji: '🌙' },
        { id: 'adventure', label: 'Приключенческие', emoji: '🗡️' }
    ];

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
        const hasImage = char.image && char.image.trim() !== '';
        // Берем первые 2 буквы имени для заглушки
        const initials = char.name.replace(/[^\wа-яА-ЯёЁ]/g, '').substring(0, 2).toUpperCase() || '?';

        // Если картинки нет или она не загрузится, показываем стильные инициалы
        const imageHtml = hasImage
            ? `<img src="${char.image}" alt="${char.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="image-fallback" style="display:none; width:100%; height:100%; background:#2c2d2e; align-items:center; justify-content:center; color:#71aaeb; font-size:48px; font-weight:bold; border-radius:8px;">${initials}</div>`
            : `<div class="image-fallback" style="width:100%; height:100%; background:#2c2d2e; display:flex; align-items:center; justify-content:center; color:#71aaeb; font-size:48px; font-weight:bold; border-radius:8px;">${initials}</div>`;

        return `
        <div class="character-card">
            <div class="character-image">
                ${imageHtml}
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