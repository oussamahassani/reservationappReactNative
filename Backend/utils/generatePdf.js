
/**
 * Utilitaire de conversion de la documentation API au format PDF
 * Nécessite markdown-pdf pour fonctionner
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { generateApiDoc } = require('./apiDocGenerator');

// Fonction pour convertir un fichier Markdown en PDF
const convertToPdf = (markdownPath, outputPath) => {
  return new Promise((resolve, reject) => {
    console.log(`📄 Conversion de ${markdownPath} en PDF...`);
    
    // Vérifier si markdown-pdf est installé
    exec('npm list -g markdown-pdf', (error, stdout, stderr) => {
      if (error && !stdout.includes('markdown-pdf')) {
        console.log('⚠️ markdown-pdf n\'est pas installé. Installation recommandée:');
        console.log('npm install -g markdown-pdf');
        
        // Solution alternative: créer un fichier HTML comme étape intermédiaire
        const markdownContent = fs.readFileSync(markdownPath, 'utf8');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Documentation API JendoubaLife</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #444; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    h3 { color: #666; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Documentation API JendoubaLife</h1>
  <p>Cette documentation est générée automatiquement et disponible en format HTML.</p>
  <p>Date de génération: ${new Date().toLocaleDateString('fr-FR')}</p>
  
  <div id="content">
    ${markdownContent
      .replace(/^# .*$/m, '') // Supprimer le titre principal (déjà ajouté)
      .replace(/^## (.*$)/gm, '<h2>$1</h2>') // Convertir les titres
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\`\`\`([^`]*)\`\`\`/gm, '<pre><code>$1</code></pre>') // Convertir les blocs de code
      .replace(/\`([^`]*)\`/gm, '<code>$1</code>') // Convertir les textes inline de code
    }
  </div>
</body>
</html>`;
        
        const htmlPath = markdownPath.replace('.md', '.html');
        fs.writeFileSync(htmlPath, htmlContent);
        console.log(`✅ Documentation HTML générée: ${htmlPath}`);
        
        // Créer également une version Word (docx) en remplaçant l'extension
        const docxPath = markdownPath.replace('.md', '.docx');
        console.log(`ℹ️ Pour générer un fichier Word, vous pouvez utiliser Pandoc:`);
        console.log(`pandoc ${markdownPath} -o ${docxPath}`);
        
        resolve(htmlPath);
        return;
      }
      
      // Si markdown-pdf est installé, convertir directement en PDF
      exec(`markdown-pdf ${markdownPath} -o ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Erreur lors de la conversion en PDF: ${error.message}`);
          reject(error);
          return;
        }
        console.log(`✅ Documentation PDF générée: ${outputPath}`);
        resolve(outputPath);
      });
    });
  });
};

// Fonction principale
const generatePdfDoc = async () => {
  try {
    // Générer d'abord la doc markdown
    const markdownPath = generateApiDoc();
    
    // Créer aussi une version HTML simple
    const htmlContent = fs.readFileSync(markdownPath, 'utf8')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\`\`\`([^`]*)\`\`\`/gm, '<pre><code>$1</code></pre>')
      .replace(/\`([^`]*)\`/gm, '<code>$1</code>');
    
    const htmlPath = markdownPath.replace('.md', '.html');
    fs.writeFileSync(htmlPath, `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation API JendoubaLife</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #444; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    h3 { color: #666; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .endpoint { margin-bottom: 30px; border-left: 4px solid #4CAF50; padding-left: 15px; }
    .method { display: inline-block; padding: 3px 8px; border-radius: 4px; color: white; font-weight: bold; }
    .get { background-color: #61affe; }
    .post { background-color: #49cc90; }
    .put { background-color: #fca130; }
    .delete { background-color: #f93e3e; }
    .patch { background-color: #50e3c2; }
  </style>
</head>
<body>
  <h1>Documentation API JendoubaLife</h1>
  <p>Cette documentation est générée automatiquement et disponible en format HTML.</p>
  <p>Date de génération: ${new Date().toLocaleDateString('fr-FR')}</p>
  ${htmlContent}
</body>
</html>`);
    
    console.log(`✅ Documentation HTML générée: ${htmlPath}`);
    
    // Définir le chemin de sortie pour le PDF
    const pdfPath = markdownPath.replace('.md', '.pdf');
    
    // Convertir en PDF
    await convertToPdf(markdownPath, pdfPath);
    
    return { markdownPath, htmlPath, pdfPath };
  } catch (error) {
    console.error(`❌ Erreur lors de la génération du PDF: ${error.message}`);
    throw error;
  }
};

// Exécuter la génération si ce script est appelé directement
if (require.main === module) {
  generatePdfDoc()
    .then(({ markdownPath, htmlPath, pdfPath }) => {
      console.log('\n📚 Documentation générée avec succès:');
      console.log(`📄 Markdown: ${markdownPath}`);
      console.log(`🌐 HTML: ${htmlPath}`);
      console.log(`📑 PDF: ${pdfPath || '(conversion PDF non disponible)'}`);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
    });
}

module.exports = { generatePdfDoc };
