   // docs-navigation.js - Gestion complète de la documentation
   document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Initialisation de la documentation technique...');
    
    // ============================================
    // CONFIGURATION GLOBALE
    // ============================================
    const config = {
        currentPage: 'overview',
        isSidebarOpen: false,
        currentLang: localStorage.getItem('selectedLang') || 'FR',
        darkMode: localStorage.getItem('darkMode') === 'true',
        lastScrollTop: 0
    };
    
    // ============================================
    // INITIALISATION DE LA SIDEBAR
    // ============================================
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const openBtn = document.getElementById('open-sidebar');
        const closeBtn = document.getElementById('close-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        if (!sidebar) return;
        
        // Ouvrir la sidebar sur mobile
        if (openBtn) {
            openBtn.addEventListener('click', function() {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                config.isSidebarOpen = true;
            });
        }
        
        // Fermer la sidebar sur mobile
        function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            config.isSidebarOpen = false;
        }
        
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
        
        // Gestion des sections déroulantes
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const section = this.closest('.accordion-section');
                const content = section.querySelector('.accordion-content');
                const icon = section.querySelector('.accordion-icon');
                
                // Fermer les autres sections si on est sur mobile
                if (window.innerWidth < 1024) {
                    accordionHeaders.forEach(otherHeader => {
                        if (otherHeader !== header) {
                            const otherSection = otherHeader.closest('.accordion-section');
                            const otherContent = otherSection.querySelector('.accordion-content');
                            const otherIcon = otherSection.querySelector('.accordion-icon');
                            
                            otherContent.style.maxHeight = '0';
                            otherIcon.classList.remove('rotate-180');
                        }
                    });
                }
                
                // Basculer l'état actuel
                if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                    content.style.maxHeight = '0';
                    icon.classList.remove('rotate-180');
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.classList.add('rotate-180');
                }
            });
        });
        
        // Fermer la sidebar quand on clique sur un lien (mobile)
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 1024) {
                    closeSidebar();
                }
            });
        });
        
        // Ajuster la hauteur des sections déroulantes quand la fenêtre est redimensionnée
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1024) {
                // Sur desktop, ouvrir toutes les sections
                accordionHeaders.forEach(header => {
                    const section = header.closest('.accordion-section');
                    const content = section.querySelector('.accordion-content');
                    const icon = section.querySelector('.accordion-icon');
                    
                    content.style.maxHeight = content.scrollHeight - 'px';
                    icon.classList.add('rotate-180');
                });
            }
        });
        
        // Initialiser l'état des sections sur desktop
        if (window.innerWidth >= 1024) {
            accordionHeaders.forEach(header => {
                const section = header.closest('.accordion-section');
                const content = section.querySelector('.accordion-content');
                const icon = section.querySelector('.accordion-icon');
                
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.add('rotate-180');
            });
        }
        
        // Rendre la sidebar sticky sur desktop
        if (window.innerWidth >= 1024) {
            sidebar.style.position = 'sticky';
            sidebar.style.top = '80px';
            sidebar.style.height = 'calc(100vh - 80px)';
        }
    }
    
    // ============================================
    // SCROLL SPY POUR LA NAVIGATION
    // ============================================
    function initScrollSpy() {
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        const sections = Array.from(sidebarLinks).map(link => {
            const href = link.getAttribute('href');
            return href && href.startsWith('#') ? document.querySelector(href) : null;
        }).filter(Boolean);
        
        function updateActiveLink() {
            const scrollPosition = window.scrollY + 100;
            
            let currentSection = sections[0];
            
            for (const section of sections) {
                if (section.offsetTop <= scrollPosition) {
                    currentSection = section;
                } else {
                    break;
                }
            }
            
            // Mettre à jour les liens actifs
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection.id}`) {
                    link.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();
        
        // Navigation smooth
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ============================================
    // RECHERCHE DANS LA DOCUMENTATION
    // ============================================
    function initSearch() {
        const searchInput = document.querySelector('input[type="search"][placeholder="Rechercher..."]');
        if (!searchInput) return;
        
        let searchTimeout;
        const sections = document.querySelectorAll('section[id]');
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const query = e.target.value.toLowerCase().trim();
                
                if (query.length < 2) {
                    // Réinitialiser la recherche
                    sections.forEach(section => {
                        section.style.backgroundColor = '';
                        section.style.transition = 'background-color 0.3s';
                    });
                    return;
                }
                
                // Rechercher dans le contenu
                let foundResults = false;
                
                sections.forEach(section => {
                    const content = section.innerText.toLowerCase();
                    const title = section.querySelector('h2, h3')?.innerText.toLowerCase() || '';
                    
                    if (content.includes(query) || title.includes(query)) {
                        section.style.backgroundColor = '#fef3c7';
                        foundResults = true;
                        
                        // Scroll vers le premier résultat
                        if (content.includes(query) && !foundResults) {
                            window.scrollTo({
                                top: section.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        section.style.backgroundColor = '';
                    }
                });
                
                if (!foundResults && query.length >= 2) {
                    showNoResultsMessage(query);
                }
            }, 300);
        });
        
        // Nettoyer la recherche avec ESC
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                sections.forEach(section => {
                    section.style.backgroundColor = '';
                });
            }
        });
    }
    
    function showNoResultsMessage(query) {
        // Créer un toast message
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.innerHTML = `
            <i class="fas fa-search mr-2"></i>
            Aucun résultat pour "${query}"
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // ============================================
    // DARK MODE POUR LA DOCS
    // ============================================
    function initDarkMode() {
        // Vérifier le mode sombre initial
        if (config.darkMode) {
            document.documentElement.classList.add('dark');
        }
        
        // Écouter les changements depuis le header
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    localStorage.setItem('darkMode', isDark);
                    config.darkMode = isDark;
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Toggle manuel pour la page docs
        const darkModeToggle = document.createElement('button');
        darkModeToggle.className = '';
        darkModeToggle.innerHTML = '<i></i>';
        darkModeToggle.title = 'Basculer mode sombre/clair';
        darkModeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
        });
        
        document.body.appendChild(darkModeToggle);
    }
    
    // ============================================
    // COPY CODE BLOCKS
    // ============================================
    function initCodeBlocks() {
        document.querySelectorAll('pre').forEach(pre => {
            // Créer le bouton de copie
            const copyButton = document.createElement('button');
            copyButton.className = 'absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors';
            copyButton.innerHTML = '<i class="fas fa-copy mr-2"></i>Copier';
            
            // Ajouter au pre
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
            
            copyButton.addEventListener('click', async () => {
                const code = pre.textContent.replace('Copier', '').trim();
                
                try {
                    await navigator.clipboard.writeText(code);
                    
                    // Feedback visuel
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '<i class="fas fa-check mr-2"></i>Copié!';
                    copyButton.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.classList.remove('bg-green-600');
                    }, 2000);
                } catch (err) {
                    console.error('Erreur de copie:', err);
                    copyButton.innerHTML = '<i class="fas fa-times mr-2"></i>Erreur';
                    copyButton.classList.add('bg-red-600');
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.classList.remove('bg-red-600');
                    }, 2000);
                }
            });
        });
    }
    
    // ============================================
    // PROGRESS BAR DE LECTURE
    // ============================================
    function initReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        progressBar.className = 'fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-orange-500 z-50';
        progressBar.style.width = '0%';
        
        document.body.appendChild(progressBar);
        
        function updateProgressBar() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            progressBar.style.width = scrolled + '%';
        }
        
        window.addEventListener('scroll', updateProgressBar);
        updateProgressBar();
    }
    
    // ============================================
    // SECTION HIGHLIGHT ON SCROLL
    // ============================================
    function initSectionHighlight() {
        const sections = document.querySelectorAll('section[id]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('highlight');
                    
                    // Ajouter une légère animation
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.opacity = '1';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px 0px -50px 0px'
        });
        
        sections.forEach(section => {
            // Préparer l'animation
            section.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            section.style.transform = 'translateY(20px)';
            section.style.opacity = '0.9';
            
            observer.observe(section);
        });
    }
    
    // ============================================
    // EXPORT PDF FEATURE
    // ============================================
    function initExportFeature() {
        const exportButton = document.createElement('button');
        exportButton.id = 'export-docs';
        exportButton.className = 'fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors';
        exportButton.innerHTML = '<i class="fas fa-file-pdf"></i>';
        exportButton.title = 'Exporter en PDF';
        
        exportButton.addEventListener('click', () => {
            showExportOptions();
        });
        
        document.body.appendChild(exportButton);
    }
    
    function showExportOptions() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                        <i class="fas fa-file-export mr-2"></i>
                        Exporter la documentation
                    </h3>
                    <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" id="close-export-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <button class="w-full flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" id="export-current">
                        <i class="fas fa-file-alt text-blue-500 mr-3 text-xl"></i>
                        <div class="text-left">
                            <div class="font-semibold text-gray-800 dark:text-white">Page courante</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">Exporter uniquement cette section</div>
                        </div>
                    </button>
                    
                    <button class="w-full flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" id="export-all">
                        <i class="fas fa-book text-orange-500 mr-3 text-xl"></i>
                        <div class="text-left">
                            <div class="font-semibold text-gray-800 dark:text-white">Documentation complète</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">Toutes les sections</div>
                        </div>
                    </button>
                </div>
                
                <div class="mt-6 text-center">
                    <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm" id="cancel-export">
                        Annuler
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gestion des événements du modal
        document.getElementById('close-export-modal').addEventListener('click', () => modal.remove());
        document.getElementById('cancel-export').addEventListener('click', () => modal.remove());
        document.getElementById('export-current').addEventListener('click', exportCurrentPage);
        document.getElementById('export-all').addEventListener('click', exportAllPages);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    function exportCurrentPage() {
        // Simuler l'export PDF
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            Export PDF démarré...
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                toast.remove();
                document.querySelectorAll('.fixed.bg-black').forEach(el => el.remove());
            }, 300);
        }, 2000);
    }
    
    function exportAllPages() {
        // Simuler l'export complet
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.innerHTML = `
            <i class="fas fa-download mr-2"></i>
            Préparation de l'export complet...
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.innerHTML = `
                <i class="fas fa-check-circle mr-2"></i>
                Documentation exportée avec succès!
            `;
            toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    toast.remove();
                    document.querySelectorAll('.fixed.bg-black').forEach(el => el.remove());
                }, 300);
            }, 2000);
        }, 1500);
    }
    
    // ============================================
    // TABLE OF CONTENTS FLOATING
    // ============================================
    function initFloatingTOC() {
        if (window.innerWidth < 1024) return;
        
        const toc = document.createElement('div');
        toc.id = 'floating-toc';
        toc.className = 'fixed left-2 sm:left-4 top-20 sm:top-1/2 sm:transform sm:-translate-y-1/2 w-64 sm:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 z-40 hidden md:block max-h-[calc(100vh-6rem)] sm:max-h-none overflow-hidden';
        toc.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                    <i class="fas fa-list-ol mr-2 text-blue-500 text-xs sm:text-sm"></i>
                    Sommaire
                </h4>
                <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1" id="minimize-toc" aria-label="Réduire le sommaire">
                    <i class="fas fa-minus text-xs sm:text-sm"></i>
                </button>
            </div>
            <div id="toc-content" class="max-h-60 sm:max-h-80 overflow-y-auto pr-2 text-sm scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"></div>
        `;
        
        document.body.appendChild(toc);
        
        // Remplir le TOC
        const sections = document.querySelectorAll('section[id] h2');
        const tocContent = document.getElementById('toc-content');
        
        sections.forEach((section, index) => {
            const item = document.createElement('a');
            item.href = `#${section.closest('section').id}`;
            item.className = 'block py-2 px-3 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mb-1';
            item.innerHTML = `
                <span class="text-xs text-gray-400 mr-2">${index + 1}.</span>
                ${section.textContent}
            `;
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
            
            tocContent.appendChild(item);
        });
        
        // Minimize/Maximize TOC
        document.getElementById('minimize-toc').addEventListener('click', () => {
            const isMinimized = toc.classList.contains('minimized');
            
            if (isMinimized) {
                toc.classList.remove('minimized');
                tocContent.classList.remove('hidden');
                document.getElementById('minimize-toc').innerHTML = '<i class="fas fa-minus"></i>';
                toc.style.width = '14rem';
            } else {
                toc.classList.add('minimized');
                tocContent.classList.add('hidden');
                document.getElementById('minimize-toc').innerHTML = '<i class="fas fa-plus"></i>';
                toc.style.width = '3rem';
            }
        });
        
        // Cacher le TOC au scroll down, montrer au scroll up
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > config.lastScrollTop && currentScroll > 100) {
                // Scroll down
                toc.style.opacity = '0';
                toc.style.transform = 'translateY(-50%) translateX(-20px)';
            } else {
                // Scroll up
                toc.style.opacity = '1';
                toc.style.transform = 'translateY(-50%) translateX(0)';
            }
            
            config.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        });
        
        // Animation
        toc.style.transition = 'all 0.3s ease';
    }
    
    // ============================================
    // INITIALISATION COMPLÈTE
    // ============================================
    function init() {
        console.log('🚀 Initialisation des fonctionnalités de documentation...');
        
        // 1. Sidebar et navigation
        initSidebar();
        initScrollSpy();
        
        // 2. Recherche dans la documentation
        initSearch();
        
        // 3. Dark mode
        initDarkMode();
        
        // 4. Code blocks
        initCodeBlocks();
        
        // 5. Progress bar
        initReadingProgress();
        
        // 6. Section highlight
        initSectionHighlight();
        
        // 7. Export feature
        initExportFeature();
        
        // 8. Floating Table of Contents
        initFloatingTOC();
        
        // 9. Initialiser le footer
        initFooter();
        
        console.log('✅ Documentation initialisée avec succès!');
    }
    
    // ============================================
    // CHARGEMENT DU FOOTER
    // ============================================
    function initFooter() {
        fetch('/src/views/templates/footer.html')
            .then(response => {
                if (!response.ok) throw new Error('Footer non trouvé');
                return response.text();
            })
            .then(html => {
                document.getElementById('footer').innerHTML = html;
                console.log('Footer chargé avec succès');
            })
            .catch(error => {
                console.warn('Footer non chargé:', error);
                document.getElementById('footer').innerHTML = `
                    <footer class="bg-gray-800 text-white py-8 mt-auto">
                        <div class="max-w-6xl mx-auto px-6 text-center">
                            <div class="mb-4">
                                <h3 class="text-xl font-bold mb-2">EduConnect Africa Docs</h3>
                                <p class="text-gray-300">Documentation technique complète</p>
                            </div>
                            <div class="flex justify-center space-x-6 mb-4">
                                <a href="#" class="text-gray-300 hover:text-white">
                                    <i class="fab fa-github"></i>
                                </a>
                                <a href="#" class="text-gray-300 hover:text-white">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" class="text-gray-300 hover:text-white">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                            </div>
                            <p class="text-gray-400 text-sm mb-0">
                                © 2024 EduConnect Africa. Tous droits réservés.
                            </p>
                        </div>
                    </footer>
                `;
            });
    }
    
    // ============================================
    // EXPOSER LES FONCTIONS GLOBALEMENT
    // ============================================
    window.docs = {
        scrollToSection: function(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                window.scrollTo({
                    top: section.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        },
        
        toggleSidebar: function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        },
        
        exportPage: exportCurrentPage,
        
        search: function(query) {
            const searchInput = document.querySelector('input[type="search"][placeholder="Rechercher..."]');
            if (searchInput) {
                searchInput.value = query;
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    };
    
    // ============================================
    // DÉMARRER L'INITIALISATION
    // ============================================
    init();
    
    // Ajouter des styles supplémentaires
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        /* Animation pour les sections */
        section.highlight {
            animation: highlight-pulse 2s ease-in-out;
        }
        
        @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.1); }
            50% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        
        /* Styles pour le TOC flottant */
        #floating-toc.minimized {
            padding: 0.5rem;
            text-align: center;
        }
        
        #floating-toc.minimized h4,
        #floating-toc.minimized #toc-content {
            display: none;
        }
        
        /* Badge pour nouvelles sections */
        .new-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: linear-gradient(90deg, #EF4444, #F97316);
            color: white;
            font-size: 0.6rem;
            padding: 2px 6px;
            border-radius: 9999px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* Style pour les liens externes */
        a[href^="http"]::after {
            content: "↗";
            margin-left: 4px;
            font-size: 0.8em;
            opacity: 0.7;
        }
        
        /* Mode impression */
        @media print {
            #sidebar, #floating-toc, #export-docs, #sidebar-toggle, 
            .fixed, .sticky, button {
                display: none !important;
            }
            
            body {
                padding: 0 !important;
                margin: 0 !important;
            }
            
            section {
                break-inside: avoid;
            }
        }
        
        /* Styles pour les nouvelles sections */
        .api-endpoint {
            border-left: 4px solid #3B82F6;
            background: #F8FAFC;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .dark .api-endpoint {
            background: #1E293B;
            border-left-color: #60A5FA;
        }
        
        .step-number {
            width: 2rem;
            height: 2rem;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 1rem;
        }
        
        .deployment-step {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .dark .deployment-step {
            background: #1F2937;
        }
        
        .tech-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-right: 1rem;
        }
        
        .feature-icon {
            width: 4rem;
            height: 4rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            margin-bottom: 1rem;
        }
        
        .architecture-diagram {
            background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
            padding: 2rem;
            border-radius: 1rem;
            color: white;
            margin: 2rem 0;
        }
        
        .diagram-node {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            padding: 1rem;
            border-radius: 0.75rem;
            margin: 0.5rem;
        }
        
        .diagram-line {
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            margin: 1rem 0;
            position: relative;
        }
        
        .diagram-line::after {
            content: '↓';
            position: absolute;
            top: -0.75rem;
            left: 50%;
            transform: translateX(-50%);
            color: white;
        }
        
        .scroll-mt-24 {
            scroll-margin-top: 6rem;
        }
    `;
    
    document.head.appendChild(additionalStyles);
});

// Script pour gérer la sidebar mobile
document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    
    // Fonction pour ouvrir/fermer la sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
        document.body.classList.toggle('sidebar-open');
        
        // Bloquer le scroll du body quand la sidebar est ouverte
        if (sidebar.classList.contains('-translate-x-full')) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Fonction pour ouvrir/fermer le menu mobile
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('hidden');
        document.body.classList.toggle('sidebar-open');
        
        if (mobileMenu.classList.contains('hidden')) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Événements pour la sidebar
    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (openSidebarBtn) openSidebarBtn.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);
    
    // Événements pour le menu mobile
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    if (closeMobileMenu) closeMobileMenu.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
    
    // Gestion des accordions
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            
            if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                content.style.maxHeight = '0';
                icon.classList.remove('rotate-180');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.add('rotate-180');
            }
        });
    });
    
    // Ouvrir le premier accordion par défaut
    const firstAccordion = document.querySelector('.accordion-header');
    if (firstAccordion) {
        const firstContent = firstAccordion.nextElementSibling;
        const firstIcon = firstAccordion.querySelector('.accordion-icon');
        firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
        firstIcon.classList.add('rotate-180');
    }
    
    // Navigation fluide pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                // Fermer la sidebar sur mobile
                if (window.innerWidth < 1024) {
                    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
                        toggleSidebar();
                    }
                }
                
                // Calculer la hauteur du header pour le scroll offset
                const headerHeight = document.getElementById('main-header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - headerHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Recherche dans la sidebar
    const searchInput = document.querySelector('#sidebar input[type="search"]');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const links = document.querySelectorAll('.sidebar-link');
            
            links.forEach(link => {
                const text = link.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    link.style.display = 'flex';
                    // Ouvrir l'accordion parent
                    let parentAccordion = link.closest('.accordion-content');
                    if (parentAccordion) {
                        const header = parentAccordion.previousElementSibling;
                        const icon = header.querySelector('.accordion-icon');
                        parentAccordion.style.maxHeight = parentAccordion.scrollHeight + 'px';
                        icon.classList.add('rotate-180');
                    }
                } else {
                    link.style.display = 'none';
                }
            });
        });
    }
    
    // Fermer la sidebar quand on redimensionne vers desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
            document.body.classList.remove('sidebar-open');
            document.body.style.overflow = 'auto';
        }
        
        // Fermer le menu mobile en desktop
        if (window.innerWidth >= 1024 && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            document.body.classList.remove('sidebar-open');
            document.body.style.overflow = 'auto';
        }
    });
    
                // Gestion du mode sombre avec soleil jaune
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.className = 'p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-300 active:scale-95';
    themeToggle.setAttribute('aria-label', 'Changer le thème');

    // Insérer le bouton theme avant le bouton menu mobile
    const headerControls = document.querySelector('.flex.items-center.space-x-1');
    if (headerControls && mobileMenuToggle) {
        headerControls.insertBefore(themeToggle, mobileMenuToggle);
        
        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun text-yellow-500"></i>';
            }
        });
        
        // Vérifier le thème sauvegardé
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            themeToggle.innerHTML = '<i class="fas fa-sun text-yellow-500"></i>';
        }
    }
    
    // Ajouter la classe active aux liens sidebar correspondants
    function updateActiveSidebarLink() {
        const currentHash = window.location.hash || '#overview';
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
                // Ouvrir l'accordion parent
                let parentAccordion = link.closest('.accordion-content');
                if (parentAccordion) {
                    const header = parentAccordion.previousElementSibling;
                    const icon = header.querySelector('.accordion-icon');
                    parentAccordion.style.maxHeight = parentAccordion.scrollHeight + 'px';
                    icon.classList.add('rotate-180');
                }
            }
        });
    }
    
    // Mettre à jour les liens actifs au chargement et lors du scroll
    window.addEventListener('load', updateActiveSidebarLink);
    window.addEventListener('hashchange', updateActiveSidebarLink);
    
    // Observer les sections pour mettre à jour le lien actif
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                history.replaceState(null, null, `#${id}`);
                updateActiveSidebarLink();
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Amélioration du touch sur mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Ajouter des effets de tap
        const tappableElements = document.querySelectorAll('button, a, .sidebar-link, .accordion-header, .feature-card');
        tappableElements.forEach(el => {
            el.addEventListener('touchstart', function() {
                this.classList.add('active-touch');
            });
            
            el.addEventListener('touchend', function() {
                this.classList.remove('active-touch');
            });
        });
    }
});
// Ajoutez cette fonction après la section des accordions existants
function closeOtherAccordions(currentHeader) {
    const allAccordionHeaders = document.querySelectorAll('.accordion-header');
    allAccordionHeaders.forEach(otherHeader => {
        if (otherHeader !== currentHeader) {
            const otherContent = otherHeader.nextElementSibling;
            const otherIcon = otherHeader.querySelector('.accordion-icon');
            otherContent.style.maxHeight = '0';
            otherIcon.classList.remove('rotate-180');
        }
    });
}

// Modifiez le gestionnaire d'événements des accordions existant
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.accordion-icon');
        
        // Fermer les autres accordions
        closeOtherAccordions(header);
        
        if (content.style.maxHeight && content.style.maxHeight !== '0px') {
            content.style.maxHeight = '0';
            icon.classList.remove('rotate-180');
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            icon.classList.add('rotate-180');
        }
    });
});

// Pour fermer un accordion quand on clique sur un lien à l'intérieur
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function(e) {
        // Ne pas fermer si c'est un clic sur le lien lui-même (navigation normale)
        if (!this.classList.contains('active')) {
            // Fermer tous les accordions après un délai (pour mobile)
            setTimeout(() => {
                if (window.innerWidth < 768) {
                    const allAccordionHeaders = document.querySelectorAll('.accordion-header');
                    allAccordionHeaders.forEach(header => {
                        const content = header.nextElementSibling;
                        const icon = header.querySelector('.accordion-icon');
                        content.style.maxHeight = '0';
                        icon.classList.remove('rotate-180');
                    });
                }
            }, 300);
        }
    });
});