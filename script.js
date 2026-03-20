document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('pages.json');
    const pages = await response.json();

    const nav = document.getElementById('navigation');
    const iframe = document.getElementById('content-iframe');
    const homeSection = document.getElementById('home');

    pages.forEach(page => {
        const link = document.createElement('a');
        link.href = `#${page.id}`;
        link.innerText = page.title;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage(page.id);
        });
        nav.appendChild(link);
    });

    function loadPage(pageId) {
        iframe.src = `${pageId}.html`;
        homeSection.style.display = 'none';
        iframe.style.display = 'block';
        updateActiveLink(pageId);
    }

    function updateActiveLink(pageId) {
        const links = nav.querySelectorAll('a');
        links.forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(pageId)) {
                link.classList.add('active');
            }
        });
    }

    // Load home page by default
    loadPage(pages[0].id);
});