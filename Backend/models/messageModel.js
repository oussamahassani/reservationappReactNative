const db = require("../config/db");

class Message {
  // Créer un nouveau message
  static async create(messageData) {
    const [result] = await db.query(
      `INSERT INTO messages 
      (sessionId, senderId, content) 
      VALUES (?, ?, ?)`,
      [messageData.sessionId, messageData.senderId, messageData.content]
    );
    return result.insertId;
  }

  // Récupérer les messages d'une session
  static async getBySessionId(sessionId) {
    const [rows] = await db.query(
      `SELECT * FROM messages 
       WHERE sessionId = ? 
       ORDER BY createdAt ASC`,
      [sessionId]
    );
    return rows;
  }

  // Récupérer un message par ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM messages WHERE id = ?", [id]);
    return rows[0];
  }
}

module.exports = Message;
