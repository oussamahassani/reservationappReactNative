
/**
 * Script de génération de documentation
 * 
 * Ce script génère une documentation complète de l'API JenCity
 * en format HTML et PDF avec des exemples de requêtes et de réponses.
 */
const { extractRoutes } = require('../utils/routeExtractor');
const ApiDocGenerator = require('../utils/ApiDocGenerator');
const path = require('path');
const colors = require('colors/safe');

console.log(colors.cyan('🔍 Analyse des routes API...'));

// Extraire les informations des routes
const routes = extractRoutes();
console.log(colors.green(`✅ ${routes.length} routes API trouvées`));

console.log(colors.cyan('📝 Génération de la documentation...'));

// Créer le générateur de documentation
const generator = new ApiDocGenerator(routes);

// Générer la documentation
generator.generateDocs();

console.log(colors.green(`
╭────────────────────────────────────────────────╮
│                                                │
│   🎉 Documentation générée avec succès!        │
│   📘 Documentation HTML: ${path.join('docs', 'api-documentation.html')}  │
│   📊 Diagramme de classes: ${path.join('docs', 'diagram_de_class.html')} │
│   📄 Documentation PDF: ${path.join('docs', 'api-documentation.pdf')}   │
│                                                │
╰────────────────────────────────────────────────╯
`));

console.log(colors.yellow(`Pour visualiser la documentation, démarrez le serveur avec 'npm start'`));
console.log(colors.yellow(`puis accédez à http://localhost:3000/api-documentation.html`));
