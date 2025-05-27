
/**
 * Middleware de journalisation des requêtes HTTP
 * Enregistre les détails de chaque requête entrante
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestBody = req.method !== 'GET' ? JSON.stringify(req.body) : '';
  
  console.log('\n🚀 NOUVELLE REQUÊTE API');
  console.log(`📍 ${req.method} ${req.originalUrl}`);
  
  if (requestBody) {
    console.log(`📦 Corps de la requête: ${requestBody}`);
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log(`🔍 Paramètres de requête:`, req.query);
  }
  
  // Traquer l'utilisateur si identifié
  if (req.user) {
    console.log(`👤 Utilisateur: ID=${req.user.id}, Rôle=${req.user.role}`);
  }
  
  // Intercepter la fin de réponse pour enregistrer le temps et le statut
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`⏱️ Temps de traitement: ${duration}ms`);
    console.log(`📊 Statut de réponse: ${res.statusCode}`);
    
    if (res.statusCode >= 400) {
      console.error(`❌ ERREUR: ${res.statusMessage || 'Erreur non spécifiée'}`);
    } else {
      console.log(`✅ Requête traitée avec succès`);
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = requestLogger;
