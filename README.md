# ISI3_PROJETWEB_GROUPE_10_FR
#  Projet : Tutoring Platform

---

## Contexte et Problématique

En Afrique, l’accès à une éducation de qualité est souvent limité par plusieurs facteurs :  

- Pénurie d’enseignants qualifiés, notamment en zones rurales  
- Ressources éducatives limitées  
- Manque d’accompagnement académique personnalisé  
- Fracture numérique et accès limité à Internet  

**Solution proposée :**  
Une plateforme web collaborative de tutorat qui connecte les étudiants à des tuteurs bénévoles et à des ressources éducatives adaptées au contexte africain.

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
- Aucun autre framework n’est autorisé (0 sinon)  

---
## 🛠 Création de la structure du projet

Pour créer l’arborescence du projet, vous pouvez utiliser les commandes suivantes sous Windows (cmd) :

```bat
# 1. Création du dossier racine
mkdir tutoring-platform

# 2. Création des dossiers principaux (src, public, docs)
mkdir tutoring-platform/src
mkdir tutoring-platform/public
mkdir tutoring-platform/docs

# 3. Création des dossiers de niveau src/
mkdir tutoring-platform/src/css
mkdir tutoring-platform/src/js
mkdir tutoring-platform/src/layouts
mkdir tutoring-platform/src/assets

# 4. Création des sous-dossiers de niveau src/assets/
mkdir tutoring-platform/src/assets/images
mkdir tutoring-platform/src/assets/audio
mkdir tutoring-platform/src/assets/video
mkdir tutoring-platform/src/assets/fonts
```
## 📂 Structure du Projet

```text
tutoring-platform/
│
├── index.html                 # ← POINT D'ENTRÉE (appelle header, footer, main)
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── audio/
|   |   ├── Vidéo/
│   │   └── fonts/
│   │
│   ├── css/
│   │   
│   ├── js/   
│   │   
│   │   
│   │
│   └── layouts/               # ← TEMPLATES HTML (header.html, footer.html, main.html)
│
├── public/
│   ├── manifest.json
│   └── service-worker.js
│
└── docs/
