// scripts/mock-data.js
// Données de test pour le développement

const MockData = {
    tutors: [
        {
            id: 1,
            name: "Dr. Marie Curie",
            subject: "physics",
            subjectName: "Physique",
            rating: 4.9,
            totalSessions: 128,
            pricePerHour: 2500,
            available: true,
            online: true,
            description: "Spécialiste en physique quantique avec 10 ans d'expérience. Lauréate du prix Nobel de physique.",
            languages: ["Français", "Anglais", "Polonais"],
            education: "PhD en Physique - Université de Paris",
            experience: "10 ans",
            avatar: "MC",
            reviews: 47,
            specialties: ["Mécanique quantique", "Radioactivité", "Physique nucléaire"],
            schedule: {
                monday: ["14:00-16:00", "18:00-20:00"],
                tuesday: ["10:00-12:00", "15:00-17:00"],
                wednesday: ["09:00-11:00", "14:00-16:00"],
                thursday: ["13:00-15:00", "17:00-19:00"],
                friday: ["11:00-13:00", "16:00-18:00"]
            }
        },
        {
            id: 2,
            name: "Prof. Jean Dupont",
            subject: "math",
            subjectName: "Mathématiques",
            rating: 4.7,
            totalSessions: 95,
            pricePerHour: 2000,
            available: true,
            online: false,
            description: "Expert en algèbre et calcul différentiel. Passionné par la pédagogie adaptative.",
            languages: ["Français"],
            education: "Master en Mathématiques - École Normale Supérieure",
            experience: "8 ans",
            avatar: "JD",
            reviews: 32,
            specialties: ["Algèbre linéaire", "Calcul différentiel", "Statistiques"],
            schedule: {
                monday: ["08:00-10:00", "14:00-16:00"],
                tuesday: ["09:00-11:00", "15:00-17:00"],
                wednesday: ["10:00-12:00", "16:00-18:00"],
                thursday: ["13:00-15:00"],
                friday: ["11:00-13:00", "17:00-19:00"]
            }
        },
        {
            id: 3,
            name: "Alan Turing",
            subject: "info",
            subjectName: "Informatique",
            rating: 5.0,
            totalSessions: 210,
            pricePerHour: 3000,
            available: true,
            online: true,
            description: "Pionnier de l'informatique moderne. Expert en algorithmes et cryptographie.",
            languages: ["Anglais", "Français"],
            education: "Computer Science - Massachusetts Institute of Technology",
            experience: "12 ans",
            avatar: "AT",
            reviews: 89,
            specialties: ["Algorithmes", "Cryptographie", "Intelligence Artificielle"],
            schedule: {
                monday: ["10:00-12:00", "15:00-17:00"],
                tuesday: ["14:00-16:00", "18:00-20:00"],
                wednesday: ["09:00-11:00", "13:00-15:00"],
                thursday: ["11:00-13:00", "16:00-18:00"],
                friday: ["10:00-12:00", "14:00-16:00"]
            }
        },
        {
            id: 4,
            name: "Chinua Achebe",
            subject: "literature",
            subjectName: "Littérature",
            rating: 4.8,
            totalSessions: 75,
            pricePerHour: 1800,
            available: false,
            online: true,
            description: "Romancier et poète nigérian. Spécialiste en littérature africaine postcoloniale.",
            languages: ["Anglais", "Français", "Igbo"],
            education: "PhD en Littérature - Université de Ibadan",
            experience: "15 ans",
            avatar: "CA",
            reviews: 28,
            specialties: ["Littérature africaine", "Postcolonialisme", "Roman"],
            schedule: {
                monday: ["13:00-15:00"],
                tuesday: ["10:00-12:00", "16:00-18:00"],
                wednesday: ["14:00-16:00"],
                thursday: ["09:00-11:00", "15:00-17:00"],
                friday: ["11:00-13:00"]
            }
        },
        {
            id: 5,
            name: "Wangari Maathai",
            subject: "science",
            subjectName: "Sciences de la Terre",
            rating: 4.6,
            totalSessions: 62,
            pricePerHour: 2200,
            available: true,
            online: false,
            description: "Environnementaliste et biologiste kenyane. Lauréate du prix Nobel de la paix.",
            languages: ["Anglais", "Swahili"],
            education: "PhD en Sciences Environnementales - Université de Nairobi",
            experience: "20 ans",
            avatar: "WM",
            reviews: 19,
            specialties: ["Écologie", "Biologie végétale", "Développement durable"],
            schedule: {
                monday: ["09:00-11:00"],
                tuesday: ["14:00-16:00"],
                wednesday: ["10:00-12:00", "15:00-17:00"],
                thursday: ["13:00-15:00"],
                friday: ["11:00-13:00", "16:00-18:00"]
            }
        }
    ],

    chatMessages: [
        {
            id: 1,
            sender: "tutor",
            name: "Dr. Marie Curie",
            time: "10:00",
            content: "Bonjour ! Bienvenue dans notre session de tutorat. Comment puis-je vous aider aujourd'hui ?",
            type: "text"
        },
        {
            id: 2,
            sender: "student",
            name: "Vous",
            time: "10:01",
            content: "Bonjour Dr. Curie ! J'ai des difficultés avec les équations du mouvement rectiligne uniforme.",
            type: "text"
        },
        {
            id: 3,
            sender: "tutor",
            name: "Dr. Marie Curie",
            time: "10:02",
            content: "Excellent sujet ! Commençons par la formule de base : v = d/t. Avez-vous des exercices spécifiques ?",
            type: "text"
        },
        {
            id: 4,
            sender: "tutor",
            name: "Dr. Marie Curie",
            time: "10:03",
            content: "Je viens de partager un document PDF avec des exercices pratiques. Regardez dans les fichiers partagés.",
            type: "file",
            fileInfo: {
                name: "Exercices_MRU.pdf",
                size: "2.4 MB",
                type: "pdf"
            }
        },
        {
            id: 5,
            sender: "student",
            name: "Vous",
            time: "10:04",
            content: "Merci ! Je vois le fichier. Pour la première équation, je dois trouver la vitesse...",
            type: "text"
        }
    ],

    // Méthodes utilitaires
    getTutorById(id) {
        return this.tutors.find(tutor => tutor.id === id);
    },

    getTutorsBySubject(subject) {
        if (subject === 'all') return this.tutors;
        return this.tutors.filter(tutor => tutor.subject === subject);
    },

    getAvailableTutors() {
        return this.tutors.filter(tutor => tutor.available);
    },

    getOnlineTutors() {
        return this.tutors.filter(tutor => tutor.online);
    },

    searchTutors(query) {
        const lowerQuery = query.toLowerCase();
        return this.tutors.filter(tutor => 
            tutor.name.toLowerCase().includes(lowerQuery) ||
            tutor.subjectName.toLowerCase().includes(lowerQuery) ||
            (tutor.description && tutor.description.toLowerCase().includes(lowerQuery)) ||
            (tutor.specialties && tutor.specialties.some(s => s.toLowerCase().includes(lowerQuery))) ||
            (tutor.education && tutor.education.toLowerCase().includes(lowerQuery))
        );
    }
};

// Exposer globalement pour le développement
window.MockData = MockData;