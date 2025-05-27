
/**
 * Utilitaire d'extraction des routes API
 * 
 * Analyse les fichiers de routes pour générer automatiquement
 * la documentation de l'API
 */
const fs = require('fs');
const path = require('path');

/**
 * Extrait les informations de routes à partir des fichiers de routes
 * @returns {Array} Liste des routes avec leurs détails
 */
exports.extractRoutes = () => {
  console.log('Extraction des routes API...');
  const routesDir = path.join(__dirname, '..', 'routes');
  const routes = [];
  
  try {
    // Lire tous les fichiers de routes
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('Routes.js'));
    
    routeFiles.forEach(file => {
      console.log(`Analyse du fichier: ${file}`);
      
      // Lire le contenu du fichier
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extraire le nom de l'entité à partir du nom du fichier
      const entity = file.replace('Routes.js', '').toLowerCase();
      
      // Rechercher les définitions de routes
      const routeRegex = /router\.(get|post|put|delete)\s*\(\s*['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = routeRegex.exec(content)) !== null) {
        const method = match[1];
        const path = match[2];
        
        // Rechercher la description dans les commentaires au-dessus de la route
        const routeBlock = content.substring(0, match.index);
        const descriptionMatch = routeBlock.match(/@desc\s+([^\n]+)/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : `${method.toUpperCase()} ${path}`;
        
        // Construire un chemin complet avec l'entité
        const fullPath = path.startsWith('/') ? 
          `/${entity}${path}` :
          `/${entity}/${path}`;
        
        // Construire des exemples de requête et réponse
        let requestBody = null;
        let responseExample = { status: 200 };
        
        if (method === 'post' || method === 'put') {
          requestBody = generateRequestBody(entity, method);
          responseExample = generateResponseExample(entity, method);
        } else if (method === 'get') {
          responseExample = generateResponseExample(entity, method);
        } else if (method === 'delete') {
          responseExample = {
            status: 200,
            message: `${entity.slice(0, -1)} supprimé avec succès`
          };
        }
        
        routes.push({
          method,
          path: fullPath,
          description,
          params: extractParams(path),
          requestBody,
          response: responseExample
        });
      }
    });
    
    console.log(`${routes.length} routes extraites avec succès`);
    return routes;
    
  } catch (error) {
    console.error('Erreur lors de l\'extraction des routes:', error);
    return [];
  }
};

/**
 * Extrait les paramètres d'une route
 * @param {string} path Chemin de la route
 * @returns {Array} Liste des paramètres
 */
function extractParams(path) {
  const params = [];
  const paramRegex = /:([a-zA-Z0-9_]+)/g;
  let match;
  
  while ((match = paramRegex.exec(path)) !== null) {
    params.push({
      name: match[1],
      type: 'string',
      required: true,
      description: `Identifiant de ${match[1]}`
    });
  }
  
  return params;
}

/**
 * Génère un exemple de corps de requête en fonction de l'entité
 * @param {string} entity Nom de l'entité
 * @param {string} method Méthode HTTP
 * @returns {Object} Corps de requête exemple
 */
function generateRequestBody(entity, method) {
  const examples = {
    users: {
      post: {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        password: 'MotDePasse123',
        phone: '12345678'
      },
      put: {
        nom: 'Dupont',
        prenom: 'Jean-Pierre',
        phone: '87654321'
      }
    },
    places: {
      post: {
        nom: 'Café des Artistes',
        description: 'Un café chaleureux au cœur de Jendouba',
        adresse: '23 Rue des Oliviers, Jendouba',
        latitude: 36.5,
        longitude: 8.7,
        categorie: 'restaurant'
      },
      put: {
        nom: 'Café des Artistes - Jendouba',
        description: 'Le café le plus chaleureux au cœur de Jendouba'
      }
    },
    events: {
      post: {
        titre: 'Festival des Oliviers',
        description: 'Célébration annuelle de la récolte des olives',
        date_debut: '2023-11-15T18:00:00',
        date_fin: '2023-11-17T22:00:00',
        lieu: 'Place centrale, Jendouba',
        place_id: 1
      },
      put: {
        titre: 'Grand Festival des Oliviers',
        description: 'La plus grande célébration annuelle de la récolte des olives',
        place_id: 2
      }
    },
    reviews: {
      post: {
        place_id: 1,
        note: 4.5,
        commentaire: 'Service excellent et cadre magnifique'
      },
      put: {
        note: 5,
        commentaire: 'Service exceptionnel et cadre magnifique, à recommander!'
      }
    },
    reservations: {
      post: {
        place_id: 1,
        date: '2023-11-20T19:00:00',
        nombre_personnes: 4,
        details: 'Table près de la fenêtre si possible'
      },
      put: {
        date: '2023-11-21T20:00:00',
        nombre_personnes: 6,
        statut: 'confirmée'
      }
    },
    messagerie: {
      post: {
        destinataire_id: 2,
        sujet: 'Question sur votre lieu',
        contenu: 'Bonjour, j\'aimerais savoir si vous acceptez les réservations de groupe.'
      },
      put: {
        lu: true
      }
    }
  };
  
  // Trouver l'entité correspondante (singulier/pluriel)
  const entityKey = Object.keys(examples).find(key => 
    key === entity || key === entity.slice(0, -1) || entity === key.slice(0, -1)
  );
  
  if (entityKey && examples[entityKey][method]) {
    return examples[entityKey][method];
  }
  
  // Exemple par défaut
  return method === 'post' ? 
    { name: 'Exemple', description: 'Description d\'exemple' } : 
    { name: 'Exemple modifié' };
}

/**
 * Génère un exemple de réponse en fonction de l'entité
 * @param {string} entity Nom de l'entité
 * @param {string} method Méthode HTTP
 * @returns {Object} Réponse exemple
 */
function generateResponseExample(entity, method) {
  const examples = {
    users: {
      get: {
        status: 200,
        data: {
          user_id: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@example.com',
          role: 'utilisateur',
          date_creation: '2023-10-15T14:30:00'
        }
      },
      post: {
        status: 201,
        message: 'Utilisateur créé avec succès',
        data: {
          user_id: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@example.com',
          role: 'utilisateur'
        }
      },
      put: {
        status: 200,
        message: 'Utilisateur mis à jour avec succès',
        data: {
          user_id: 1,
          nom: 'Dupont',
          prenom: 'Jean-Pierre',
          email: 'jean.dupont@example.com'
        }
      }
    },
    places: {
      get: {
        status: 200,
        data: {
          place_id: 1,
          nom: 'Café des Artistes',
          description: 'Un café chaleureux au cœur de Jendouba',
          adresse: '23 Rue des Oliviers, Jendouba',
          latitude: 36.5,
          longitude: 8.7,
          categorie: 'restaurant',
          note_moyenne: 4.2,
          images: ['cafe1.jpg', 'cafe2.jpg']
        }
      },
      post: {
        status: 201,
        message: 'Lieu créé avec succès',
        data: {
          place_id: 1,
          nom: 'Café des Artistes',
          description: 'Un café chaleureux au cœur de Jendouba'
        }
      },
      put: {
        status: 200,
        message: 'Lieu mis à jour avec succès',
        data: {
          place_id: 1,
          nom: 'Café des Artistes - Jendouba',
          description: 'Le café le plus chaleureux au cœur de Jendouba'
        }
      }
    }
  };
  
  // Trouver l'entité correspondante (singulier/pluriel)
  const entityKey = Object.keys(examples).find(key => 
    key === entity || key === entity.slice(0, -1) || entity === key.slice(0, -1)
  );
  
  if (entityKey && examples[entityKey][method]) {
    return examples[entityKey][method];
  }
  
  // Exemple par défaut
  if (method === 'get') {
    return {
      status: 200,
      data: { id: 1, name: 'Exemple', description: 'Description d\'exemple' }
    };
  } else if (method === 'post') {
    return {
      status: 201,
      message: `${entity.slice(0, -1)} créé avec succès`,
      data: { id: 1, name: 'Exemple' }
    };
  } else if (method === 'put') {
    return {
      status: 200,
      message: `${entity.slice(0, -1)} mis à jour avec succès`,
      data: { id: 1, name: 'Exemple modifié' }
    };
  }
  
  return { status: 200 };
}
