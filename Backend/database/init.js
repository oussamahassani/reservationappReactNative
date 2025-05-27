
/**
 * Script d'initialisation de la base de données
 * 
 * Ce script crée la base de données et toutes les tables nécessaires
 * à partir du fichier de schéma SQL.
 */
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Création d'une connexion MySQL avec spécification du jeu de caractères
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,     // Permet d'exécuter plusieurs instructions SQL
  charset: 'utf8mb4',           // Support complet des caractères Unicode (dont les emojis)
  collation: 'utf8mb4_unicode_ci'  // Collation insensible à la casse pour le jeu de caractères
});

// Lecture du fichier de schéma SQL
const schemaPath = path.join(__dirname, "schema.sql");
console.log(`Lecture du schéma depuis: ${schemaPath}`);
const sqlScript = fs.readFileSync(schemaPath, "utf8");

// Division du script par point-virgule pour exécuter chaque instruction séparément
const statements = sqlScript.split(';')
  .filter(statement => statement.trim() !== '');

// Fonction pour exécuter les instructions SQL séquentiellement
const executeStatements = (statements, index = 0) => {
  if (index >= statements.length) {
    console.log("Base de données et tables créées avec succès!");
    console.log("Vous pouvez maintenant visualiser les tables dans phpMyAdmin.");
    connection.end();
    return;
  }

  const currentStatement = statements[index].trim();
  if (!currentStatement) {
    executeStatements(statements, index + 1);
    return;
  }

  console.log(`Exécution de l'instruction ${index + 1}/${statements.length}`);
  
  connection.query(currentStatement + ';', (err) => {
    if (err) {
      console.error(`Erreur lors de l'exécution de l'instruction ${index + 1}:`, err);
      console.error("Instruction:", currentStatement);
      connection.end();
      return;
    }
    
    executeStatements(statements, index + 1);
  });
};

// Exécution des instructions
executeStatements(statements);
