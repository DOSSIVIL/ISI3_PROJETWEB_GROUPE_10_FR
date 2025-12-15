<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Témoignages - EduConnect Africa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideCards {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(-100% - 1.5rem)); }
    }
    
    .testimonial-card {
      animation: fadeIn 0.6s ease-out forwards;
      min-width: 340px;
    }
    
    @media (max-width: 640px) {
      .testimonial-card {
        min-width: 290px;
      }
    }
    
    .carousel-track {
      display: flex;
      gap: 1.5rem;
      animation: slideCards 40s linear infinite;
    }
    
    .carousel-track.paused {
      animation-play-state: paused;
    }
    
    .simple-gradient-bg {
      background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%);
    }
    
    .simple-gradient-text {
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    
    .card-gradient-border {
      position: relative;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%) border-box;
      border: 2px solid transparent;
    }
  </style>
</head>
<body class="simple-gradient-bg min-h-screen py-12 px-4">

  <section class="max-w-6xl mx-auto">
    
    <!-- Header -->
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Ils parlent de 
        <span class="simple-gradient-text">EduConnect Africa</span>
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Découvrez comment notre plateforme collaborative transforme l'éducation en Afrique
      </p>
      
      <!-- Pause/Play Button -->
      <button id="pause-play-btn" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full shadow-sm hover:shadow transition-all duration-300">
        <i id="pause-icon" class="fas fa-pause text-blue-600"></i>
        <i id="play-icon" class="fas fa-play text-blue-600 hidden"></i>
        <span class="text-sm font-medium text-gray-700" id="pause-text">Pause</span>
      </button>
    </div>

    <!-- Carousel Container -->
    <div class="relative overflow-hidden py-6">
      
      <!-- Gradient Overlays -->
      <div class="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
      
      <!-- Carousel Track -->
      <div id="carousel-track" class="carousel-track">
        <!-- Cards will be dynamically inserted here -->
      </div>
      
    </div>

    <!-- Navigation Dots -->
    <div class="flex justify-center items-center gap-4 mt-8">
      <button id="prev-btn" class="group flex items-center justify-center w-10 h-10 bg-white hover:bg-blue-50 border border-gray-200 rounded-full shadow-sm hover:shadow transition-all">
        <i class="fas fa-chevron-left text-gray-700 group-hover:text-blue-600"></i>
      </button>
      
      <div id="dots-container" class="flex gap-2 mx-4">
        <!-- Dots will be dynamically inserted here -->
      </div>
      
      <button id="next-btn" class="group flex items-center justify-center w-10 h-10 bg-white hover:bg-blue-50 border border-gray-200 rounded-full shadow-sm hover:shadow transition-all">
        <i class="fas fa-chevron-right text-gray-700 group-hover:text-blue-600"></i>
      </button>
    </div>

    <!-- Stats Section -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
      <div class="card-gradient-border rounded-xl p-4 text-center hover:shadow-md transition-shadow duration-300">
        <div class="text-xl md:text-2xl font-bold simple-gradient-text mb-1">500+</div>
        <div class="text-gray-600 text-xs md:text-sm">Étudiants actifs</div>
      </div>
      <div class="card-gradient-border rounded-xl p-4 text-center hover:shadow-md transition-shadow duration-300">
        <div class="text-xl md:text-2xl font-bold simple-gradient-text mb-1">50+</div>
        <div class="text-gray-600 text-xs md:text-sm">Tuteurs bénévoles</div>
      </div>
      <div class="card-gradient-border rounded-xl p-4 text-center hover:shadow-md transition-shadow duration-300">
        <div class="text-xl md:text-2xl font-bold simple-gradient-text mb-1">100%</div>
        <div class="text-gray-600 text-xs md:text-sm">Gratuit</div>
      </div>
      <div class="card-gradient-border rounded-xl p-4 text-center hover:shadow-md transition-shadow duration-300">
        <div class="text-xl md:text-2xl font-bold simple-gradient-text mb-1">5</div>
        <div class="text-gray-600 text-xs md:text-sm">Matières principales</div>
      </div>
    </div>
    
  </section>

<script>
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
      card.className = 'testimonial-card bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer';
      card.style.animationDelay = `${(index % testimonials.length) * 0.1}s`;
      
      card.innerHTML = `
        <div class="p-5">
          <!-- Profile Section -->
          <div class="flex items-center gap-3 mb-4">
            <div class="relative flex-shrink-0">
              <img 
                src="${testimonial.image}" 
                alt="${testimonial.name}"
                class="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&size=48&background=random'"
              />
              <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r ${testimonial.color} text-white flex items-center justify-center">
                <i class="fas fa-user-graduate text-xs"></i>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 truncate">${testimonial.name}</h3>
              <p class="text-sm text-gray-600">
                <span class="text-lg mr-1">${testimonial.flag}</span>
                ${testimonial.country}
              </p>
            </div>
          </div>
          
          <!-- Testimonial Text -->
          <div class="mb-4">
            <p class="text-gray-700 text-sm leading-relaxed">
              "${testimonial.text}"
            </p>
          </div>
          
          <!-- Platform Badge -->
          <div class="pt-3 border-t border-gray-100">
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
              <i class="fas fa-graduation-cap text-blue-500"></i>
              EduConnect Africa
            </span>
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
</script>

</body>
</html>
