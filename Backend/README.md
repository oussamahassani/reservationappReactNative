
# API JenCity

API pour l'application JenCity, permettant de découvrir et d'explorer la région de Jendouba en Tunisie.

## 📋 Fonctionnalités

- Authentification des utilisateurs
- Gestion des lieux touristiques
- Événements et réservations
- Système d'avis et notations
- Messagerie entre utilisateurs
- Promotions et offres spéciales

## 🚀 Guide d'installation et démarrage

### Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm ou yarn

### Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/jencity-api.git
   cd jencity-api
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   Créez un fichier `.env` à la racine du projet avec les variables suivantes :
   ```
   DB_HOST=localhost
   DB_USER=votre_utilisateur_mysql
   DB_PASSWORD=votre_mot_de_passe_mysql
   DB_NAME=myapp_database1
   PORT=3000
   SESSION_SECRET=votre_secret_de_session
   JWT_SECRET=votre_secret_jwt
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Initialisez la base de données :
   ```bash
   node database/init.js
   ```

5. Démarrez le serveur :
   ```bash
   npm start
   ```

Pour le développement, vous pouvez utiliser :
```bash
npm run dev
```

Le serveur sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)

## 📋 Structure de la base de données

L'application utilise les tables suivantes :

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs de l'application (administrateurs, utilisateurs normaux) |
| `places` | Lieux touristiques avec descriptions, images et coordonnées |
| `events` | Événements organisés dans la région |
| `sessions` | Sessions de messagerie entre utilisateurs |
| `messages` | Messages échangés dans les sessions |
| `reviews` | Avis et notations des utilisateurs sur les lieux |
| `reservations` | Réservations d'événements ou de visites |
| `promotions` | Offres promotionnelles pour les lieux touristiques |

## 📚 API Routes

### Routes Utilisateurs
- `POST /api/users/register` - Inscription d'un nouvel utilisateur
- `POST /api/users/login` - Connexion d'un utilisateur
- `GET /api/users/profile` - Obtenir le profil de l'utilisateur connecté
- `PUT /api/users/profile` - Mettre à jour le profil de l'utilisateur

### Routes Lieux
- `GET /api/places` - Obtenir tous les lieux
- `GET /api/places/:id` - Obtenir un lieu spécifique
- `POST /api/places` - Créer un nouveau lieu (admin/provider)
- `PUT /api/places/:id` - Mettre à jour un lieu (admin/provider)
- `DELETE /api/places/:id` - Supprimer un lieu (admin)

### Routes Sessions et Messages
- `GET /api/sessions` - Obtenir toutes les sessions de l'utilisateur
- `POST /api/sessions` - Créer une nouvelle session de messagerie
- `GET /api/sessions/:id` - Obtenir une session spécifique avec messages
- `GET /api/messages/session/:sessionId` - Obtenir tous les messages d'une session
- `POST /api/messages` - Envoyer un nouveau message

### Routes Événements et Réservations
- `GET /api/events` - Obtenir tous les événements
- `POST /api/reservations` - Créer une nouvelle réservation
- `GET /api/reservations/user` - Obtenir les réservations de l'utilisateur

## 📝 Exemple d'utilisation

### Inscription d'un utilisateur

```javascript
fetch('http://localhost:3000/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Dupont Jean',
    email: 'jean.dupont@example.com',
    password: 'motdepasse123'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));
```

### Connexion d'un utilisateur

```javascript
fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'jean.dupont@example.com',
    password: 'motdepasse123'
  })
})
.then(response => response.json())
.then(data => {
  // Stocker le token JWT retourné
  localStorage.setItem('userToken', data.token);
  console.log(data);
})
.catch(error => console.error('Erreur:', error));
```

## 🛠️ Commandes disponibles

- `npm start` : Démarre le serveur
- `npm run dev` : Démarre le serveur en mode développement avec nodemon

## 📚 Informations supplémentaires

Le mot de passe des utilisateurs de test est : 123123

## 📝 Licence

Ce projet est sous licence MIT.
