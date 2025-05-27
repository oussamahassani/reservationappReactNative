
/**
 * Script d'initialisation de la base de données
 * 
 * Ce script va:
 * 1. Vérifier la connexion à MySQL
 * 2. Créer la base de données si elle n'existe pas
 * 3. Exécuter le script schema.sql pour créer les tables
 * 4. Afficher un message de confirmation
 */
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
require('dotenv').config();

console.log(colors.cyan('🔄 Initialisation de la base de données...'));

// Créer une connexion MySQL (sans spécifier de base de données)
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  charset: 'utf8mb4'
});

console.log(colors.yellow('📡 Connexion à MySQL...'));

// Connexion à MySQL
connection.connect((err) => {
  if (err) {
    console.error(colors.red('❌ Erreur de connexion à MySQL:'), err);
    process.exit(1);
  }
  
  console.log(colors.green('✅ Connecté à MySQL avec succès'));
  
  // Lire le script SQL
  console.log(colors.yellow('📄 Lecture du script SQL...'));
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  let sqlScript;
  
  try {
    sqlScript = fs.readFileSync(schemaPath, 'utf8');
    console.log(colors.green('✅ Script SQL chargé avec succès'));
  } catch (error) {
    console.error(colors.red('❌ Erreur lors de la lecture du fichier SQL:'), error);
    connection.end();
    process.exit(1);
  }
  
  // Exécuter le script SQL
  console.log(colors.yellow('🔨 Création de la base de données et des tables...'));
  connection.query(sqlScript, (err) => {
    if (err) {
      console.error(colors.red('❌ Erreur lors de l\'exécution du script SQL:'), err);
      connection.end();
      process.exit(1);
    }
    
    console.log(colors.green('✅ Base de données et tables créées avec succès!'));
    console.log(colors.cyan(`
    ╭────────────────────────────────────────────────╮
    │                                                │
    │   🎉 Base de données initialisée avec succès!  │
    │   📊 Base de données: ${process.env.DB_NAME}             │
    │   👤 Utilisateurs de test créés                │
    │   🏨 Lieux de test créés                       │
    │                                                │
    ╰────────────────────────────────────────────────╯
    `));
    
    // Fermer la connexion
    connection.end();
  });
});
