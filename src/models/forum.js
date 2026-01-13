// src/models/Forum.js

export class Forum {
    constructor(id, title, content, authorId, authorName, 
                category = 'Général', createdAt = new Date(), 
                views = 0, commentsCount = 0, likes = 0, isResolved = false) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.authorName = authorName;
        this.category = category;
        this.createdAt = createdAt;
        this.views = views;
        this.commentsCount = commentsCount;
        this.likes = likes;
        this.isResolved = isResolved;
    }

    // Méthode pour créer un Forum à partir d'un document Firestore
    static fromFirestore(doc) {
        const data = doc.data();
        return new Forum(
            doc.id,                     // id
            data.title,                 // titre
            data.content,               // contenu
            data.authorId,              // id auteur
            data.authorName,            // nom auteur
            data.category || 'Général', // catégorie
            data.createdAt ? data.createdAt.toDate() : new Date(), // date
            data.views || 0,            // vues
            data.commentsCount || 0,    // nombre de commentaires
            data.likes || 0,            // likes
            data.isResolved || false    // résolu ?
        );
    }

    // Méthode pour convertir un Forum en objet Firestore
    toFirestore() {
        return {
            title: this.title,
            content: this.content,
            authorId: this.authorId,
            authorName: this.authorName,
            category: this.category,
            createdAt: firebase.firestore.Timestamp.fromDate(this.createdAt),
            views: this.views,
            commentsCount: this.commentsCount,
            likes: this.likes,
            isResolved: this.isResolved,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
    }
}

export class Comment {
    constructor(id, forumId, content, authorId, authorName, 
                createdAt = new Date(), likes = 0, isSolution = false) {
        this.id = id;
        this.forumId = forumId;
        this.content = content;
        this.authorId = authorId;
        this.authorName = authorName;
        this.createdAt = createdAt;
        this.likes = likes;
        this.isSolution = isSolution;
    }

    // Méthode pour créer un Comment à partir d'un document Firestore
    static fromFirestore(doc) {
        const data = doc.data();
        return new Comment(
            doc.id,                     // id
            data.forumId,               // id du forum
            data.content,               // contenu
            data.authorId,              // id auteur
            data.authorName,            // nom auteur
            data.createdAt ? data.createdAt.toDate() : new Date(), // date
            data.likes || 0,            // likes
            data.isSolution || false    // solution ?
        );
    }

    // Méthode pour convertir un Comment en objet Firestore
    toFirestore() {
        return {
            forumId: this.forumId,
            content: this.content,
            authorId: this.authorId,
            authorName: this.authorName,
            createdAt: firebase.firestore.Timestamp.fromDate(this.createdAt),
            likes: this.likes,
            isSolution: this.isSolution
        };
    }
}