const db = require("../config/db");

class Session {
  // Créer une nouvelle session
  static async create(sessionData) {
    const userId1 = parseInt(sessionData.userId1, 10);
    const userId2 = parseInt(sessionData.userId2, 10);

    const [result] = await db.query(
      `INSERT INTO sessions 
      (userId1, userId2, isActive) 
      VALUES (?, ?, true)`,
      [userId1, userId2]
    );
    return result.insertId;
  }

  // Récupérer toutes les sessions d'un utilisateur
  static async getAllForUser(userId) {
    const parsedUserId = parseInt(userId, 10);

    const [rows] = await db.query(
      `SELECT 
      s.*, 
      u1.firstName AS user1FirstName, 
      u1.lastName AS user1LastName,
      u2.firstName AS user2FirstName, 
      u2.lastName AS user2LastName,
      (SELECT m.content 
       FROM messages m 
       WHERE m.sessionId = s.id 
       ORDER BY m.createdAt DESC 
       LIMIT 1) AS lastMessage,
      (SELECT m.createdAt 
       FROM messages m 
       WHERE m.sessionId = s.id 
       ORDER BY m.createdAt DESC 
       LIMIT 1) AS lastMessageDate
   FROM sessions s
   JOIN users u1 ON s.userId1 = u1.id
   JOIN users u2 ON s.userId2 = u2.id
   WHERE s.userId1 = ? OR s.userId2 = ?
   ORDER BY lastMessageDate DESC`,
      [parsedUserId, parsedUserId]
    );
    return rows;
  }

  // Vérifier si une session existe entre deux utilisateurs
  static async findBetweenUsers(userId1, userId2) {
    const parsedUserId1 = parseInt(userId1, 10);
    const parsedUserId2 = parseInt(userId2, 10);

    const [rows] = await db.query(
      `SELECT * FROM sessions 
       WHERE (userId1 = ? AND userId2 = ?) 
       OR (userId1 = ? AND userId2 = ?)`,
      [parsedUserId1, parsedUserId2, parsedUserId2, parsedUserId1]
    );
    return rows[0];
  }

  // Récupérer une session par ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM sessions WHERE id = ?", [id]);
    return rows[0];
  }
}

module.exports = Session;
