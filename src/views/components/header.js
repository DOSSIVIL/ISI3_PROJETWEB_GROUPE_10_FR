// Gestionnaire de pages
class PageManager {
    constructor() {
      this.currentPage = 'home';
      this.init();
    }

    init() {
      // Récupérer la page actuelle depuis l'attribut data ou l'URL hash
      const bodyPage = document.body.getAttribute('data-current-page');
      const hash = window.location.hash.substring(1);
      
      if (bodyPage) {
        this.currentPage = bodyPage;
      } else if (hash === 'home' || hash === '/' || hash === '/') {
        this.currentPage = 'home';
      } else if (hash === 'about') {
        this.currentPage = 'about';
      }
      
      // Activer la page par défaut
      this.setActivePage(this.currentPage);
      
      // Écouter les changements d'URL hash
      window.addEventListener('hashchange', () => this.handleHashChange());
      
      // Écouter les clics sur les liens de navigation
      document.addEventListener('click', (e) => this.handleNavClick(e));
      
      // Initialiser les animations au survol
      this.initHoverAnimations();
    }

    initHoverAnimations() {
      // Animation pour les boutons
      const buttons = document.querySelectorAll('button, a');
      buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
        });
      });
    }

    handleHashChange() {
      const hash = window.location.hash.substring(1) || 'home';
      this.setActivePage(hash);
    }

    handleNavClick(e) {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const page = link.getAttribute('href').substring(1) || 'home';
        this.setActivePage(page);
        // Utiliser pushState avec le hash correct
        window.history.pushState(null, '', `#${page}`);
        
        // Fermer le menu mobile si ouvert
        closeMobileMenu();
      }
    }

    setActivePage(page) {
      this.currentPage = page;
      document.body.setAttribute('data-current-page', page);
      
      // Mettre à jour la navigation desktop
      document.querySelectorAll('.nav-item').forEach(item => {
        const itemPage = item.getAttribute('data-page');
        if (itemPage === page) {
          item.classList.add('active');
          item.querySelector('.nav-text').classList.add('font-semibold');
          item.querySelector('.nav-icon').classList.remove('text-gray-600');
          
          if (page === 'home') {
            item.querySelector('.nav-icon').classList.add('text-blue-600');
            item.querySelector('.active-indicator').style.width = '80%';
            const bgElement = item.querySelector('.absolute.inset-0');
            if(bgElement) {
              bgElement.classList.remove('opacity-0');
              bgElement.classList.add('opacity-100', 'bg-blue-50');
            }
          } else if (page === 'about') {
            item.querySelector('.nav-icon').classList.add('text-emerald-600');
            item.querySelector('.active-indicator').style.width = '80%';
            const bgElement = item.querySelector('.absolute.inset-0');
            if(bgElement) {
              bgElement.classList.remove('opacity-0');
              bgElement.classList.add('opacity-100', 'bg-emerald-50');
            }
          }
        } else {
          item.classList.remove('active');
          item.querySelector('.nav-text').classList.remove('font-semibold');
          item.querySelector('.nav-icon').classList.add('text-gray-600');
          
          if (itemPage === 'home') {
            item.querySelector('.nav-icon').classList.remove('text-blue-600');
          } else if (itemPage === 'about') {
            item.querySelector('.nav-icon').classList.remove('text-emerald-600');
          }
          
          item.querySelector('.active-indicator').style.width = '0';
          const bgElement = item.querySelector('.absolute.inset-0');
          if(bgElement) {
            bgElement.classList.add('opacity-0');
            bgElement.classList.remove('opacity-100', 'bg-blue-50', 'bg-emerald-50');
          }
        }
      });

      // Mettre à jour la navigation mobile
      document.querySelectorAll('.mobile-nav-item').forEach(item => {
        const itemPage = item.getAttribute('data-page');
        if (itemPage === page) {
          item.classList.add('bg-gray-50/80', 'text-gray-900');
          item.classList.remove('text-gray-700');
          item.querySelector('svg').classList.remove('text-gray-600');
          
          if (page === 'home') {
            item.querySelector('svg').classList.add('text-blue-600');
          } else if (page === 'about') {
            item.querySelector('svg').classList.add('text-emerald-600');
          }
        } else {
          item.classList.remove('bg-gray-50/80', 'text-gray-900');
          item.classList.add('text-gray-700');
          item.querySelector('svg').classList.add('text-gray-600');
          
          if (page === 'home') {
            item.querySelector('svg').classList.remove('text-blue-600');
          } else if (page === 'about') {
            item.querySelector('svg').classList.remove('text-emerald-600');
          }
        }
      });
    }

    getCurrentPage() {
      return this.currentPage;
    }
  }

  // Initialiser le gestionnaire de pages
  const pageManager = new PageManager();

  // Dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const darkModeToggleMobile = document.getElementById('dark-mode-toggle-mobile');
  const darkModeTextMobile = document.getElementById('dark-mode-text-mobile');
  const darkModeStatusMobile = document.getElementById('dark-mode-status-mobile');
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');
  const moonIconMobile = document.getElementById('moon-icon-mobile');
  let isDarkMode = false;

  function setDarkMode(enabled) {
    isDarkMode = enabled;
    if(enabled) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-900', 'text-gray-300');
      document.body.classList.remove('bg-white', 'text-gray-700');
      
      // Mettre à jour le header
      const header = document.getElementById('main-header');
      if(header) {
        header.classList.add('bg-slate-900/95', 'border-gray-700/50');
        header.classList.remove('bg-white/90', 'border-gray-200/50');
      }
      
      // Mettre à jour les menus
      const registerMenu = document.getElementById('register-menu');
      if(registerMenu) {
        registerMenu.classList.add('dark:bg-slate-900', 'dark:border-slate-700');
      }
      
      const userMenuMobile = document.getElementById('user-menu-mobile');
      if(userMenuMobile) {
        userMenuMobile.classList.add('bg-slate-800/95', 'border-slate-700');
        userMenuMobile.classList.remove('bg-white/95', 'border-gray-200/50');
      }
      
      // Mettre à jour le menu mobile
      const mobileMenuContent = document.getElementById('mobile-menu-content');
      if(mobileMenuContent) {
        mobileMenuContent.classList.add('dark:bg-slate-900');
      }
      
      // Mettre à jour les icônes
      if(moonIcon) moonIcon.classList.add('hidden');
      if(sunIcon) sunIcon.classList.remove('hidden');
      if(moonIconMobile) moonIconMobile.classList.add('hidden');
      if(darkModeTextMobile) darkModeTextMobile.textContent = 'Mode Clair';
      if(darkModeStatusMobile) darkModeStatusMobile.textContent = 'Activé';
      if(darkModeToggle) {
        darkModeToggle.classList.add('bg-slate-700/50', 'text-yellow-400');
        darkModeToggle.classList.remove('bg-gray-100/80', 'text-gray-700');
      }
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-slate-900', 'text-gray-300');
      document.body.classList.add('bg-white', 'text-gray-700');
      
      // Mettre à jour le header
      const header = document.getElementById('main-header');
      if(header) {
        header.classList.remove('bg-slate-900/95', 'border-gray-700/50');
        header.classList.add('bg-white/90', 'border-gray-200/50');
      }
      
      // Mettre à jour les menus
      const registerMenu = document.getElementById('register-menu');
      if(registerMenu) {
        registerMenu.classList.remove('dark:bg-slate-900', 'dark:border-slate-700');
      }
      
      const userMenuMobile = document.getElementById('user-menu-mobile');
      if(userMenuMobile) {
        userMenuMobile.classList.remove('bg-slate-800/95', 'border-slate-700');
        userMenuMobile.classList.add('bg-white/95', 'border-gray-200/50');
      }
      
      // Mettre à jour le menu mobile
      const mobileMenuContent = document.getElementById('mobile-menu-content');
      if(mobileMenuContent) {
        mobileMenuContent.classList.remove('dark:bg-slate-900');
      }
      
      if(moonIcon) moonIcon.classList.remove('hidden');
      if(sunIcon) sunIcon.classList.add('hidden');
      if(moonIconMobile) moonIconMobile.classList.remove('hidden');
      if(darkModeTextMobile) darkModeTextMobile.textContent = 'Mode Sombre';
      if(darkModeStatusMobile) darkModeStatusMobile.textContent = 'Désactivé';
      if(darkModeToggle) {
        darkModeToggle.classList.remove('bg-slate-700/50', 'text-yellow-400');
        darkModeToggle.classList.add('bg-gray-100/80', 'text-gray-700');
      }
    }
    localStorage.setItem('darkMode', enabled);
  }

  // Charger le mode sombre depuis le localStorage
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    setDarkMode(savedDarkMode === 'true');
  }

  if(darkModeToggle) {
    darkModeToggle.addEventListener('click', () => setDarkMode(!isDarkMode));
  }
  if(darkModeToggleMobile) {
    darkModeToggleMobile.addEventListener('click', () => setDarkMode(!isDarkMode));
  }

  // ===========================================
  // PARTIE MODIFIÉE : GESTION DE LA LANGUE
  // ===========================================
  
  // Language management amélioré
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  const currentLangFlag = document.getElementById('current-lang-flag');
  const currentLangName = document.getElementById('current-lang-name');
  const langOptions = document.querySelectorAll('.lang-option');

  // Pour mobile
  const currentLangMobileFlag = document.getElementById('current-lang-mobile-flag');
  const currentLangMobileDisplay = document.getElementById('current-lang-mobile-display');
  const langOptionsMobile = document.querySelectorAll('.lang-option-mobile');

  function updateLanguageDisplay(lang, langName, langFlag) {
    // Mettre à jour le bouton desktop
    if(currentLangFlag) {
      currentLangFlag.textContent = langFlag;
    }
    if(currentLangName) {
      currentLangName.textContent = langName;
    }
    
    // Mettre à jour les options sélectionnées dans le menu desktop
    document.querySelectorAll('.lang-option').forEach(option => {
      option.classList.remove('selected');
      if(option.getAttribute('data-lang') === lang) {
        option.classList.add('selected');
      }
    });
    
    // Mettre à jour le mobile
    if(currentLangMobileFlag) {
      currentLangMobileFlag.textContent = langFlag;
    }
    if(currentLangMobileDisplay) {
      currentLangMobileDisplay.textContent = langName;
    }
    
    // Mettre à jour les indicateurs dans le menu mobile
    document.querySelectorAll('#current-lang-mobile-indicator-fr, #current-lang-mobile-indicator-en').forEach(indicator => {
      indicator.classList.add('hidden');
    });
    
    if(lang === 'FR') {
      const indicatorFrMobile = document.getElementById('current-lang-mobile-indicator-fr');
      if(indicatorFrMobile) indicatorFrMobile.classList.remove('hidden');
    } else if(lang === 'EN') {
      const indicatorEnMobile = document.getElementById('current-lang-mobile-indicator-en');
      if(indicatorEnMobile) indicatorEnMobile.classList.remove('hidden');
    }
    
    // Sauvegarder la préférence
    localStorage.setItem('preferredLanguage', JSON.stringify({
      lang: lang,
      name: langName,
      flag: langFlag
    }));
    
    // Utiliser Google Translate pour changer la langue
    changeGoogleTranslateLanguage(lang);
  }

  function changeGoogleTranslateLanguage(lang) {
    const translateElement = document.querySelector('.goog-te-combo');
    if (translateElement) {
      translateElement.value = lang;
      translateElement.dispatchEvent(new Event('change'));
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      try {
        const langData = JSON.parse(savedLang);
        if (langData.lang && langData.name && langData.flag) {
          updateLanguageDisplay(langData.lang, langData.name, langData.flag);
        }
      } catch (e) {
        // Fallback si le JSON n'est pas valide
        updateLanguageDisplay('FR', 'Français', '🇫🇷');
      }
    } else {
      updateLanguageDisplay('FR', 'Français', '🇫🇷');
    }
  });

  if(langToggle) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if(langMenu) {
        const isHidden = langMenu.classList.contains('hidden');
        
        if(isHidden) {
          // Ouvrir le menu
          langMenu.classList.remove('hidden');
          langToggle.classList.add('active');
          langToggle.setAttribute('aria-expanded', 'true');
        } else {
          // Fermer le menu
          langMenu.classList.add('hidden');
          langToggle.classList.remove('active');
          langToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  langOptions.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      const langName = option.getAttribute('data-lang-name');
      const langFlag = option.getAttribute('data-lang-flag');
      updateLanguageDisplay(lang, langName, langFlag);
      if(langMenu) {
        langMenu.classList.add('hidden');
        langToggle.classList.remove('active');
        langToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Settings menu toggle (Mobile) - maintenant dans le menu mobile
  const langToggleMobileBtn = document.getElementById('lang-toggle-mobile-btn');
  const langSubmenuMobile = document.getElementById('lang-submenu-mobile');

  if(langToggleMobileBtn) {
    langToggleMobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if(langSubmenuMobile) {
        const isHidden = langSubmenuMobile.classList.contains('hidden');
        
        if(isHidden) {
          // Ouvrir le sous-menu
          langSubmenuMobile.classList.remove('hidden');
          langToggleMobileBtn.classList.add('active');
        } else {
          // Fermer le sous-menu
          langSubmenuMobile.classList.add('hidden');
          langToggleMobileBtn.classList.remove('active');
        }
      }
    });
  }

  langOptionsMobile.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      const langName = option.getAttribute('data-lang-name');
      const langFlag = option.getAttribute('data-lang-flag');
      updateLanguageDisplay(lang, langName, langFlag);
      if(langSubmenuMobile) {
        langSubmenuMobile.classList.add('hidden');
        langToggleMobileBtn.classList.remove('active');
      }
    });
  });

  // Fermer le menu langue quand on clique à l'extérieur
  document.addEventListener('click', (e) => {
    // Menu langue desktop
    if(langMenu && !langMenu.contains(e.target) && langToggle && !langToggle.contains(e.target)) {
      langMenu.classList.add('hidden');
      if(langToggle) {
        langToggle.classList.remove('active');
        langToggle.setAttribute('aria-expanded', 'false');
      }
    }
    
    // Menu langue mobile
    if(langSubmenuMobile && !langSubmenuMobile.contains(e.target) && langToggleMobileBtn && !langToggleMobileBtn.contains(e.target)) {
      langSubmenuMobile.classList.add('hidden');
      if(langToggleMobileBtn) {
        langToggleMobileBtn.classList.remove('active');
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Menu langue desktop
      if(langMenu && !langMenu.classList.contains('hidden')) {
        langMenu.classList.add('hidden');
        if(langToggle) {
          langToggle.classList.remove('active');
          langToggle.setAttribute('aria-expanded', 'false');
        }
      }
      
      // Menu langue mobile
      if(langSubmenuMobile && !langSubmenuMobile.classList.contains('hidden')) {
        langSubmenuMobile.classList.add('hidden');
        if(langToggleMobileBtn) {
          langToggleMobileBtn.classList.remove('active');
        }
      }
      
      // Fermer aussi les autres menus (comportement existant)
      if(registerMenu) registerMenu.classList.add('hidden');
      if(userMenuMobile) userMenuMobile.classList.add('hidden');
      closeMobileSearch();
    }
  });
  // ===========================================
  // FIN DE LA PARTIE MODIFIÉE
  // ===========================================

  // User menu toggle (Mobile)
  const userToggleMobile = document.getElementById('user-toggle-mobile');
  const userMenuMobile = document.getElementById('user-menu-mobile');

  if(userToggleMobile) {
    userToggleMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      if(userMenuMobile) {
        const isHidden = userMenuMobile.classList.contains('hidden');
        
        if(isHidden) {
          userMenuMobile.classList.remove('hidden');
          userMenuMobile.style.transformOrigin = 'top right';
          userMenuMobile.style.animation = 'fadeInScale 0.3s ease-out forwards';
        } else {
          userMenuMobile.style.animation = 'fadeOutScale 0.2s ease-in forwards';
          setTimeout(() => {
            userMenuMobile.classList.add('hidden');
          }, 200);
        }
      }
    });
  }

  // Register menu toggle (Desktop)
  const registerToggle = document.getElementById('register-toggle');
  const registerMenu = document.getElementById('register-menu');

  if(registerToggle) {
    registerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if(registerMenu) {
        const isHidden = registerMenu.classList.contains('hidden');
        
        if(isHidden) {
          registerMenu.classList.remove('hidden');
          registerMenu.style.animation = 'fadeInScale 0.3s ease-out forwards';
        } else {
          registerMenu.style.animation = 'fadeOutScale 0.2s ease-in forwards';
          setTimeout(() => {
            registerMenu.classList.add('hidden');
          }, 200);
        }
      }
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    if(langMenu) langMenu.classList.add('hidden');
    if(registerMenu) registerMenu.classList.add('hidden');
    if(userMenuMobile) userMenuMobile.classList.add('hidden');
    if(langSubmenuMobile) langSubmenuMobile.classList.add('hidden');
  });

  // Mobile menu functions
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuContent = document.getElementById('mobile-menu-content');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  function openMobileMenu() {
    if(mobileMenu) mobileMenu.classList.remove('hidden');
    setTimeout(() => {
      if(mobileMenuContent) {
        mobileMenuContent.classList.remove('translate-x-full');
        mobileMenuContent.classList.add('translate-x-0');
      }
    }, 10);
  }
  
  function closeMobileMenu() {
    if(mobileMenuContent) {
      mobileMenuContent.classList.remove('translate-x-0');
      mobileMenuContent.classList.add('translate-x-full');
    }
    setTimeout(() => {
      if(mobileMenu) mobileMenu.classList.add('hidden');
    }, 300);
  }

  if(mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMobileMenu);
  if(mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  if(mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);

  // Mobile search functions - SIMPLIFIÉ sans bouton effacer
  const mobileSearchToggle = document.getElementById('mobile-search-toggle');
  const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
  const mobileSearchClose = document.getElementById('mobile-search-close');
  const mobileSearchInput = document.getElementById('mobile-search-input');

  function openMobileSearch() {
    if(mobileSearchOverlay) {
      mobileSearchOverlay.classList.remove('hidden');
      setTimeout(() => {
        mobileSearchOverlay.querySelector('div').classList.remove('-translate-y-full');
        mobileSearchOverlay.querySelector('div').classList.add('translate-y-0');
        if(mobileSearchInput) {
          mobileSearchInput.focus();
          mobileSearchInput.style.color = isDarkMode ? '#f1f5f9' : '#1e293b';
        }
      }, 10);
    }
  }

  function closeMobileSearch() {
    if(mobileSearchOverlay) {
      mobileSearchOverlay.querySelector('div').classList.remove('translate-y-0');
      mobileSearchOverlay.querySelector('div').classList.add('-translate-y-full');
      setTimeout(() => {
        mobileSearchOverlay.classList.add('hidden');
        if(mobileSearchInput) {
          mobileSearchInput.value = '';
        }
      }, 300);
    }
  }

  if(mobileSearchToggle) {
    mobileSearchToggle.addEventListener('click', openMobileSearch);
  }

  if(mobileSearchClose) {
    mobileSearchClose.addEventListener('click', closeMobileSearch);
  }

  if(mobileSearchOverlay) {
    mobileSearchOverlay.addEventListener('click', (e) => {
      if(e.target === mobileSearchOverlay) {
        closeMobileSearch();
      }
    });
  }

  // Barre de recherche desktop - SIMPLIFIÉ sans bouton effacer
  const desktopSearchInput = document.getElementById('desktop-search-input');

  if(desktopSearchInput) {
    desktopSearchInput.addEventListener('focus', () => {
      const searchBox = desktopSearchInput.closest('.search-box-original');
      if(searchBox) {
        searchBox.classList.add('focus-within');
      }
    });

    desktopSearchInput.addEventListener('blur', () => {
      const searchBox = desktopSearchInput.closest('.search-box-original');
      if(searchBox) {
        searchBox.classList.remove('focus-within');
      }
    });
  }

  // Animation au survol pour tous les éléments interactifs
  document.querySelectorAll('button, a, .hover-animation').forEach(element => {
    element.addEventListener('mouseenter', function() {
      if(!this.classList.contains('active')) {
        this.style.transform = 'translateY(-2px)';
      }
    });
    
    element.addEventListener('mouseleave', function() {
      if(!this.classList.contains('active')) {
        this.style.transform = 'translateY(0)';
      }
    });
  });

  // Appliquer les couleurs correctes pour la recherche mobile lors du chargement
  document.addEventListener('DOMContentLoaded', function() {
    if(mobileSearchInput) {
      mobileSearchInput.style.color = isDarkMode ? '#f1f5f9' : '#1e293b';
    }
    
    // Appliquer la couleur noire par défaut pour les textes Home et About Us
    document.querySelectorAll('.nav-text, .mobile-nav-item span').forEach(text => {
      if(!document.documentElement.classList.contains('dark')) {
        text.style.color = '#1f2937'; // Noir
      }
    });
  });