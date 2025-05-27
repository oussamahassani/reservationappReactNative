
/**
 * Script de configuration initial
 * 
 * Ce script installe les dépendances nécessaires et configure
 * le projet pour une utilisation immédiate.
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

console.log(colors.cyan('🔧 Configuration du projet JenCity...'));

// Liste des dépendances à installer
const dependencies = [
  'express',
  'mysql2',
  'cors',
  'dotenv',
  'express-session', 
  'bcryptjs',
  'jsonwebtoken',
  'morgan',
  'express-validator',
  'pdfkit',
  'colors'
];

console.log(colors.yellow('📦 Installation des dépendances...'));

// Installer les dépendances
exec(`npm install ${dependencies.join(' ')} --save`, (error, stdout, stderr) => {
  if (error) {
    console.error(colors.red('❌ Erreur lors de l\'installation des dépendances:'), error);
    return;
  }
  
  console.log(colors.green('✅ Dépendances installées avec succès'));
  
  // Installation des dépendances de développement
  const devDependencies = [
    'nodemon'
  ];
  
  console.log(colors.yellow('📦 Installation des dépendances de développement...'));
  
  exec(`npm install ${devDependencies.join(' ')} --save-dev`, (error, stdout, stderr) => {
    if (error) {
      console.error(colors.red('❌ Erreur lors de l\'installation des dépendances de développement:'), error);
      return;
    }
    
    console.log(colors.green('✅ Dépendances de développement installées avec succès'));
    
    // Mise à jour du package.json pour ajouter les scripts
    console.log(colors.yellow('📝 Mise à jour des scripts dans package.json...'));
    
    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Ajouter les scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        "start": "node index.js",
        "dev": "nodemon index.js",
        "init-db": "node scripts/init-db.js",
        "generate-docs": "node scripts/generate-docs.js",
        "build:dev": "vite build --mode development"
      };
      
      // Écrire le fichier mis à jour
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(colors.green('✅ Scripts ajoutés au package.json'));
      
      console.log(colors.cyan(`
╭────────────────────────────────────────────────╮
│                                                │
│   🎉 Configuration terminée avec succès!       │
│                                                │
│   Pour démarrer:                               │
│   1. Créez la base de données: npm run init-db │
│   2. Générez la documentation: npm run generate-docs │
│   3. Démarrez le serveur: npm run dev          │
│                                                │
│   📘 Accédez à la documentation API:           │
│   http://localhost:3000/api-documentation.html               │
│                                                │
╰────────────────────────────────────────────────╯
      `));
      
    } catch (error) {
      console.error(colors.red('❌ Erreur lors de la mise à jour du package.json:'), error);
    }
  });
});
