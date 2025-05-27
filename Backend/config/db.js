
/**
 * Configuration de la base de données
 * 
 * Ce module gère la connexion à la base de données MySQL en utilisant les variables
 * d'environnement pour les paramètres de connexion.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

// Création d'un pool de connexions pour une meilleure gestion des ressources
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ,
  waitForConnections: true,  // Attendre si aucune connexion n'est disponible
  connectionLimit: 10,       // Nombre maximum de connexions dans le pool
  queueLimit: 0              // Nombre illimité de requêtes en file d'attente
});

module.exports = pool;
