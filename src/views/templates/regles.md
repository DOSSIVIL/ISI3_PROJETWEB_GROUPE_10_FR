```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Collection matieres : lecture publique, écriture réservée aux enseignants
    match /matieres/{matiereId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
                                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "enseignant";
    }

    // Tes collections existantes
    match /enseignants/{enseignantId} {
      allow create: if request.auth != null &&
                     request.resource.data.uid is string &&
                     request.resource.data.email is string &&
                     request.resource.data.nom is string &&
                     request.resource.data.prenom is string &&
                     request.resource.data.uid == request.auth.uid &&
                     request.resource.data.role == "enseignant";

      allow read, update: if request.auth != null &&
                           resource.data.uid == request.auth.uid;
    }

    match /etudiants/{etudiantId} {
      // ... inchangé
    }

    match /users/{userId} {
      // ... inchangé
    }
  }
}

```

// Jnuior@02
