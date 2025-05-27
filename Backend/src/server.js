
/**
 * Point d'entrée du serveur
 * 
 * Ce fichier est un simple point d'entrée qui redirige vers le serveur principal
 * à la racine du projet pour faciliter le démarrage avec "node src/server.js"
 */

// Importer les modules nécessaires
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fonction pour exécuter la mise à jour du schéma des événements
async function updateEventPlaceSchema() {
  let connection;
  try {
    console.log('Tentative de connexion à la base de données pour mise à jour du schéma...');
    
    // Créer une connexion à la base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Important pour exécuter plusieurs instructions SQL
    });

    console.log('Connexion établie. Vérification et mise à jour du schéma event-place...');
    
    // Lire et exécuter le fichier SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'event_place_schema_update.sql');
    console.log(`Lecture du fichier SQL: ${sqlPath}`);
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Exécution du script SQL
    console.log('Exécution du script de mise à jour du schéma...');
    const [results] = await connection.query(sql);
    console.log('Résultats de la mise à jour:', results);
    console.log('Mise à jour du schéma event-place terminée avec succès');
    
    // Vérification supplémentaire
    console.log('Vérification de la colonne place_id dans la table events...');
    const [columns] = await connection.query('SHOW COLUMNS FROM events LIKE "place_id"');
    if (columns.length > 0) {
      console.log('✅ La colonne place_id existe dans la table events.');
    } else {
      console.error('❌ La colonne place_id n\'existe PAS dans la table events!');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du schéma event-place:', error);
    throw error; // Propager l'erreur pour une gestion ultérieure
  } finally {
    // Fermer la connexion, qu'il y ait eu une erreur ou non
    if (connection) {
      console.log('Fermeture de la connexion à la base de données');
      await connection.end();
    }
  }
}

// Exécuter la mise à jour du schéma avant de démarrer le serveur
console.log('Démarrage du processus de mise à jour du schéma...');
updateEventPlaceSchema()
  .then(() => {
    // Importer et exécuter le serveur depuis le fichier racine
    console.log('Démarrage du serveur principal...');
    require('../server.js');
    console.log('Serveur démarré depuis src/server.js');
  })
  .catch(err => {
    console.error('Erreur critique lors de la mise à jour du schéma:', err);
    console.log('Tentative de démarrage du serveur malgré l\'erreur...');
    // Essayer de démarrer le serveur même si la mise à jour du schéma échoue
    require('../server.js');
    console.log('Serveur démarré malgré l\'erreur de mise à jour du schéma');
  });
