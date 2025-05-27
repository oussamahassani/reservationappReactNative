
const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getUserConversations
} = require("../controllers/messagerieController");

// Liste toutes les conversations d'un utilisateur
router.get("/conversations/:userId", getUserConversations);

// Récupère une conversation spécifique
router.get("/conversations/:userId1/:userId2", getConversation);

// Envoie un nouveau message
router.post("/send", sendMessage);

module.exports = router;
