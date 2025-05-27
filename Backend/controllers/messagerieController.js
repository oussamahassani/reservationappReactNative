const Message = require("../models/messageModel");
const Session = require("../models/sessionModel");
const User = require("../models/userModel");

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Vérifier si les utilisateurs existent
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "Un ou plusieurs utilisateurs n'existent pas",
      });
    }

    // Vérifier si une session existe déjà
    let session = await Session.findBetweenUsers(senderId, receiverId);

    // Si pas de session, en créer une
    if (!session) {
      const sessionId = await Session.create({
        userId1: senderId,
        userId2: receiverId,
      });
      session = await Session.getById(sessionId);
    }

    // Créer le message
    const messageData = {
      sessionId: session.id,
      senderId: senderId,
      content: content,
    };

    const messageId = await Message.create(messageData);
    const message = await Message.getById(messageId);

    res.status(201).json({
      success: true,
      data: {
        message,
        session,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Récupérer une conversation entre deux utilisateurs
exports.getConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    // Vérifier si les utilisateurs existent
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: "Un ou plusieurs utilisateurs n'existent pas",
      });
    }

    // Trouver ou créer la session
    let session = await Session.findBetweenUsers(userId1, userId2);

    if (!session) {
      const sessionId = await Session.create({
        userId1: userId1,
        userId2: userId2,
      });
      session = await Session.getById(sessionId);
    }

    // Récupérer les messages
    const messages = await Message.getBySessionId(session.id);

    res.status(200).json({
      success: true,
      data: {
        session,
        messages,
      },
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Récupérer toutes les conversations d'un utilisateur
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "L'utilisateur n'existe pas",
      });
    }

    const conversations = await Session.getAllForUser(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error getting user conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};
