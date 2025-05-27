
/**
 * Script de génération de documentation API
 * Exécuter avec: node generateDocs.js
 */
const { generatePdfDoc } = require('./utils/generatePdf');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de la génération de documentation API...');

// Créer le dossier docs s'il n'existe pas
const docsDir = path.join(__dirname, 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
  console.log(`📁 Dossier de documentation créé: ${docsDir}`);
}

generatePdfDoc()
  .then(({ markdownPath, htmlPath, pdfPath }) => {
    console.log('\n📚 Documentation générée avec succès:');
    console.log(`📄 Documentation Markdown: ${markdownPath}`);
    console.log(`🌐 Documentation HTML: ${htmlPath}`);
    console.log(`📑 Documentation PDF: ${pdfPath || '(conversion PDF non disponible)'}`);
    
    // Créer une page HTML pour accéder à la documentation
    const docHtmlPath = path.join(__dirname, 'documentation_api.html');
    fs.writeFileSync(docHtmlPath, `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Documentation API JendoubaLife</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .btn { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 10px; }
        .info { background-color: #e7f3fe; border-left: 6px solid #2196F3; padding: 10px 20px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <h1>Documentation API JendoubaLife</h1>
      <div class="info">
        <p>Cette documentation présente toutes les routes API disponibles et des exemples de requêtes pour tester l'API.</p>
        <p>Date de génération: ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div class="card">
        <h2>Formats disponibles</h2>
        <p>Choisissez le format qui vous convient :</p>
        <a href="/docs/documentation_api.html" class="btn">Version HTML</a>
        <a href="/docs/documentation_api.md" class="btn">Version Markdown</a>
        <a href="/docs/documentation_api.pdf" class="btn">Version PDF</a>
      </div>
      
      <div class="card">
        <h2>Comment tester l'API</h2>
        <p>Vous pouvez utiliser les exemples de code fournis dans la documentation avec :</p>
        <ul>
          <li>Un client HTTP comme Postman</li>
          <li>cURL en ligne de commande</li>
          <li>fetch() ou axios dans votre code JavaScript</li>
        </ul>
        <p>Exemple avec fetch :</p>
        <pre><code>fetch('http://localhost:3000/api/users')
  .then(response => response.json())
  .then(data => console.log(data));</code></pre>
      </div>
    </body>
    </html>
    `);
    
    console.log(`🌐 Page d'accueil de documentation créée: ${docHtmlPath}`);
    
    console.log('\n💡 Pour installer markdown-pdf et générer un PDF:');
    console.log('npm install -g markdown-pdf');
    console.log('node generateDocs.js');
    
    console.log('\n📋 Instructions de test:');
    console.log('1. Démarrez votre serveur: npm run dev');
    console.log('2. Accédez à la documentation dans votre navigateur: http://localhost:3000/api-documentation.html');
    console.log('3. Copiez les exemples de requêtes depuis la documentation');
    console.log('4. Exécutez-les dans un terminal avec curl ou dans votre application avec fetch');
  })
  .catch(error => {
    console.error('❌ Erreur lors de la génération de la documentation:', error);
    process.exit(1);
  });
