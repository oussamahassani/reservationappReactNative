
/**
 * Script de configuration pour Node.js
 * 
 * Ce script configure le projet pour utiliser Node.js en supprimant
 * les références à Expo et en ajoutant les scripts Node.js appropriés.
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

console.log(colors.cyan('🔧 Configuration du projet JenCity pour Node.js...'));

// Vérifier l'existence du package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error(colors.red('❌ Fichier package.json introuvable'));
  process.exit(1);
}

try {
  // Lire le fichier package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log(colors.yellow('📝 Mise à jour des scripts dans package.json...'));
  
  // Supprimer les scripts liés à Expo
  if (packageJson.scripts) {
    delete packageJson.scripts.android;
    delete packageJson.scripts.ios;
    delete packageJson.scripts.web;
    delete packageJson.scripts.start; // Suppression du script start d'Expo
  }
  
  // Définir les nouveaux scripts pour Node.js
  packageJson.scripts = {
    ...packageJson.scripts,
    "start": "node index.js",
    "dev": "nodemon index.js",
    "init-db": "node scripts/init-db.js",
    "generate-docs": "node scripts/generate-docs.js",
    "build:dev": "vite build --mode development",
    "setup": "node scripts/setup.js"
  };
  
  // Écrire le fichier mis à jour
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(colors.green('✅ Scripts mis à jour dans package.json'));

  // Installer nodemon pour le développement
  console.log(colors.yellow('📦 Installation de nodemon...'));
  exec('npm install nodemon --save-dev', (error, stdout, stderr) => {
    if (error) {
      console.error(colors.red('❌ Erreur lors de l\'installation de nodemon:'), error);
      return;
    }
    
    console.log(colors.green('✅ nodemon installé avec succès'));
    
    // Supprimer les fichiers liés à Expo
    console.log(colors.yellow('🗑️ Suppression des fichiers liés à Expo...'));
    const expoFiles = [
      'app.json',
      'babel.config.js',
      'App.js'
    ];
    
    expoFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(colors.green(`✅ Fichier supprimé: ${file}`));
      }
    });
    
    console.log(colors.cyan(`
╭────────────────────────────────────────────────╮
│                                                │
│   🎉 Configuration Node.js terminée!           │
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
  });
  
} catch (error) {
  console.error(colors.red('❌ Erreur lors de la mise à jour du package.json:'), error);
  process.exit(1);
}
