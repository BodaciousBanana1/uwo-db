function initCityFilters() {
  const citiesGrid = document.getElementById('cities-grid');
  const cities = Array.from(citiesGrid.querySelectorAll('.city-card'));
  const visibleCount = document.getElementById('visible-count');
  const resetBtn = document.getElementById('reset-filters');

  const filters = {
    search: '',
    tradeGoodSearch: '',
    regions: new Set(),
    languages: new Set(),
    ranges: {}
  };

  // Initialize regions from checkboxes
  document.querySelectorAll('input[name="region"]').forEach(cb => {
    if (cb.checked) filters.regions.add(cb.value);
  });

  // Initialize languages from checkboxes
  document.querySelectorAll('input[name="language"]').forEach(cb => {
    if (cb.checked) filters.languages.add(cb.value);
  });

  // Search input
  const searchInput = document.getElementById('city-search');
  searchInput.addEventListener('input', () => {
    filters.search = searchInput.value.toLowerCase();
    applyFilters();
  });

  // Trade good search
  const tradeGoodInput = document.getElementById('trade-good-search');
  tradeGoodInput.addEventListener('input', () => {
    filters.tradeGoodSearch = tradeGoodInput.value.toLowerCase();
    applyFilters();
  });

  // Range filters
  document.querySelectorAll('.range-slider').forEach(slider => {
    const filterName = slider.dataset.filter;
    const lower = slider.querySelector('.range-lower');
    const upper = slider.querySelector('.range-upper');
    const minDisplay = slider.querySelector('.range-min');
    const maxDisplay = slider.querySelector('.range-max');

    filters.ranges[filterName] = {
      min: parseInt(lower.value),
      max: parseInt(upper.value)
    };

    const updateRange = () => {
      let minVal = parseInt(lower.value);
      let maxVal = parseInt(upper.value);
      if (minVal > maxVal) [minVal, maxVal] = [maxVal, minVal];
      filters.ranges[filterName] = { min: minVal, max: maxVal };
      minDisplay.textContent = minVal;
      maxDisplay.textContent = maxVal;
      applyFilters();
    };

    lower.addEventListener('input', updateRange);
    upper.addEventListener('input', updateRange);
  });

  // Region checkboxes
  document.querySelectorAll('input[name="region"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) filters.regions.add(cb.value);
      else filters.regions.delete(cb.value);
      applyFilters();
    });
  });

  // Language checkboxes
  document.querySelectorAll('input[name="language"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) filters.languages.add(cb.value);
      else filters.languages.delete(cb.value);
      applyFilters();
    });
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    tradeGoodInput.value = '';
    filters.search = '';
    filters.tradeGoodSearch = '';

    document.querySelectorAll('input[name="region"], input[name="language"]').forEach(cb => {
      cb.checked = true;
    });
    filters.regions = new Set(Array.from(document.querySelectorAll('input[name="region"]')).map(cb => cb.value));
    filters.languages = new Set(Array.from(document.querySelectorAll('input[name="language"]')).map(cb => cb.value));

    document.querySelectorAll('.range-slider').forEach(slider => {
      const filterName = slider.dataset.filter;
      const lower = slider.querySelector('.range-lower');
      const upper = slider.querySelector('.range-upper');
      const minDisplay = slider.querySelector('.range-min');
      const maxDisplay = slider.querySelector('.range-max');

      lower.value = lower.min;
      upper.value = upper.max;
      minDisplay.textContent = lower.min;
      maxDisplay.textContent = upper.max;
      filters.ranges[filterName] = { min: parseInt(lower.min), max: parseInt(lower.max) };
    });

    applyFilters();
  });

  function applyFilters() {
    let visible = 0;

    cities.forEach(city => {
      const name = city.querySelector('.city-name').textContent.toLowerCase();
      const region = city.dataset.region;
      const language = city.dataset.language;
      const tradeGoods = city.dataset.trade_goods || '';

      // Check name search
      if (filters.search && !name.includes(filters.search)) {
        city.classList.add('hidden');
        return;
      }

      // Check trade good search
      if (filters.tradeGoodSearch && !tradeGoods.includes(filters.tradeGoodSearch)) {
        city.classList.add('hidden');
        return;
      }

      // Check region
      if (!filters.regions.has(region)) {
        city.classList.add('hidden');
        return;
      }

      // Check language (use "Other" for languages not in the list)
      const knownLanguages = ['English', 'Spanish', 'Portuguese', 'French', 'Italian', 'Dutch', 'German', 'Greek', 'Turkish', 'Arabic', 'Swahili', 'Persian', 'Hindi', 'Malay', 'Chinese', 'Korean', 'Japanese'];
      const langToCheck = knownLanguages.includes(language) ? language : 'Other';
      if (!filters.languages.has(langToCheck)) {
        city.classList.add('hidden');
        return;
      }

      // Check range filters
      for (const [key, range] of Object.entries(filters.ranges)) {
        const val = parseInt(city.dataset[key]) || 0;
        if (val < range.min || val > range.max) {
          city.classList.add('hidden');
          return;
        }
      }

      city.classList.remove('hidden');
      visible++;
    });

    visibleCount.textContent = visible;
  }

  applyFilters();
}

document.addEventListener('DOMContentLoaded', function() {
  // Comment tab switching
  const tabs = document.querySelectorAll('.comment-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetId = this.dataset.tab + '-panel';
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.comment-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Ship filter UI
  const shipsGrid = document.getElementById('ships-grid');
  const citiesGrid = document.getElementById('cities-grid');

  if (citiesGrid) {
    initCityFilters();
  }

  if (!shipsGrid) return;

  const ships = Array.from(shipsGrid.querySelectorAll('.ship-card'));
  const visibleCount = document.getElementById('visible-count');
  const resetBtn = document.getElementById('reset-filters');

  // Filter state
  const filters = {
    search: '',
    types: new Set(['adventure', 'trade', 'battle']),
    sizes: new Set(['Lgt', 'Std', 'Hvy']),
    ranges: {}
  };

  // Search input
  const searchInput = document.getElementById('ship-search');
  searchInput.addEventListener('input', () => {
    filters.search = searchInput.value.toLowerCase();
    applyFilters();
  });

  // Initialize range filters
  document.querySelectorAll('.range-slider').forEach(slider => {
    const filterName = slider.dataset.filter;
    const lower = slider.querySelector('.range-lower');
    const upper = slider.querySelector('.range-upper');
    const minDisplay = slider.querySelector('.range-min');
    const maxDisplay = slider.querySelector('.range-max');

    filters.ranges[filterName] = {
      min: parseInt(lower.value),
      max: parseInt(upper.value)
    };

    const updateRange = () => {
      let minVal = parseInt(lower.value);
      let maxVal = parseInt(upper.value);

      if (minVal > maxVal) {
        [minVal, maxVal] = [maxVal, minVal];
      }

      filters.ranges[filterName] = { min: minVal, max: maxVal };
      minDisplay.textContent = minVal;
      maxDisplay.textContent = maxVal;
      applyFilters();
    };

    lower.addEventListener('input', updateRange);
    upper.addEventListener('input', updateRange);
  });

  // Type checkboxes
  document.querySelectorAll('input[name="type"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        filters.types.add(cb.value);
      } else {
        filters.types.delete(cb.value);
      }
      applyFilters();
    });
  });

  // Size checkboxes
  document.querySelectorAll('input[name="size"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        filters.sizes.add(cb.value);
      } else {
        filters.sizes.delete(cb.value);
      }
      applyFilters();
    });
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    // Reset search
    searchInput.value = '';
    filters.search = '';

    // Reset checkboxes
    document.querySelectorAll('input[name="type"], input[name="size"]').forEach(cb => {
      cb.checked = true;
    });
    filters.types = new Set(['adventure', 'trade', 'battle']);
    filters.sizes = new Set(['Lgt', 'Std', 'Hvy']);

    // Reset range sliders
    document.querySelectorAll('.range-slider').forEach(slider => {
      const filterName = slider.dataset.filter;
      const lower = slider.querySelector('.range-lower');
      const upper = slider.querySelector('.range-upper');
      const minDisplay = slider.querySelector('.range-min');
      const maxDisplay = slider.querySelector('.range-max');

      lower.value = lower.min;
      upper.value = upper.max;
      minDisplay.textContent = lower.min;
      maxDisplay.textContent = upper.max;
      filters.ranges[filterName] = {
        min: parseInt(lower.min),
        max: parseInt(upper.max)
      };
    });

    applyFilters();
  });

  function applyFilters() {
    let visible = 0;

    // Sort by total level ascending
    const sorted = ships.slice().sort((a, b) => {
      const totalA = (parseInt(a.dataset.level_adventure) || 0) +
                     (parseInt(a.dataset.level_trade) || 0) +
                     (parseInt(a.dataset.level_battle) || 0);
      const totalB = (parseInt(b.dataset.level_adventure) || 0) +
                     (parseInt(b.dataset.level_trade) || 0) +
                     (parseInt(b.dataset.level_battle) || 0);
      return totalA - totalB;
    });

    // Reorder DOM
    sorted.forEach(ship => shipsGrid.appendChild(ship));

    sorted.forEach(ship => {
      const name = ship.querySelector('.ship-name').textContent.toLowerCase();
      const type = ship.dataset.type || 'adventure';
      const size = ship.dataset.size;

      // Check search
      if (filters.search && !name.includes(filters.search)) {
        ship.classList.add('hidden');
        return;
      }

      // Check type and size
      if (!filters.types.has(type) || !filters.sizes.has(size)) {
        ship.classList.add('hidden');
        return;
      }

      // Check range filters
      for (const [key, range] of Object.entries(filters.ranges)) {
        const val = parseInt(ship.dataset[key]) || 0;
        if (val < range.min || val > range.max) {
          ship.classList.add('hidden');
          return;
        }
      }

      ship.classList.remove('hidden');
      visible++;
    });

    visibleCount.textContent = visible;
  }

  // Initial sort on page load
  applyFilters();
});
