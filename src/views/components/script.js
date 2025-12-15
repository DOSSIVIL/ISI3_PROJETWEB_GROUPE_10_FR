/* Partie script pour le defilement des differents utilisateurs qui temoignes de notre application */

const testimonials = [
    {
      name: "Jean K.",
      country: "Cameroun",
      flag: "🇨🇲",
      image: "https://i.pravatar.cc/150?img=5",
      text: "Grâce au tutorat pair-à-pair, j'ai enfin pu progresser en mathématiques. Mon tuteur m'a expliqué les concepts difficiles avec patience et clarté.",
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Amina S.",
      country: "Sénégal",
      flag: "🇸🇳",
      image: "https://i.pravatar.cc/150?img=9",
      text: "L'assistant pédagogique IA m'a sauvé pendant les vacances scolaires. Je pouvais poser mes questions en physique même sans connexion internet stable.",
      color: "from-purple-400 to-purple-600"
    },
    {
      name: "Kwame M.",
      country: "Ghana",
      flag: "🇬🇭",
      image: "https://i.pravatar.cc/150?img=12",
      text: "En tant qu'étudiant en zone rurale, l'accès aux ressources était limité. Maintenant, je peux échanger avec des tuteurs et consulter des documents partagés.",
      color: "from-green-400 to-green-600"
    },
    {
      name: "Fatou D.",
      country: "Côte d'Ivoire",
      flag: "🇨🇮",
      image: "https://i.pravatar.cc/150?img=10",
      text: "La fonctionnalité de tableau blanc collaboratif a transformé mes sessions de tutorat. On résout les problèmes de sciences ensemble en temps réel.",
      color: "from-orange-400 to-orange-600"
    },
    {
      name: "Chérif T.",
      country: "Mali",
      flag: "🇲🇱",
      image: "https://i.pravatar.cc/150?img=14",
      text: "Je suis tuteur bénévole en littérature. La plateforme me permet d'aider des étudiants même à distance. C'est une expérience très enrichissante.",
      color: "from-red-400 to-red-600"
    },
    {
      name: "Marie N.",
      country: "Rwanda",
      flag: "🇷🇼",
      image: "https://i.pravatar.cc/150?img=8",
      text: "L'historique des conversations avec l'assistant IA est génial. Je peux revoir les explications même hors ligne, ce qui est crucial avec notre connexion.",
      color: "from-indigo-400 to-indigo-600"
    }
  ];

  let isPaused = false;
  let currentPage = 0;
  const cardsPerPage = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  const carouselTrack = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('dots-container');
  const pausePlayBtn = document.getElementById('pause-play-btn');
  const pauseIcon = document.getElementById('pause-icon');
  const playIcon = document.getElementById('play-icon');
  const pauseText = document.getElementById('pause-text');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Créer les cards
  function createCards() {
    carouselTrack.innerHTML = '';
    
    // Dupliquer les témoignages pour un défilement infini
    const duplicatedTestimonials = [...testimonials, ...testimonials];
    
    duplicatedTestimonials.forEach((testimonial, index) => {
      const card = document.createElement('div');
      card.className = 'testimonial-card bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-blue-200 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm';
      card.style.animationDelay = `${(index % testimonials.length) * 0.1}s`;
      card.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
      
      card.innerHTML = `
        <!-- Barre de gradient supérieure -->
        <div class="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div class="p-6">
          <!-- Profile Section -->
          <div class="flex items-center gap-4 mb-5">
            <div class="relative flex-shrink-0 group">
              <!-- Avatar avec effet de glow -->
              <div class="absolute inset-0 bg-gradient-to-r ${testimonial.color} rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div class="relative w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.color} p-0.5 shadow-lg">
                <img 
                  src="${testimonial.image}" 
                  alt="${testimonial.name}"
                  class="w-full h-full rounded-full object-cover border-3 border-white"
                  onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&size=64&background=667eea&color=fff&bold=true'"
                />
              </div>
              <!-- Badge diplômé -->
              <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                <i class="fas fa-graduation-cap text-xs"></i>
              </div>
              <!-- Badge vérifié -->
              <div class="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center border-2 border-white shadow-md">
                <i class="fas fa-check text-[10px]"></i>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 text-lg truncate mb-1">${testimonial.name}</h3>
              <p class="text-sm text-gray-600 flex items-center gap-2">
                <span class="text-xl drop-shadow-sm">${testimonial.flag}</span>
                <span class="font-medium">${testimonial.country}</span>
              </p>
            </div>
            
            <!-- Icône de citation -->
            <div class="text-5xl text-purple-200 leading-none opacity-30 -mt-2">
              <i class="fas fa-quote-right"></i>
            </div>
          </div>
          
          <!-- Ligne de séparation 1 -->
          <div class="flex items-center mb-5">
            <div class="flex-grow border-t-2 border-gray-200"></div>
            
            <div class="flex-grow border-t-2 border-gray-200"></div>
          </div>
          
          <!-- Testimonial Text -->
          <div class="mb-5 relative">
            <div class="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b ${testimonial.color} rounded-full opacity-30"></div>
            <p class="text-gray-700 leading-relaxed italic pl-3">
              "${testimonial.text}"
            </p>
          </div>
          
          <!-- Ligne de séparation 2 -->
          <div class="flex items-center mb-4">
              <div class="flex-grow border-t-2 border-gray-200"></div>
              <div class="mx-3">
                  <i class="fas fa-star text-yellow-400 text-lg"></i>
              </div>
              <div class="flex-grow border-t-2 border-gray-200"></div>
          </div>
          
          <!-- Platform Badge -->
          <div class="flex justify-center">
            <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <i class="fas fa-graduation-cap text-blue-500 mr-2 text-base"></i>
              <span class="platform-name flex items-center">
                <span class="typing-animation word-1 font-bold" style="background: linear-gradient(90deg, #ff3131, #ff914d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 20px rgba(255,49,49,0.3);">
                  Edu
                </span>
                <span class="typing-animation word-2 mr-1 font-bold" style="background: linear-gradient(90deg, #8c52ff, #5ce1e6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 20px rgba(140,82,255,0.3);">
                  Connect
                </span>
                <span class="typing-animation word-3 font-bold" style="background: linear-gradient(90deg, #8c52ff, #ff914d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 20px rgba(140,82,255,0.3);">
                  Africa
                </span>
              </span>
            </div>
          </div>
        </div>
      `;
      
      // Pause on hover
      card.addEventListener('mouseenter', () => {
        if (!isPaused) {
          carouselTrack.classList.add('paused');
        }
      });
      
      card.addEventListener('mouseleave', () => {
        if (!isPaused) {
          carouselTrack.classList.remove('paused');
        }
      });
      
      carouselTrack.appendChild(card);
    });
  }
  // Créer les dots
  function createDots() {
    dotsContainer.innerHTML = '';
    const totalPages = Math.ceil(testimonials.length / cardsPerPage);
    
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${
        i === currentPage 
          ? 'bg-blue-500 w-6' 
          : 'bg-gray-300 hover:bg-gray-400'
      }`;
      dot.addEventListener('click', () => goToPage(i));
      dotsContainer.appendChild(dot);
    }
  }

  // Toggle Pause/Play
  function togglePausePlay() {
    isPaused = !isPaused;
    
    if (isPaused) {
      carouselTrack.classList.add('paused');
      pauseIcon.classList.add('hidden');
      playIcon.classList.remove('hidden');
      pauseText.textContent = 'Lecture';
    } else {
      carouselTrack.classList.remove('paused');
      pauseIcon.classList.remove('hidden');
      playIcon.classList.add('hidden');
      pauseText.textContent = 'Pause';
    }
  }

  // Navigation
  function goToPage(page) {
    currentPage = page;
    const cardWidth = 340 + 24; // card width + gap
    const offset = -page * cardWidth * cardsPerPage;
    carouselTrack.style.transform = `translateX(${offset}px)`;
    createDots();
  }

  function nextPage() {
    const totalPages = Math.ceil(testimonials.length / cardsPerPage);
    currentPage = (currentPage + 1) % totalPages;
    goToPage(currentPage);
  }

  function prevPage() {
    const totalPages = Math.ceil(testimonials.length / cardsPerPage);
    currentPage = (currentPage - 1 + totalPages) % totalPages;
    goToPage(currentPage);
  }

  // Event Listeners
  pausePlayBtn.addEventListener('click', togglePausePlay);
  nextBtn.addEventListener('click', nextPage);
  prevBtn.addEventListener('click', prevPage);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
    if (e.key === ' ') {
      e.preventDefault();
      togglePausePlay();
    }
  });

  // Responsive handling
  window.addEventListener('resize', () => {
    createCards();
    createDots();
  });

  // Initialize
  createCards();
  createDots();


/* fin de cette partie  */

/* Partie Chiffres et impacts de l'application  */

// Liste des pays africains
const africanCountries = [
    { name: "Cameroun", flag: "🇨🇲" },
    { name: "Sénégal", flag: "🇸🇳" },
    { name: "Côte d'Ivoire", flag: "🇨🇮" },
    { name: "Maroc", flag: "🇲🇦" },
    { name: "Nigéria", flag: "🇳🇬" },
    { name: "Ghana", flag: "🇬🇭" },
    { name: "Algérie", flag: "🇩🇿" },
    { name: "Tunisie", flag: "🇹🇳" },
    { name: "Kenya", flag: "🇰🇪" },
    { name: "Afrique du Sud", flag: "🇿🇦" },
    { name: "Égypte", flag: "🇪🇬" },
    { name: "Mali", flag: "🇲🇱" },
    { name: "Burkina Faso", flag: "🇧🇫" },
    { name: "Bénin", flag: "🇧🇯" },
    { name: "Togo", flag: "🇹🇬" },
    { name: "RDC", flag: "🇨🇩" },
    { name: "Tanzanie", flag: "🇹🇿" },
    { name: "Zambie", flag: "🇿🇲" },
    { name: "Ouganda", flag: "🇺🇬" },
    { name: "Angola", flag: "🇦🇴" },
    { name: "Éthiopie", flag: "🇪🇹" },
    { name: "Soudan", flag: "🇸🇩" },
    { name: "Guinée", flag: "🇬🇳" },
    { name: "Gabon", flag: "🇬🇦" }
];

// Liste des matières
const subjects = [
    "Mathématiques",
    "Physique",
    "Sciences de la Terre",
    "Littérature camerounaise",
    "Informatique"
];

// Fonction simple d'animation de comptage
function startCounting() {
    const counters = document.querySelectorAll('.count-up');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = Math.ceil(target / 50);
        const updateCounter = () => {
            current += increment;
            if (current > target) {
                current = target;
            }
            counter.textContent = current;
            
            if (current < target) {
                setTimeout(updateCounter, 30);
            }
        };
        updateCounter();
    });
}

// Fonction simple d'animation de liste
function animateList(list, containerId, interval = 2000) {
    const container = document.getElementById(containerId);
    let currentIndex = 0;
    let isPaused = false;
    
    // Fonction pour afficher un élément
    function showItem(index) {
        const item = list[index];
        let content;
        
        if (item.flag) {
            content = `<div class="flex items-center justify-center animate-fade-in">
                <span class="text-xl mr-2">${item.flag}</span>
                <span>${item.name}</span>
            </div>`;
        } else {
            content = `<div class="text-center animate-fade-in">${item}</div>`;
        }
        
        container.innerHTML = content;
    }
    
    // Démarrer l'animation automatique
    function startAutoAnimation() {
        if (isPaused) return;
        
        showItem(currentIndex);
        currentIndex = (currentIndex + 1) % list.length;
        
        setTimeout(startAutoAnimation, interval);
    }
    
    // Ajouter un style CSS pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Ajouter l'interactivité : pause au survol
    container.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    
    container.addEventListener('mouseleave', () => {
        isPaused = false;
        setTimeout(startAutoAnimation, 1000);
    });
    
    // Ajouter l'interactivité : clic pour avancer manuellement
    container.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % list.length;
        showItem(currentIndex);
        isPaused = true;
        
        // Reprendre automatiquement après 3 secondes
        setTimeout(() => {
            isPaused = false;
            startAutoAnimation();
        }, 3000);
    });
    
    // Démarrer l'animation
    showItem(0);
    setTimeout(() => {
        startAutoAnimation();
    }, 1000);
}

// Fonction pour démarrer toutes les animations
function startAllAnimations() {
    // Démarrer les compteurs
    startCounting();
    
    // Démarrer les animations de liste après un délai
    setTimeout(() => {
        animateList(africanCountries, 'country-animation', 2500);
        animateList(subjects, 'subject-animation', 2500);
    }, 1500);
}

// Version SIMPLIFIÉE - Démarrer les animations au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Option 1: Démarrer immédiatement (le plus simple)
    startAllAnimations();
    
    // Option 2: Démarrer quand la section devient visible (plus avancé)
    /*
    const statsSection = document.getElementById('stats-section');
    
    // Créer un observer simple
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAllAnimations();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    
    observer.observe(statsSection);
    */
});

// Alternative: Démarrer les animations quand l'utilisateur clique sur la section
document.getElementById('stats-section').addEventListener('click', function() {
    if (!this.classList.contains('animations-started')) {
        this.classList.add('animations-started');
        startAllAnimations();
    }
});
