export function renderPagination(pageData, ul, getDom) {
    ul.innerHTML = "";
    if (!pageData || pageData.totalPages <= 1) return;

    ul.appendChild(pageItem("이전", currentPage - 1, pageData.first));

    for (let i = 0; i < pageData.totalPages; i++) {
        ul.appendChild(pageNumberItem(i, i === currentPage));
    }

    ul.appendChild(pageItem("다음", currentPage + 1, pageData.last));

    function pageItem(label, page, disabled) {
        const li = document.createElement("li");
        li.className = `page-item ${disabled ? "disabled" : ""}`;
        li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
        li.querySelector("a").addEventListener("click", (e) => {
            e.preventDefault();
            if (!disabled) loadLogs(page, getDom());
        });
        return li;
    }

    function pageNumberItem(page, active) {
        const li = document.createElement("li");
        li.className = `page-item ${active ? "active" : ""}`;
        li.innerHTML = `<a class="page-link" href="#">${page + 1}</a>`;
        li.querySelector("a").addEventListener("click", (e) => {
            e.preventDefault();
            loadLogs(page, getDom());
        });
        return li;
    }
}