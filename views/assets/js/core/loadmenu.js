document.addEventListener('DOMContentLoaded', function () {
    const menuItems = document.querySelectorAll('.sidebar ul li a');
    const contentDiv = document.querySelector('.container');

    menuItems.forEach(menuItem => {
        menuItem.addEventListener('click', function (event) {
            if (this.classList.contains('submenu-toggle')) {
                event.preventDefault();
                const submenu = this.nextElementSibling;
                submenu.classList.toggle('active');
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            } else {
                event.preventDefault();
                const contentId = this.getAttribute('data-content');
                loadContent(contentId);
            }
        });
    });

    function loadContent(contentId) {
        fetch(`${contentId}.html`)
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
                executeScripts(contentDiv);
            });
    }

    function executeScripts(element) {
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript).parentNode.removeChild(newScript);
        });
    }

    // Load initial content
    // loadContent('dashboard');
});