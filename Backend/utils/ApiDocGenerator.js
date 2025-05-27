/**
 * Utilitaire de génération de documentation API
 * Permet de créer un fichier récapitulatif de toutes les routes API
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const colors = require('colors/safe');

class ApiDocGenerator {
  constructor(routes) {
    this.routes = routes;
    this.docsDir = path.join(__dirname, '..', 'docs');
    
    // Créer le dossier docs s'il n'existe pas
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
      console.log(`📁 Dossier de documentation créé: ${this.docsDir}`);
    }
  }

  /**
   * Génère la documentation complète
   */
  generateDocs() {
    const mdPath = this.generateApiDoc();
    this.generateHtmlDoc(fs.readFileSync(mdPath, 'utf8'));
    this.generateClassDiagram();
    this.generatePdfDoc(mdPath);
  }

  /**
   * Génère la documentation API
   */
  generateApiDoc() {
    // En-tête du document
    let docContent = `# Documentation de l'API JendoubaLife\n\n`;
    docContent += `Date de génération: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    
    // Itérer sur chaque route pour documenter
    const groupedRoutes = this.groupRoutesByCategory();
    
    Object.keys(groupedRoutes).forEach(category => {
      docContent += `## API ${category}\n\n`;
      
      groupedRoutes[category].forEach(route => {
        docContent += `### ${route.method} \`/api${route.path}\`\n\n`;
        docContent += `- **Description**: ${this.getEndpointDescription(category, route)}\n`;
        docContent += `- **Accès**: ${route.auth ? (route.admin ? 'Administrateur uniquement' : 'Utilisateur authentifié') : 'Public'}\n`;
        docContent += `- **Paramètres**: ${this.getEndpointParams(category, route)}\n`;
        docContent += `- **Exemple de test**:\n\`\`\`\n${this.getTestExample(category, route)}\n\`\`\`\n\n`;
      });
      
      docContent += `---\n\n`;
    });
    
    // Ajouter une section pour les tests
    docContent += `## Tests de l'API\n\n`;
    docContent += `Voici quelques exemples de tests à réaliser pour valider le bon fonctionnement de l'API:\n\n`;
    
    // Exemples de tests de bout en bout
    docContent += `### Test de création d'un compte et connexion\n\n`;
    docContent += "```javascript\n";
    docContent += `// 1. Créer un nouveau compte utilisateur
fetch('http://localhost:3000/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    password: 'motdepasse123'
  })
})
.then(response => response.json())
.then(data => console.log('Utilisateur créé:', data))
.catch(error => console.error('Erreur:', error));

// 2. Se connecter avec le compte créé
fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jean.dupont@example.com',
    password: 'motdepasse123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Connexion réussie:', data);
  // Stocker le token pour les futures requêtes
  const token = data.data?.token || data.token;
  localStorage.setItem('jendoubaToken', token);
})
.catch(error => console.error('Erreur:', error));
\n`;
    docContent += "```\n\n";

    // Ajouter un exemple de requête authentifiée
    docContent += `### Effectuer une requête authentifiée\n\n`;
    docContent += "```javascript\n";
    docContent += `// Récupérer le token stocké
const token = localStorage.getItem('jendoubaToken');

// Requête vers un endpoint protégé
fetch('http://localhost:3000/api/users/me', {
  method: 'GET',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  }
})
.then(response => response.json())
.then(data => console.log('Données utilisateur:', data))
.catch(error => console.error('Erreur:', error));
\n`;
    docContent += "```\n\n";
    
    // Écriture du fichier
    const outputPath = path.join(this.docsDir, 'api-documentation.md');
    fs.writeFileSync(outputPath, docContent);
    
    console.log(`✅ Documentation API générée avec succès: ${outputPath}`);
    return outputPath;
  }

  /**
   * Génère une version HTML de la documentation
   */
  generateHtmlDoc(markdownContent) {
    // HTML basé sur le design fourni
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Documentation API JendoubaLife</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        :root {
            --primary-color: #3498db;
            --secondary-color: #2c3e50;
            --accent-color: #e74c3c;
            --light-gray: #f5f5f5;
            --border-color: #ddd;
            --text-color: #333;
            --method-get: #61affe;
            --method-post: #49cc90;
            --method-put: #fca130;
            --method-delete: #f93e3e;
            --method-patch: #50e3c2;
            --success-color: #4caf50;
            --success-bg: #e8f5e9;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            color: var(--text-color);
            line-height: 1.6;
            background-color: #f9f9f9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background-color: var(--secondary-color);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .api-description {
            font-size: 1.2rem;
            margin-bottom: 20px;
        }
        
        .server-config {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px solid var(--border-color);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .server-config h2 {
            margin-bottom: 15px;
            color: var(--secondary-color);
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 8px;
        }
        
        .server-form {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .server-form input {
            padding: 10px 15px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            flex: 1;
            min-width: 120px;
            font-size: 1rem;
            transition: border-color 0.3s, box-shadow 0.3s;
        }
        
        .server-form input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
        
        .server-form button {
            padding: 10px 18px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .server-form button:hover {
            background-color: #2980b9;
            transform: translateY(-2px);
        }
        
        .server-form button:active {
            transform: translateY(0);
        }
        
        .base-url {
            font-size: 1.1rem;
            padding: 15px;
            background-color: var(--light-gray);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .copy-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .copy-btn:hover {
            background-color: #2980b9;
        }
        
        .filter-container {
            margin-bottom: 25px;
            padding: 15px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid var(--border-color);
        }
        
        .filter-title {
            margin-bottom: 10px;
            color: var(--secondary-color);
            font-weight: 600;
        }
        
        .filter-options {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
        }
        
        .filter-container select {
            padding: 10px 15px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background-color: white;
            flex-grow: 1;
            max-width: 300px;
            font-size: 1rem;
            transition: border-color 0.3s, box-shadow 0.3s;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%232c3e50' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            padding-right: 30px;
        }
        
        .filter-container select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
        
        .endpoint-list {
            margin-bottom: 40px;
        }
        
        .endpoint {
            margin-bottom: 25px;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid var(--border-color);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .endpoint:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .endpoint-header {
            display: flex;
            padding: 15px;
            background-color: #f5f7f9;
            border-bottom: 1px solid var(--border-color);
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .method {
            padding: 6px 12px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            min-width: 80px;
            text-align: center;
            font-size: 0.9rem;
            letter-spacing: 0.5px;
        }
        
        .method.get { background-color: var(--method-get); }
        .method.post { background-color: var(--method-post); }
        .method.put { background-color: var(--method-put); }
        .method.delete { background-color: var(--method-delete); }
        .method.patch { background-color: var(--method-patch); }
        
        .endpoint-path {
            font-family: 'Courier New', monospace;
            font-size: 1.1rem;
            flex-grow: 1;
            position: relative;
            padding: 8px 15px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .endpoint-body {
            padding: 20px;
        }
        
        .endpoint-description {
            margin-bottom: 20px;
            font-size: 1.1rem;
            color: #444;
            line-height: 1.7;
        }
        
        .params-section, .body-section, .response-section {
            margin-bottom: 25px;
        }
        
        .section-title {
            margin-bottom: 15px;
            color: var(--secondary-color);
            font-size: 1.2rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .section-title i {
            color: var(--primary-color);
        }
        
        .param-table, .response-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .param-table th, .response-table th {
            background-color: #f5f7f9;
            text-align: left;
            padding: 10px 15px;
            border: 1px solid var(--border-color);
            color: var(--secondary-color);
            font-weight: 600;
        }
        
        .param-table td, .response-table td {
            padding: 10px 15px;
            border: 1px solid var(--border-color);
        }
        
        .param-table tr:nth-child(even), .response-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .code-block {
            background-color: #f5f7f9;
            padding: 15px;
            border-radius: 6px;
            overflow: auto;
            font-family: 'Courier New', monospace;
            position: relative;
            margin-bottom: 20px;
            border: 1px solid var(--border-color);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-weight: 600;
            color: var(--secondary-color);
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        pre {
            margin: 0;
            white-space: pre-wrap;
            font-size: 0.95rem;
            line-height: 1.6;
        }
        
        code {
            font-family: 'Courier New', monospace;
        }
        
        .response-status {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            margin-right: 10px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .status-success {
            background-color: var(--success-bg);
            color: var(--success-color);
        }
        
        .status-error {
            background-color: #ffebee;
            color: #d32f2f;
        }
        
        .status-warning {
            background-color: #fff8e1;
            color: #ff8f00;
        }
        
        footer {
            text-align: center;
            margin-top: 40px;
            color: #777;
            padding: 20px;
            border-top: 1px solid var(--border-color);
            font-size: 0.9rem;
        }
        
        .entity-title {
            margin: 40px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--primary-color);
            color: var(--secondary-color);
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .entity-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
        }
        
        .hidden {
            display: none;
        }
        
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--secondary-color);
            color: white;
            padding: 12px 25px;
            border-radius: 6px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast i {
            font-size: 1.2rem;
        }
        
        .endpoint-counter {
            font-size: 0.9rem;
            color: #666;
            margin-left: 10px;
        }
        
        .try-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 15px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-left: 10px;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .try-btn:hover {
            background-color: #2980b9;
        }
        
        .links-nav {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .nav-link {
            padding: 10px 20px;
            background-color: var(--primary-color);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .nav-link:hover {
            background-color: #2980b9;
        }
        
        @media (max-width: 768px) {
            .endpoint-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .endpoint-path {
                width: 100%;
            }
            
            .server-form {
                flex-direction: column;
            }
            
            .method {
                width: 100%;
                text-align: center;
            }
        }
        
        /* Tabs for request/response */
        .tabs {
            display: flex;
            margin-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .tab {
            padding: 8px 15px;
            cursor: pointer;
            border: 1px solid transparent;
            border-bottom: none;
            border-radius: 6px 6px 0 0;
            margin-right: 5px;
            transition: all 0.3s;
        }
        
        .tab.active {
            background-color: #f5f7f9;
            border-color: var(--border-color);
            font-weight: 600;
            color: var(--primary-color);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Fix header icons inside entities */
        .endpoint-list h3 {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        /* Message toast system */
        #toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Documentation API JendoubaLife</h1>
          <p class="api-description">Bienvenue dans la documentation complète de l'API JendoubaLife. Cette API permet de gérer les utilisateurs, les lieux, les événements, les réservations et bien plus encore.</p>
          
          <div class="links-nav">
            <a href="api-documentation.pdf" class="nav-link" id="download-pdf">
              <i class="fas fa-file-pdf"></i> Télécharger en PDF
            </a>
            <a href="diagram_de_class.html" class="nav-link">
              <i class="fas fa-project-diagram"></i> Diagramme de Classes
            </a>
          </div>
        </header>
        
        <div class="server-config">
          <h2>Configuration du Serveur</h2>
          <div class="server-form">
            <input type="text" id="server-url" value="http://localhost:3000" placeholder="URL du serveur">
            <button id="update-server"><i class="fas fa-sync-alt"></i> Mettre à jour</button>
          </div>
          <div class="base-url">
            <span id="base-url-display">http://localhost:3000/api</span>
            <button class="copy-btn" id="copy-url"><i class="fas fa-copy"></i> Copier</button>
          </div>
        </div>
        
        <div class="filter-container">
          <div class="filter-title">Filtrer les Endpoints</div>
          <div class="filter-options">
            <select id="method-filter">
              <option value="all">Toutes les méthodes</option>
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
              <option value="patch">PATCH</option>
            </select>
            <select id="category-filter">
              <option value="all">Toutes les catégories</option>
              <option value="utilisateurs">Utilisateurs</option>
              <option value="lieux">Lieux</option>
              <option value="evenements">Événements</option>
              <option value="avis">Avis</option>
              <option value="reservations">Réservations</option>
              <option value="promotions">Promotions</option>
              <option value="messagerie">Messagerie</option>
            </select>
            <select id="auth-filter">
              <option value="all">Toutes les autorisations</option>
              <option value="public">Public</option>
              <option value="auth">Authentifié</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        
        <div id="content">
          ${this.generateEndpointsHtml()}
        </div>
        
        <div id="toast-container"></div>
        
        <footer>
          <p>JendoubaLife API Documentation &copy; ${new Date().getFullYear()} - Développé avec ❤️ par l'équipe JendoubaLife</p>
          <p>Version de l'API: 1.0.0 | Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}</p>
        </footer>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          // Fonctionnalité pour copier l'URL de base
          document.getElementById('copy-url').addEventListener('click', function() {
            const baseUrl = document.getElementById('base-url-display').textContent;
            navigator.clipboard.writeText(baseUrl)
              .then(() => showToast('URL copiée dans le presse-papiers', 'success'))
              .catch(() => showToast('Erreur lors de la copie', 'error'));
          });
          
          // Fonctionnalité pour mettre à jour l'URL du serveur
          document.getElementById('update-server').addEventListener('click', function() {
            const serverUrl = document.getElementById('server-url').value;
            document.getElementById('base-url-display').textContent = serverUrl + '/api';
            showToast('URL du serveur mise à jour', 'success');
          });
          
          // Fonctionnalité pour copier le code d'exemple
          document.querySelectorAll('.copy-btn').forEach(button => {
            if (!button.id) {
              button.addEventListener('click', function() {
                const code = this.closest('.code-block').querySelector('pre').textContent;
                navigator.clipboard.writeText(code)
                  .then(() => showToast('Code copié dans le presse-papiers', 'success'))
                  .catch(() => showToast('Erreur lors de la copie', 'error'));
              });
            }
          });
          
          // Fonctionnalité pour les onglets
          document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
              const tabId = this.getAttribute('data-tab');
              const tabsContainer = this.closest('.tabs');
              const tabContents = this.closest('.endpoint-body').querySelectorAll('.tab-content');
              
              // Désactiver tous les onglets
              tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
              // Désactiver tous les contenus d'onglet
              tabContents.forEach(content => content.classList.remove('active'));
              
              // Activer l'onglet et le contenu sélectionnés
              this.classList.add('active');
              this.closest('.endpoint-body').querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
            });
          });
          
          // Fonctionnalité pour filtrer les endpoints
          const endpoints = document.querySelectorAll('.endpoint');
          const updateFilters = () => {
            const methodFilter = document.getElementById('method-filter').value;
            const categoryFilter = document.getElementById('category-filter').value;
            const authFilter = document.getElementById('auth-filter').value;
            
            endpoints.forEach(endpoint => {
              const method = endpoint.getAttribute('data-method');
              const category = endpoint.getAttribute('data-category');
              const auth = endpoint.getAttribute('data-auth');
              
              const methodMatch = methodFilter === 'all' || method === methodFilter;
              const categoryMatch = categoryFilter === 'all' || category === categoryFilter;
              const authMatch = authFilter === 'all' || auth === authFilter;
              
              if (methodMatch && categoryMatch && authMatch) {
                endpoint.classList.remove('hidden');
              } else {
                endpoint.classList.add('hidden');
              }
            });
            
            // Mettre à jour les compteurs d'endpoints
            document.querySelectorAll('.entity-section').forEach(section => {
              const category = section.getAttribute('data-category');
              const visibleEndpoints = Array.from(section.querySelectorAll('.endpoint')).filter(
                ep => !ep.classList.contains('hidden')
              ).length;
              
              if (visibleEndpoints > 0) {
                section.classList.remove('hidden');
              } else {
                section.classList.add('hidden');
              }
              
              section.querySelector('.endpoint-counter').textContent = \`(\${visibleEndpoints} endpoint\${visibleEndpoints !== 1 ? 's' : ''})\`;
            });
          };
          
          // Ajouter les écouteurs d'événements aux filtres
          document.getElementById('method-filter').addEventListener('change', updateFilters);
          document.getElementById('category-filter').addEventListener('change', updateFilters);
          document.getElementById('auth-filter').addEventListener('change', updateFilters);
          
          // Fonctionnalité pour les boutons de test
          document.querySelectorAll('.try-btn').forEach(button => {
            button.addEventListener('click', function() {
              const endpoint = this.closest('.endpoint');
              const method = endpoint.getAttribute('data-method');
              const path = endpoint.querySelector('.endpoint-path').textContent;
              const serverUrl = document.getElementById('server-url').value;
              const fullUrl = \`\${serverUrl}\${path}\`;
              
              // Afficher le formulaire de test ou exécuter directement si c'est une requête GET
              if (method.toLowerCase() === 'get') {
                // Pour GET, on peut juste ouvrir la requête dans un nouvel onglet
                window.open(fullUrl, '_blank');
              } else {
                // Pour les autres méthodes, montrer le formulaire de test
                const tabsContainer = endpoint.querySelector('.tabs');
                const tabs = tabsContainer.querySelectorAll('.tab');
                const tabContents = endpoint.querySelectorAll('.tab-content');
                
                // Activer l'onglet de requête
                tabs.forEach(tab => tab.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                const requestTab = Array.from(tabs).find(tab => tab.getAttribute('data-tab') === 'request');
                if (requestTab) {
                  requestTab.classList.add('active');
                  endpoint.querySelector('.tab-content[data-tab="request"]').classList.add('active');
                  showToast('Copiez et exécutez le code pour tester l\'endpoint', 'info');
                }
              }
            });
          });
          
          // Fonction pour afficher un toast
          window.showToast = function(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = \`toast \${type}\`;
            
            let icon = 'info-circle';
            if (type === 'success') icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'warning') icon = 'exclamation-triangle';
            
            toast.innerHTML = \`<i class="fas fa-\${icon}"></i>\${message}\`;
            
            document.getElementById('toast-container').appendChild(toast);
            
            // Afficher le toast
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Supprimer le toast après un délai
            setTimeout(() => {
              toast.classList.remove('show');
              setTimeout(() => toast.remove(), 300);
            }, 3000);
          }
        });
      </script>
    </body>
    </html>
    `;
    
    const htmlPath = path.join(this.docsDir, 'api-documentation.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Documentation HTML interactive générée: ${htmlPath}`);
    
    // Générer le diagramme de classe
    this.generateClassDiagram();
    
    return htmlPath;
  }

  /**
   * Génère le HTML pour tous les endpoints regroupés par catégorie
   */
  generateEndpointsHtml() {
    const groupedRoutes = this.groupRoutesByCategory();
    let html = '';
    
    Object.keys(groupedRoutes).forEach(category => {
      const categoryLower = category.toLowerCase();
      const routes = groupedRoutes[category];
      
      let categoryIcon = '';
      switch (categoryLower) {
        case 'utilisateurs': categoryIcon = 'users'; break;
        case 'lieux': categoryIcon = 'map-marker-alt'; break;
        case 'événements': categoryIcon = 'calendar-alt'; break;
        case 'avis': categoryIcon = 'star'; break;
        case 'réservations': categoryIcon = 'calendar-check'; break;
        case 'promotions': categoryIcon = 'percentage'; break;
        case 'messagerie': categoryIcon = 'comments'; break;
        case 'intégration clerk': categoryIcon = 'key'; break;
        default: categoryIcon = 'code'; break;
      }
      
      html += `
      <div class="entity-section" data-category="${categoryLower}">
        <div class="entity-title">
          <div class="entity-icon"><i class="fas fa-${categoryIcon}"></i></div>
          API ${category}
          <span class="endpoint-counter">(${routes.length} endpoint${routes.length !== 1 ? 's' : ''})</span>
        </div>
        
        <div class="endpoint-list">
      `;
      
      routes.forEach(route => {
        // Déterminer l'autorisation requise
        let authType = 'public';
        if (route.auth) {
          authType = route.admin ? 'admin' : 'auth';
        }
        
        html += `
        <div class="endpoint" data-method="${route.method.toLowerCase()}" data-category="${categoryLower}" data-auth="${authType}">
          <div class="endpoint-header">
            <div class="method ${route.method.toLowerCase()}">${route.method}</div>
            <div class="endpoint-path">/api${route.path}</div>
            <button class="try-btn"><i class="fas fa-play"></i> Tester</button>
          </div>
          <div class="endpoint-body">
            <div class="endpoint-description">
              ${this.getEndpointDescription(category, route)}
            </div>
            
            <div class="tabs">
              <div class="tab active" data-tab="info">Informations</div>
              <div class="tab" data-tab="request">Requête</div>
              <div class="tab" data-tab="response">Réponse</div>
            </div>
            
            <div class="tab-content active" data-tab="info">
              <div class="params-section">
                <div class="section-title"><i class="fas fa-info-circle"></i> Détails de l'Endpoint</div>
                <table class="param-table">
                  <tr>
                    <th>URL</th>
                    <td><code>/api${route.path}</code></td>
                  </tr>
                  <tr>
                    <th>Méthode</th>
                    <td><span class="method ${route.method.toLowerCase()}" style="display: inline-block; margin-top: 2px;">${route.method}</span></td>
                  </tr>
                  <tr>
                    <th>Authentification</th>
                    <td>${route.auth ? (route.admin ? '<span style="color: #d32f2f;"><i class="fas fa-lock"></i> Admin uniquement</span>' : '<span style="color: #ff8f00;"><i class="fas fa-user-shield"></i> Utilisateur authentifié</span>') : '<span style="color: #4caf50;"><i class="fas fa-globe"></i> Publique</span>'}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>${this.getEndpointDescription(category, route)}</td>
                  </tr>
                </table>
              </div>
              
              ${this.generateParamsTableHtml(category, route)}
            </div>
            
            <div class="tab-content" data-tab="request">
              <div class="code-block">
                <div class="code-header">
                  Exemple de Requête
                  <button class="copy-btn"><i class="fas fa-copy"></i> Copier</button>
                </div>
                <pre><code>${this.getTestExample(category, route)}</code></pre>
              </div>
            </div>
            
            <div class="tab-content" data-tab="response">
              <div class="response-status status-success">200 OK</div>
              <div class="code-block">
                <div class="code-header">
                  Exemple de Réponse Réussie
                  <button class="copy-btn"><i class="fas fa-copy"></i> Copier</button>
                </div>
                <pre><code>${this.getSuccessResponseExample(category, route)}</code></pre>
              </div>
              
              <div class="response-status status-error">400/401/403/404 Erreur</div>
              <div class="code-block">
                <div class="code-header">
                  Exemple de Réponse d'Erreur
                  <button class="copy-btn"><i class="fas fa-copy"></i> Copier</button>
                </div>
                <pre><code>${this.getErrorResponseExample(category, route)}</code></pre>
              </div>
            </div>
          </div>
        </div>
        `;
      });
      
      html += `
        </div>
      </div>
      `;
    });
    
    return html;
  }

  /**
   * Génère le tableau de paramètres pour un endpoint
   */
  generateParamsTableHtml(category, route) {
    if (route.method === 'GET' || route.method === 'DELETE') {
      let paramsHtml = '';
      
      if (route.path.includes(':id') || route.path.includes(':userId') || route.path.includes('/:')) {
        paramsHtml = `
        <div class="params-section">
          <div class="section-title"><i class="fas fa-list"></i> Paramètres de Chemin</div>
          <table class="param-table">
            <thead>
              <tr>
                <th>Paramètre</th>
                <th>Type</th>
                <th>Description</th>
                <th>Obligatoire</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        if (route.path.includes(':id')) {
          paramsHtml += `
              <tr>
                <td>id</td>
                <td>Integer</td>
                <td>Identifiant unique de la ressource</td>
                <td>Oui</td>
              </tr>
          `;
        }
        
        if (route.path.includes(':userId')) {
          paramsHtml += `
              <tr>
                <td>userId</td>
                <td>Integer</td>
                <td>Identifiant unique de l'utilisateur</td>
                <td>Oui</td>
              </tr>
          `;
        }
        
        paramsHtml += `
            </tbody>
          </table>
        </div>
        `;
      }
      
      return paramsHtml;
    } else {
      // Pour POST, PUT, PATCH
      const params = this.getParamsForBodyTable(category, route);
      
      if (params.length === 0) {
        return '';
      }
      
      let paramsHtml = `
      <div class="params-section">
        <div class="section-title"><i class="fas fa-list"></i> Corps de la Requête</div>
        <table class="param-table">
          <thead>
            <tr>
              <th>Paramètre</th>
              <th>Type</th>
              <th>Description</th>
              <th>Obligatoire</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      params.forEach(param => {
        paramsHtml += `
            <tr>
              <td>${param.name}</td>
              <td>${param.type}</td>
              <td>${param.description}</td>
              <td>${param.required ? 'Oui' : 'Non'}</td>
            </tr>
        `;
      });
      
      paramsHtml += `
          </tbody>
        </table>
      </div>
      `;
      
      return paramsHtml;
    }
  }

  /**
   * Récupère les paramètres pour le corps de la requête
   */
  getParamsForBodyTable(category, route) {
    const params = [];
    const baseName = category.toLowerCase();
    
    if (category === 'Utilisateurs') {
      if (route.method === 'POST' && route.path.includes('register')) {
        params.push({ name: 'nom', type: 'String', description: 'Nom de l\'utilisateur', required: true });
        params.push({ name: 'prenom', type: 'String', description: 'Prénom de l\'utilisateur', required: true });
        params.push({ name: 'email', type: 'String', description: 'Adresse email (doit être unique)', required: true });
        params.push({ name: 'password', type: 'String', description: 'Mot de passe (minimum 6 caractères)', required: true });
        params.push({ name: 'phone', type: 'String', description: 'Numéro de téléphone', required: false });
      } else if (route.method === 'POST' && route.path.includes('login')) {
        params.push({ name: 'email', type: 'String', description: 'Adresse email', required: true });
        params.push({ name: 'password', type: 'String', description: 'Mot de passe', required: true });
      } else if ((route.method === 'PUT' || route.method === 'PATCH') && route.path.includes(':id')) {
        params.push({ name: 'nom', type: 'String', description: 'Nom de l\'utilisateur', required: false });
        params.push({ name: 'prenom', type: 'String', description: 'Prénom de l\'utilisateur', required: false });
        params.push({ name: 'email', type: 'String', description: 'Adresse email', required: false });
        params.push({ name: 'phone', type: 'String', description: 'Numéro de téléphone', required: false });
      } else if (route.method === 'PATCH' && route.path.includes('status')) {
        params.push({ name: 'status', type: 'String', description: 'Nouveau statut de l\'utilisateur', required: true });
      }
    } else if (category === 'Lieux') {
      if (route.method === 'POST' || route.method === 'PUT') {
        params.push({ name: 'nom_place', type: 'String', description: 'Nom du lieu', required: true });
        params.push({ name: 'description', type: 'String', description: 'Description du lieu', required: true });
        params.push({ name: 'location', type: 'String', description: 'Adresse du lieu', required: true });
        params.push({ name: 'longitude', type: 'Float', description: 'Coordonnée longitude', required: true });
        params.push({ name: 'latitude', type: 'Float', description: 'Coordonnée latitude', required: true });
        params.push({ name: 'category', type: 'String', description: 'Catégorie du lieu', required: true });
        params.push({ name: 'images', type: 'Array', description: 'Liste des URLs des images', required: false });
      }
    } else if (category === 'Événements') {
      if (route.method === 'POST' || route.method === 'PUT') {
        params.push({ name: 'title', type: 'String', description: 'Titre de l\'événement', required: true });
        params.push({ name: 'description', type: 'String', description: 'Description de l\'événement', required: true });
        params.push({ name: 'place_id', type: 'Integer', description: 'ID du lieu associé', required: true });
        params.push({ name: 'start_date', type: 'DateTime', description: 'Date et heure de début', required: true });
        params.push({ name: 'end_date', type: 'DateTime', description: 'Date et heure de fin', required: true });
        params.push({ name: 'price', type: 'Float', description: 'Prix de l\'événement', required: false });
        params.push({ name: 'image', type: 'String', description: 'URL de l\'image', required: false });
      }
    } else if (category === 'Avis') {
      if (route.method === 'POST' || route.method === 'PUT' || route.method === 'PATCH') {
        params.push({ name: 'place_id', type: 'Integer', description: 'ID du lieu évalué', required: true });
        params.push({ name: 'rating', type: 'Float', description: 'Note (entre 0 et 5)', required: true });
        params.push({ name: 'comment', type: 'String', description: 'Commentaire d\'avis', required: true });
      }
    } else if (category === 'Réservations') {
      if (route.method === 'POST' || route.method === 'PUT') {
        params.push({ name: 'place_id', type: 'Integer', description: 'ID du lieu réservé', required: true });
        params.push({ name: 'reservation_date', type: 'Date', description: 'Date de réservation', required: true });
        params.push({ name: 'start_time', type: 'Time', description: 'Heure de début', required: true });
        params.push({ name: 'end_time', type: 'Time', description: 'Heure de fin', required: true });
        params.push({ name: 'num_guests', type: 'Integer', description: 'Nombre de personnes', required: true });
        params.push({ name: 'notes', type: 'String', description: 'Notes spéciales', required: false });
      }
    } else if (category === 'Promotions') {
      if (route.method === 'POST' || route.method === 'PUT') {
        params.push({ name: 'place_id', type: 'Integer', description: 'ID du lieu concerné', required: true });
        params.push({ name: 'title', type: 'String', description: 'Titre de la promotion', required: true });
        params.push({ name: 'description', type: 'String', description: 'Description de la promotion', required: true });
        params.push({ name: 'discount_percent', type: 'Float', description: 'Pourcentage de réduction', required: true });
        params.push({ name: 'start_date', type: 'Date', description: 'Date de début', required: true });
        params.push({ name: 'end_date', type: 'Date', description: 'Date de fin', required: true });
      }
    } else if (category === 'Messagerie') {
      if (route.method === 'POST') {
        params.push({ name: 'id_destinataire', type: 'Integer', description: 'ID du destinataire', required: true });
        params.push({ name: 'texte', type: 'String', description: 'Contenu du message', required: true });
      }
    }
    
    return params;
  }

  /**
   * Génère un exemple de réponse de succès
   */
  getSuccessResponseExample(category, route) {
    const baseName = category.toLowerCase();
    const singular = baseName.endsWith('s') ? baseName.slice(0, -1) : baseName;
    
    if (category === 'Utilisateurs') {
      if (route.method === 'POST' && route.path.includes('register')) {
        return JSON.stringify({
          success: true,
          message: "Utilisateur créé avec succès",
          data: {
            user: {
              id: 1,
              nom: "Dupont",
              prenom: "Jean",
              email: "jean.dupont@example.com",
              role: "user",
              createdAt: new Date().toISOString()
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE0MjYzMjQ1LCJleHAiOjE2MTQzNDk2NDV9.example-token"
          }
        }, null, 2);
      } else if (route.method === 'POST' && route.path.includes('login')) {
        return JSON.stringify({
          success: true,
          message: "Connexion réussie",
          data: {
            user: {
              id: 1,
              nom: "Dupont",
              prenom: "Jean",
              email: "jean.dupont@example.com",
              role: "user",
              createdAt: new Date().toISOString()
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE0MjYzMjQ1LCJleHAiOjE2MTQzNDk2NDV9.example-token"
          }
        }, null, 2);
      } else if (route.method === 'GET' && route.path.includes('/me')) {
        return JSON.stringify({
          success: true,
          data: {
            id: 1,
            nom: "Dupont",
            prenom: "Jean",
            email: "jean.dupont@example.com",
            role: "user",
            createdAt: new Date().toISOString()
          }
        }, null, 2);
      } else if (route.method === 'GET' && !route.path.includes(':id')) {
        return JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              nom: "Dupont",
              prenom: "Jean",
              email: "jean.dupont@example.com",
              role: "user",
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              nom: "Martin",
              prenom: "Sophie",
              email: "sophie.martin@example.com",
              role: "user",
              createdAt: new Date().toISOString()
            }
          ]
        }, null, 2);
      }
    } else if (category === 'Lieux') {
      if (route.method === 'GET' && !route.path.includes(':id')) {
        return JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              nom_place: "Café des Artistes",
              description: "Un café confortable au cœur de Jendouba",
              location: "123 Rue Principale, Jendouba",
              longitude: 8.7767,
              latitude: 36.5014,
              category: "restaurants",
              rating: 4.5,
              reviews_count: 24,
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              nom_place: "Musée de l'Histoire",
              description: "Le musée principal de la ville",
              location: "45 Avenue des Arts, Jendouba",
              longitude: 8.7830,
              latitude: 36.5080,
              category: "culture",
              rating: 4.8,
              reviews_count: 56,
              createdAt: new Date().toISOString()
            }
          ]
        }, null, 2);
      } else if (route.method === 'GET' && route.path.includes(':id')) {
        return JSON.stringify({
          success: true,
          data: {
            id: 1,
            nom_place: "Café des Artistes",
            description: "Un café confortable au cœur de Jendouba",
            location: "123 Rue Principale, Jendouba",
            longitude: 8.7767,
            latitude: 36.5014,
            category: "restaurants",
            images: [
              "https://example.com/images/cafe1.jpg",
              "https://example.com/images/cafe2.jpg"
            ],
            rating: 4.5,
            reviews_count: 24,
            opening_hours: {
              monday: "08:00-22:00",
              tuesday: "08:00-22:00",
              wednesday: "08:00-22:00",
              thursday: "08:00-22:00",
              friday: "08:00-23:00",
              saturday: "09:00-23:00",
              sunday: "10:00-20:00"
            },
            contact_info: {
              phone: "+216 12 345 678",
              email: "cafe.artistes@example.com",
              website: "https://cafedesartistes.example.com"
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }, null, 2);
      }
    }
    
    // Réponse générique pour les autres cas
    if (route.method === 'GET' && !route.path.includes(':id')) {
      // Liste d'items
      return JSON.stringify({
        success: true,
        data: [
          { id: 1, name: `Example ${singular} 1`, createdAt: new Date().toISOString() },
          { id: 2, name: `Example ${singular} 2`, createdAt: new Date().toISOString() }
        ]
      }, null, 2);
    } else if (route.method === 'GET' && route.path.includes(':id')) {
      // Item spécifique
      return JSON.stringify({
        success: true,
        data: { id: 1, name: `Example ${singular}`, details: "Detailed information here", createdAt: new Date().toISOString() }
      }, null, 2);
    } else if (route.method === 'POST') {
      // Création
      return JSON.stringify({
        success: true,
        message: `${singular.charAt(0).toUpperCase() + singular.slice(1)} créé avec succès`,
        data: { id: 1, name: `New ${singular}`, createdAt: new Date().toISOString() }
      }, null, 2);
    } else if (route.method === 'PUT' || route.method === 'PATCH') {
      // Mise à jour
      return JSON.stringify({
        success: true,
        message: `${singular.charAt(0).toUpperCase() + singular.slice(1)} mis à jour avec succès`,
        data: { id: 1, name: `Updated ${singular}`, updatedAt: new Date().toISOString() }
      }, null, 2);
    } else if (route.method === 'DELETE') {
      // Suppression
      return JSON.stringify({
        success: true,
        message: `${singular.charAt(0).toUpperCase() + singular.slice(1)} supprimé avec succès`
      }, null, 2);
    }
    
    return JSON.stringify({ success: true, message: "Opération réussie" }, null, 2);
  }

  /**
   * Génère un exemple de réponse d'erreur
   */
  getErrorResponseExample(category, route) {
    const baseName = category.toLowerCase();
    const singular = baseName.endsWith('s') ? baseName.slice(0, -1) : baseName;
    
    if (route.method === 'POST' || route.method === 'PUT' || route.method === 'PATCH') {
      // Erreur de validation
      return JSON.stringify({
        success: false,
        message: "Erreur de validation",
        errors: [
          {
            field: "field_name",
            message: "Message d'erreur pour ce champ"
          }
        ]
      }, null, 2);
    } else if (route.method === 'GET' || route.method === 'DELETE') {
      if (route.path.includes(':id')) {
        // Resource non trouvée
        return JSON.stringify({
          success: false,
          message: `${singular.charAt(0).toUpperCase() + singular.slice(1)} non trouvé`
        }, null, 2);
      }
    }
    
    if (route.auth) {
      // Erreur d'authentification
      return JSON.stringify({
        success: false,
        message: "Accès non autorisé. Veuillez vous connecter."
      }, null, 2);
    }
    
    // Erreur générique
    return JSON.stringify({
      success: false,
      message: "Une erreur s'est produite"
    }, null, 2);
  }

  /**
   * Génère un diagramme de classe
   */
  generateClassDiagram() {
    const diagramHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Diagramme de Classes JendoubaLife</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        :root {
          --primary-color: #3498db;
          --secondary-color: #2c3e50;
          --accent-color: #e74c3c;
          --light-gray: #f5f5f5;
          --border-color: #ddd;
          --text-color: #333;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          color: var(--text-color);
          line-height: 1.6;
          background-color: #f9f9f9;
          padding: 20px;
        }
        
        header {
          background-color: var(--secondary-color);
          color: white;
          padding: 20px;
          text-align: center;
          margin-bottom: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        
        .links-nav {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
        }
        
        .nav-link {
          padding: 10px 20px;
          background-color: var(--primary-color);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .nav-link:hover {
          background-color: #2980b9;
        }
        
        .class-diagram {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }
        
        .class-box {
          border: 2px solid var(--secondary-color);
          border-radius: 8px;
          width: 300px;
          margin-bottom: 20px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .class-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .class-name {
          background-color: var(--secondary-color);
          color: white;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          font-size: 1.2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        
        .class-content {
          padding: 0;
        }
        
        .class-attributes, .class-methods {
          padding: 10px;
        }
        
        .class-attributes {
          background-color: #f8f9fa;
          border-bottom: 1px solid var(--border-color);
        }
        
        .class-methods {
          background-color: white;
        }
        
        .class-divider {
          border-top: 1px solid #ccc;
          margin: 5px 0;
        }
        
        .attribute-title, .method-title {
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          border-top: 1px solid var(--border-color);
          color: #777;
        }
        
        .method, .attribute {
          margin-bottom: 3px;
          padding-left: 15px;
        }
        
        @media (max-width: 768px) {
          .class-box {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Diagramme de Classes - API JendoubaLife</h1>
        <div class="links-nav">
          <a href="api-documentation.html" class="nav-link">
            <i class="fas fa-book"></i> Documentation API
          </a>
          <a href="api-documentation.pdf" class="nav-link">
            <i class="fas fa-file-pdf"></i> Télécharger en PDF
          </a>
        </div>
      </header>
      
      <div class="class-diagram">
        <div class="class-box">
          <div class="class-name">
            <i class="fas fa-user"></i> User
          </div>
          <div class="class-content">
            <div class="class-attributes">
              <div class="attribute-title"><i class="fas fa-database"></i> Attributs</div>
              <div class="attribute">- id: int</div>
              <div class="attribute">- nom: string</div>
              <div class="attribute">- prenom: string</div>
              <div class="attribute">- email: string</div>
              <div class="attribute">- password: string</div>
              <div class="attribute">- role: string</div>
              <div class="attribute">- created_at: date</div>
              <div class="attribute">- updated_at: date</div>
            </div>
            <div class="class-divider"></div>
            <div class="class-methods">
              <div class="method-title"><i class="fas fa-cogs"></i> Méthodes</div>
              <div class="method">+ register()</div>
              <div class="method">+ login()</div>
              <div class="method">+ logout()</div>
              <div class="method">+ updateProfile()</div>
              <div class="method">+ deleteAccount()</div>
              <div class="method">+ getAllUsers()</div>
              <div class="method">+ getUserById()</div>
            </div>
          </div>
        </div>
        
        <div class="class-box">
          <div class="class-name">
            <i class="fas fa-map-marker-alt"></i> Place
          </div>
          <div class="class-content">
            <div class="class-attributes">
              <div class="attribute-title"><i class="fas fa-database"></i> Attributs</div>
              <div class="attribute">- id: int</div>
              <div class="attribute">- nom_place: string</div>
              <div class="attribute">- description: string</div>
              <div class="attribute">- location: string</div>
              <div class="attribute">- longitude: float</div>
              <div class="attribute">- latitude: float</div>
              <div class="attribute">- category: string</div>
              <div class="attribute">- created_at: date</div>
              <div class="attribute">- updated_at: date</div>
            </div>
            <div class="class-divider"></div>
            <div class="class-methods">
              <div class="method-title"><i class="fas fa-cogs"></i> Méthodes</div>
              <div class="method">+ getAllPlaces()</div>
              <div class="method">+ getPlaceById()</div>
              <div class="method">+ createPlace()</div>
              <div class="method">+ updatePlace()</div>
              <div class="method">+ deletePlace()</div>
              <div class="method">+ filterPlacesByCategory()</div>
              <div class="method">+ searchPlaces()</div>
            </div>
          </div>
        </div>
        
        <div class="class-box">
          <div class="class-name">
            <i class="fas fa-calendar-alt"></i> Event
          </div>
          <div class="class-content">
            <div class="class-attributes">
              <div class="attribute-title"><i class="fas fa-database"></i> Attributs</div>
              <div class="attribute">- id: int</div>
              <div class="attribute">- title: string</div>
              <div class="attribute">- description: string</div>
              <div class="attribute">- place_id: int</div>
              <div class="attribute">- start_date: date</div>
              <div class="attribute">- end_date: date</div>
              <div class="attribute">- price: float</div>
              <div class="attribute">- created_at: date</div>
              <div class="attribute">- updated_at: date</div>
            </div>
            <div class="class-divider"></div>
            <div class="class-methods">
              <div class="method-title"><i class="fas fa-cogs"></i> Méthodes</div>
              <div class="method">+ getAllEvents()</div>
              <div class="method">+ getEventById()</div>
              <div class="method">+ createEvent()</div>
              <div class="method">+ updateEvent()</div>
              <div class="method">+ deleteEvent()</div>
              <div class="method">+ getUpcomingEvents()</div>
              <div class="method">+ getEventsByPlace()</div>
            </div>
          </div>
        </div>
        
        <div class="class-box">
          <div class="class-name">
            <i class="fas fa-star"></i> Review
          </div>
          <div class="class-content">
            <div class="class-attributes">
              <div class="attribute-title"><i class="fas fa-database"></i> Attributs</div>
              <div class="attribute">- id: int</div>
              <div class="attribute">- user_id: int</div>
              <div class="attribute">- place_id: int</div>
              <div class="attribute">- rating: float</div>
              <div class="attribute">- comment: string</div>
              <div class="attribute">- created_at: date</div>
              <div class="attribute">- updated_at: date</div>
            </div>
            <div class="class-divider"></div>
            <div class="class-methods">
              <div class="method-title"><i class="fas fa-cogs"></i> Méthodes</div>
              <div class="method">+ getAllReviews()</div>
              <div class="method">+ getReviewsByPlace()</div>
              <div class="method">+ getReviewsByUser()</div>
              <div class="method">+ createReview()</div>
              <div class="method">+ updateReview()</div>
              <div class="method">+ deleteReview()</div>
            </div>
          </div>
        </div>
        
        <div class="class-box">
          <div class="class-name">
            <i class="fas fa-calendar-check"></i> Reservation
          </div>
          <div class="class-content">
            <div class="class-attributes">
              <div class="attribute-title"><i class="fas fa-database"></i> Attributs</div>
              <div class="attribute">- id: int</div>
              <div class="attribute">- user_id: int</div>
              <div class="attribute">- place_id: int</div>
              <div class="attribute">- reservation_date: date</div>
              <div class="attribute">- start_time: time</div>
              <div class="attribute">- end_time: time</div>
              <div class="attribute">- num_guests: int</div>
              <div class="attribute">- status: string</div>
              <div class="attribute">- created_at: date</div>
              <div class="attribute">- updated_at: date</div>
            </div>
            <div class="class-divider"></div>
            <div class="class-methods">
              <div class="method-title"><i class="fas fa-cogs"></i> Méthodes</div>
              <div class="method">+ getAllReservations()</div>
              <div class="method">+ getUserReservations()</div>
              <div class="method">+ createReservation()</div>
              <div class="method">+ updateReservation()</div>
              <div class="method">+ cancelReservation()</div>
              <div class="method">+ getReservationsByPlace()</div>
              <div class="method">+ getReservationsByDate()</div>
            </div>
          </div>
        </div>
        
        <div class="class-box">
          <div class="class-name">
            <i class="fas fa-percentage"></i> Promotion
          </div>
          <div class="class-content">
            <div class="class-attributes">
              <div class="attribute-title"><i class="fas fa-database"></i> Attributs</div>
              <div class="attribute">- id: int</div>
              <div class="attribute">- place_id: int</div>
              <div class="attribute">- title: string</div>
              <div class="attribute">- description: string</div>
              <div class="attribute">- discount_percent: float</div>
              <div class="attribute">- start_date: date</div>
              <div class="attribute">- end_date: date</div>
              <div class="attribute">- created_at: date</div>
              <div class="attribute">- updated_at: date</div>
            </div>
            <div class="class-divider"></div>
            <div class="class-methods">
              <div class="method-title"><i class="fas fa-cogs"></i> Méthodes</div>
              <div class="method">+ getAllPromotions()</div>
              <div class="method">+ getActivePromotions()</div>
              <div class="method">+ createPromotion()</div>
              <div class="method">+ updatePromotion()</div>
              <div class="method">+ deletePromotion()</div>
              <div class="method">+ getPromotionsByPlace()</div>
            </div>
          </div>
        </div>
        
        <div class="class-box">
          <div class="class-name">
            <i class="fas fa-comments"></i> Message
          </div>
          <div class="class-content">
            <div class="class-attributes">
              <div class="attribute-title"><i class="fas fa-database"></i> Attributs</div>
              <div class="attribute">- id: int</div>
              <div class="attribute">- id_expediteur: int</div>
              <div class="attribute">- id_destinataire: int</div>
              <div class="attribute">- texte: string</div>
              <div class="attribute">- date_envoi: datetime</div>
              <div class="attribute">- lu: boolean</div>
            </div>
            <div class="class-divider"></div>
            <div class="class-methods">
              <div class="method-title"><i class="fas fa-cogs"></i> Méthodes</div>
              <div class="method">+ envoyerMessage()</div>
              <div class="method">+ getConversation()</div>
              <div class="method">+ marquerCommeLu()</div>
              <div class="method">+ supprimerMessage()</div>
              <div class="method">+ getMessagesNonLus()</div>
              <div class="method">+ getConversations()</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>JendoubaLife API Documentation &copy; ${new Date().getFullYear()} - Développé avec ❤️ par l'équipe JendoubaLife</p>
        <p>Version de l'API: 1.0.0 | Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </body>
    </html>
    `;
    
    const diagramPath = path.join(this.docsDir, 'diagram_de_class.html');
    fs.writeFileSync(diagramPath, diagramHtml);
    console.log(`✅ Diagramme de classes généré: ${diagramPath}`);
    
    return diagramPath;
  }

  /**
   * Génère un PDF à partir de la documentation Markdown
   */
  generatePdfDoc(markdownPath) {
    try {
      const pdfPath = path.join(this.docsDir, 'api-documentation.pdf');
      
      // Créer un nouveau document PDF
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);
      
      // En-tête
      doc.fontSize(25).text('Documentation API JendoubaLife', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
      doc.moveDown(2);
      
      // Contenu
      const markdownContent = fs.readFileSync(markdownPath, 'utf8');
      const lines = markdownContent.split('\n');
      
      let inCode = false;
      
      lines.forEach(line => {
        // Gérer les blocs de code
        if (line.trim().startsWith('```')) {
          inCode = !inCode;
          return;
        }
        
        if (inCode) {
          doc.font('Courier').fontSize(9).text(line, { indent: 20 });
          return;
        }
        
        // Gérer les titres
        if (line.startsWith('# ')) {
          doc.font('Helvetica-Bold').fontSize(18).text(line.substring(2));
          doc.moveDown();
        } else if (line.startsWith('## ')) {
          doc.font('Helvetica-Bold').fontSize(16).text(line.substring(3));
          doc.moveDown();
        } else if (line.startsWith('### ')) {
          doc.font('Helvetica-Bold').fontSize(14).text(line.substring(4));
          doc.moveDown();
        }
        // Gérer les listes
        else if (line.startsWith('- ')) {
          doc.font('Helvetica').fontSize(10).text(`• ${line.substring(2)}`, { indent: 10 });
        }
        // Gérer le texte normal
        else if (line.trim() !== '') {
          doc.font('Helvetica').fontSize(10).text(line);
        }
        
        // Ajouter un saut de ligne pour les lignes vides
        if (line.trim() === '') {
          doc.moveDown(0.5);
        }
        
        // Vérifier s'il faut passer à une nouvelle page
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
      });
      
      // Pied de page
      doc.fontSize(8).text('© 2024 JendoubaLife - Documentation API', {
        align: 'center',
        bottom: 30
      });
      
      // Finaliser le document
      doc.end();
      
      console.log(`✅ Documentation PDF générée: ${pdfPath}`);
      return pdfPath;
    } catch (error) {
      console.error(colors.red('❌ Erreur lors de la génération du PDF:'), error);
      return null;
    }
  }

  /**
   * Conversion Markdown vers HTML (version simplifiée)
   */
  markdownToHtml(markdown) {
    let html = markdown
      // Titres
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      
      // Listes
      .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>')
      .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
      
      // Blocs de code
      .replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
      
      // Code inline
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Liens
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      
      // Paragraphes
      .replace(/^\s*$/gm, '</p><p>')
      
      // Séparateurs
      .replace(/^---$/gm, '<hr>');
    
    html = '<p>' + html + '</p>';
    
    // Nettoyer les paragraphes vides
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
  }

  /**
   * Groupe les routes par catégorie
   */
  groupRoutesByCategory() {
    const groups = {};
    
    this.routes.forEach(route => {
      const category = this.getRouteCategory(route);
      
      if (!groups[category]) {
        groups[category] = [];
      }
      
      groups[category].push(route);
    });
    
    return groups;
  }

  /**
   * Détermine la catégorie d'une route
   */
  getRouteCategory(route) {
    if (route.path.startsWith('/users')) return 'Utilisateurs';
    if (route.path.startsWith('/places')) return 'Lieux';
    if (route.path.startsWith('/events')) return 'Événements';
    if (route.path.startsWith('/reviews')) return 'Avis';
    if (route.path.startsWith('/reservations')) return 'Réservations';
    if (route.path.startsWith('/promotions')) return 'Promotions';
    if (route.path.startsWith('/messagerie')) return 'Messagerie';
    if (route.path.startsWith('/clerk')) return 'Intégration Clerk';
    
    return 'Autres';
  }

  /**
   * Génère une description pour un endpoint
   */
  getEndpointDescription(category, route) {
    const baseName = category.toLowerCase();
    const singular = baseName.endsWith('s') ? baseName.slice(0, -1) : baseName;
    
    if (route.method === 'GET') {
      if (route.path.includes(':id')) return `Récupérer un(e) ${singular} spécifique`;
      return `Lister les ${baseName}`;
    }
    if (route.method === 'POST') return `Créer un(e) nouveau(elle) ${singular}`;
    if (route.method === 'PUT') return `Mettre à jour un(e) ${singular} existant(e)`;
    if (route.method === 'DELETE') return `Supprimer un(e) ${singular}`;
    if (route.method === 'PATCH') return `Mettre à jour partiellement un(e) ${singular}`;
    
    return `Interagir avec les ${baseName}`;
  }

  /**
   * Génère la liste des paramètres pour un endpoint
   */
  getEndpointParams(category, route) {
    const baseName = category.toLowerCase();
    const singular = baseName.endsWith('s') ? baseName.slice(0, -1) : baseName;
    
    // Définition des paramètres communs selon le type de route
    let params = [];
    
    if (route.path.includes(':id')) {
      params.push(`id: ID du/de la ${singular}`);
    }
    
    if (category === 'Utilisateurs') {
      if (route.method === 'POST' && route.path.includes('register')) {
        params = ['nom: Nom de l\'utilisateur', 'prenom: Prénom de l\'utilisateur', 'email: Adresse email', 'password: Mot de passe'];
      } else if (route.method === 'POST' && route.path.includes('login')) {
        params = ['email: Adresse email', 'password: Mot de passe'];
      }
    } else if (category === 'Lieux' && (route.method === 'POST' || route.method === 'PUT')) {
      params = ['nom_place: Nom du lieu', 'description: Description du lieu', 'location: Adresse', 'longitude: Coordonnée longitude', 'latitude: Coordonnée latitude', 'category: Catégorie du lieu'];
    } else if (category === 'Événements' && (route.method === 'POST' || route.method === 'PUT')) {
      params = ['title: Titre de l\'événement', 'place_id: ID du lieu associé', 'start_date: Date de début', 'end_date: Date de fin', 'price: Prix (optionnel)'];
    }
    
    return params.length > 0 ? params.join(', ') : 'Aucun paramètre requis';
  }

  /**
   * Génère un exemple de test pour un endpoint
   */
  getTestExample(category, route) {
    const baseName = category.toLowerCase();
    const routeBase = baseName.endsWith('s') ? 
      baseName : 
      (baseName === 'messagerie' ? 'messagerie' : `${baseName}s`);
    
    const baseUrl = `http://localhost:3000/api/${routeBase}`;
    let url = baseUrl;
    
    if (route.path !== '/') {
      // Remplacer les paramètres dynamiques par des exemples
      url += route.path.replace(/:id/g, '1').replace(/:userId/g, '2');
    }
    
    let example = `// Exemple de requête ${route.method}\n`;
    example += `fetch('${url}', {\n`;
    example += `  method: '${route.method}',\n`;
    
    // Ajouter l'en-tête d'autorisation pour les routes protégées
    if (route.auth) {
      example += `  headers: { \n    'Content-Type': 'application/json',\n    'Authorization': 'Bearer your_jwt_token_here'\n  },\n`;
    } else {
      example += `  headers: { 'Content-Type': 'application/json' },\n`;
    }
    
    // Ajouter un exemple de corps de requête pour les méthodes POST, PUT et PATCH
    if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
      let requestBody = {};
      
      if (category === 'Utilisateurs') {
        if (route.path.includes('register')) {
          requestBody = {
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@example.com',
            password: 'motdepasse123'
          };
        } else if (route.path.includes('login')) {
          requestBody = {
            email: 'jean.dupont@example.com',
            password: 'motdepasse123'
          };
        } else if (route.path.includes('status')) {
          requestBody = { status: 'actif' };
        } else {
          requestBody = {
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@example.com'
          };
        }
      } else if (category === 'Lieux') {
        requestBody = {
          nom_place: 'Café des Artistes',
          description: 'Un café confortable au cœur de Jendouba',
          location: '123 Rue Principale, Jendouba',
          longitude: 8.7767,
          latitude: 36.5014,
          category: 'restaurants'
        };
      } else if (category === 'Événements') {
        requestBody = {
          title: 'Festival de Musique',
          place_id: 1,
          start_date: '2023-08-15T18:00:00',
          end_date: '2023-08-15T23:00:00',
          price: 15.5
        };
      } else if (category === 'Avis') {
        requestBody = {
          place_id: 1,
          rating: 4.5,
          comment: 'Excellent service et cadre agréable.'
        };
      } else if (category === 'Réservations') {
        requestBody = {
          place_id: 1,
          reservation_date: '2023-09-20',
          start_time: '19:00',
          end_time: '21:00',
          num_guests: 4
        };
      } else if (category === 'Promotions') {
        requestBody = {
          place_id: 1,
          title: 'Offre Spéciale Été',
          discount_percent: 15,
          start_date: '2023-07-01',
          end_date: '2023-08-31'
        };
      } else if (category === 'Messagerie') {
        requestBody = {
          id_destinataire: 2,
          texte: 'Bonjour, avez-vous des disponibilités pour ce week-end?'
        };
      }
      
      example += `  body: JSON.stringify(${JSON.stringify(requestBody, null, 2)})\n`;
    }
    
    example += `})\n`;
    example += `.then(response => response.json())\n`;
    example += `.then(data => console.log('Réponse:', data))\n`;
    example += `.catch(error => console.error('Erreur:', error));`;
    
    return example;
  }
}

module.exports = ApiDocGenerator;
