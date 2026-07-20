// table-tools.js — dependency-free client-side search / filter / pagination.
//
// Any `.hwc-table-wrap[data-tools]` is enhanced. It reads:
//   data-toolbar="#selector"  -> element holding the search box + filter selects
//   data-page-size="10"       -> rows per page (default 10)
// Rows expose searchable text via `data-search` and filterable columns via
// `data-<key>`, matched against a `<select data-filter="<key>">` in the toolbar.
(function () {
    function initTable(wrap) {
        var table = wrap.querySelector('table');
        if (!table) return;
        var tbody = table.querySelector('tbody');
        if (!tbody) return;

        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        var pageSize = parseInt(wrap.getAttribute('data-page-size') || '10', 10);

        var toolbarSel = wrap.getAttribute('data-toolbar');
        var toolbar = toolbarSel ? document.querySelector(toolbarSel) : null;
        var searchInput = toolbar ? toolbar.querySelector('[data-search-input]') : null;
        var filterSelects = toolbar ? Array.prototype.slice.call(toolbar.querySelectorAll('[data-filter]')) : [];
        var countEl = toolbar ? toolbar.querySelector('[data-count]') : null;
        var emptyEl = wrap.querySelector('[data-empty]');

        var pager = document.createElement('div');
        pager.className = 'hwc-pagination';
        wrap.parentNode.insertBefore(pager, wrap.nextSibling);

        var currentPage = 1;

        function matches(row) {
            var q = (searchInput && searchInput.value || '').trim().toLowerCase();
            if (q) {
                var hay = (row.getAttribute('data-search') || row.textContent || '').toLowerCase();
                if (hay.indexOf(q) === -1) return false;
            }
            for (var i = 0; i < filterSelects.length; i++) {
                var sel = filterSelects[i];
                var val = sel.value;
                if (val && (row.getAttribute('data-' + sel.getAttribute('data-filter')) || '') !== val) return false;
            }
            return true;
        }

        function pageBtn(label, onClick, disabled) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'hwc-page-btn';
            b.textContent = label;
            b.disabled = !!disabled;
            if (!disabled) b.addEventListener('click', onClick);
            return b;
        }

        function render() {
            var filtered = rows.filter(matches);
            var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            if (currentPage > totalPages) currentPage = totalPages;
            var start = (currentPage - 1) * pageSize;
            var end = start + pageSize;

            for (var i = 0; i < rows.length; i++) rows[i].style.display = 'none';
            var slice = filtered.slice(start, end);
            for (var j = 0; j < slice.length; j++) slice[j].style.display = '';

            if (countEl) countEl.textContent = filtered.length;
            if (emptyEl) emptyEl.style.display = filtered.length === 0 ? '' : 'none';

            pager.innerHTML = '';
            if (filtered.length > pageSize) {
                var info = document.createElement('span');
                info.className = 'hwc-page-info';
                info.textContent = (filtered.length === 0 ? 0 : start + 1) + '–' + Math.min(end, filtered.length) + ' of ' + filtered.length;
                pager.appendChild(pageBtn('‹', function () { if (currentPage > 1) { currentPage--; render(); } }, currentPage === 1));
                pager.appendChild(info);
                pager.appendChild(pageBtn('›', function () { if (currentPage < totalPages) { currentPage++; render(); } }, currentPage === totalPages));
            }
        }

        if (searchInput) searchInput.addEventListener('input', function () { currentPage = 1; render(); });
        for (var k = 0; k < filterSelects.length; k++) {
            filterSelects[k].addEventListener('change', function () { currentPage = 1; render(); });
        }
        render();
    }

    function initAll() {
        var wraps = document.querySelectorAll('[data-tools]');
        for (var i = 0; i < wraps.length; i++) initTable(wraps[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
