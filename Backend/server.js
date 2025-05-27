/**
 * Application principale JenCity API
 *
 * Ce fichier sert de point d'entrée à l'application.
 * Il initialise le serveur Express, connecte à la base de données,
 * et configure les routes API.
 */
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();

// Importer les routes
const userRoutes = require("./routes/userRoutes");
const placeRoutes = require("./routes/placeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const messagerieRoutes = require("./routes/messagerieRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

// Middleware de journalisation des requêtes
const requestLogger = require("./middleware/requestLogger");

// Créer l'application Express
const app = express();

// Configurer les middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  })
);

// Middleware de journalisation personnalisé
app.use(requestLogger);

// Servir la documentation statique
app.use("/docs", express.static(path.join(__dirname, "docs")));
app.use("/api-docs", (req, res) => {
  res.redirect("/docs/api-documentation.html");
});

// Configurer les routes API
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/messagerie", messagerieRoutes);
app.use("/api/password", passwordRoutes);

// Route d'accueil
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>JenCity API</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #3498db; }
          a { display: inline-block; margin: 10px 0; padding: 10px 15px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
          a:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <h1>Bienvenue sur l'API JenCity</h1>
        <p>Consultez la documentation pour plus d'informations sur les APIs disponibles.</p>
        <a href="/api-docs">Voir la Documentation API</a>
      </body>
    </html>
  `);
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur:", err.stack);
  res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Middleware pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Définir le port
const PORT = process.env.PORT || 3000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`
  ╭─────────────────────────────────────────────────────────────╮
  │                                                             │
  │   🚀 Serveur démarré sur le port ${PORT}                   │
  │   🌐 http://localhost:${PORT}                              │
  │   📘 Documentation API: http://localhost:${PORT}/api-docs  | 
  │                                                             │
  ╰─────────────────────────────────────────────────────────────╯
  `);
});

module.exports = app;
