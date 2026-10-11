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

// ... (начало файла с инициализацией и категориями остается без изменений) ...

function renderCharacters() {
    const grid = document.getElementById('charactersGrid');
    const stats = document.getElementById('stats');

    const filtered = charactersData.filter(char => {
        const matchesCategory = currentFilter === 'all' || char.category === currentFilter;
        const matchesSearch = !searchQuery || char.name.toLowerCase().includes(searchQuery) || char.description.toLowerCase().includes(searchQuery) || char.tags.some(t => t.toLowerCase().includes(searchQuery));
        return matchesCategory && matchesSearch;
    });

    stats.textContent = `Найдено: ${filtered.length} из ${charactersData.length}`;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">😿 Персонажи не найдены</div>';
        return;
    }

    grid.innerHTML = filtered.map(char => {
        const initials = char.name.replace(/[^\wа-яА-ЯёЁ]/g, '').substring(0, 2).toUpperCase() || '?';
        const hasImage = char.image && char.image.trim() !== '';

        const imageHtml = hasImage
            ? `<img src="${char.image}" alt="${char.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="image-fallback" style="display:none;">${initials}</div>`
            : `<div class="image-fallback">${initials}</div>`;

        return `
        <div class="character-card">
            <div class="character-image">${imageHtml}</div>
            <div class="character-header">
                <div class="character-name">${char.name}</div>
                <div class="character-position">#${char.position}</div>
            </div>
            <div class="character-description">${char.description}</div>
            <div class="character-tags">${char.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            
            <!-- Гибридная зона: поле для выделения + кнопка -->
            <div class="command-wrapper">
                <input type="text" class="command-input" readonly value="/select ${char.slug}" onclick="this.select()" title="Выдели и скопируй">
                <button class="copy-btn" onclick="copyCommand('${char.slug}', this)">📋</button>
            </div>
        </div>`;
    }).join('');
}

function copyCommand(slug, btn) {
    const command = `/select ${slug}`;

    // Пытаемся использовать Clipboard API (работает на мобильных)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(command).then(() => {
            showSuccess(btn);
        }).catch(() => {
            showFallbackHint(btn);
        });
    } else {
        showFallbackHint(btn);
    }
}

function showSuccess(btn) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✅';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('copied');
    }, 2000);
}

function showFallbackHint(btn) {
    // Если VK заблокировал API (десктоп), подсказываем выделить вручную
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✋';
    btn.title = 'Выдели текст слева вручную';
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.title = 'Скопировать';
    }, 2000);
}

init();