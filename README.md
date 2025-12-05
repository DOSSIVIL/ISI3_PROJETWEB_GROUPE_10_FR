# ISI3_PROJETWEB_GROUPE_10_FR
#  EduConnect Africa : Tutoring Platform

---

## Contexte et Problématique

En Afrique, l’accès à une éducation de qualité est souvent limité par plusieurs facteurs :  

- Pénurie d’enseignants qualifiés, notamment en zones rurales  
- Ressources éducatives limitées  
- Manque d’accompagnement académique personnalisé  
- Fracture numérique et accès limité à Internet  

**Solution proposée :**  
EduConnect Africa  Une plateforme web collaborative de tutorat qui connecte les étudiants à des tuteurs bénévoles et à des ressources éducatives adaptées au contexte africain.

---

##  Fonctionnalités Principales

### 1️⃣ Système de tutorat peer-to-peer
- Connexion étudiants/tuteurs via **Peer.js**  
- Sessions de tutorat en temps réel (texte, audio et/ou vidéo)  
- Tableau blanc collaboratif *(optionnel)*  
- Partage de documents et ressources *(optionnel)*  

### 2️⃣ Assistant pédagogique IA
- Chat avec un tuteur virtuel  
- Catégories de discussion : Mathématiques, Physique, Sciences de la Terre, Littérature camerounaise, Informatique  
- Support multilingue : Anglais et Français  
- Historique des conversations consultable hors-ligne  

### 3️⃣ Gestion des utilisateurs
- Création de compte étudiant (nom, prénom, classe, identifiant, mot de passe)  
- Création de compte enseignant (nom, prénom, identifiant, mot de passe, matières enseignées)  
- Les étudiants peuvent consulter la liste des enseignants par matière  
- Consultation du profil utilisateur  

---

## ⚙️ Contraintes Techniques

- Langages autorisés : **HTML, CSS, JavaScript**  
- Frameworks autorisés : **Bootstrap** ou **TailwindCSS** (avec thème au choix)  
- Technologies utilisées : **Peer.js, DeepSeek API, Firestore (Firebase), Canvas**  
- Focus sur **l’esthétique et l’ergonomie**  
- Déploiement obligatoire de l’application web  
 

---
## 🛠 Installation du Projet et ses dependances 

# 1️⃣ Cloner le projet depuis GitHub
git clone git@github.com:DOSSIVIL/ISI3_PROJETWEB_GROUPE_10_FR.git

# 2️⃣ Entrer dans le dossier du projet
cd ISI3_PROJETWEB_GROUPE_10_FR

# 3️⃣ Installer les dépendances du projet (Vite + JS)
npm install
# 4️⃣ Installer TailwindCSS, PostCSS et Autoprefixer
npm install -D tailwindcss postcss autoprefixer


---

## 📂 Structure du Projet Vite en MVC

```text
ISI3_PROJETWEB_GROUPE_10_FR/
│
├── index.html
├── package.json
├── package-lock.json
│
├── public/                 
│   └── images/
│
└── src/
    │
    ├── models/             # M = données et logique métier
    │   
    │
    │
    ├── views/              # V = affichage (HTML/CSS)
    │   |
    │   |
    │   ├── templates/      # fragments HTML
    │   │   
    │   │   
    │   ├── css/
    │   │   
    │   └── components/     # vues dynamiques JS
    │       
    │
    ├── controllers/        # C = relie Models ↔ Views
    │   
    │   
    │   
    │
    ├── services/           # appels API, stockage local, etc.
    │   
    │   
    │
    ├── utils/              # helpers, formats, validations, etc.
    │   
    │
    ├── main.js             # point d’entrée de l'application
    └── app.js              # initialisation globale (router, événements)

