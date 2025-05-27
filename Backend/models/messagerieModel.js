
const db = require("../config/db");

class Messagerie {
  // Create a new message
  static async create(messageData) {
    const [result] = await db.query(
      `INSERT INTO messagerie 
      (id_expediteur, id_destinataire, texte) 
      VALUES (?, ?, ?)`,
      [
        messageData.id_expediteur,
        messageData.id_destinataire,
        messageData.texte,
      ]
    );
    return result.insertId;
  }

  // Get message by ID
  static async getById(id) {
    const [rows] = await db.query(
      "SELECT * FROM messagerie WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  // Get all messages between two users (conversation)
  static async getConversation(user1Id, user2Id, limit = 50, offset = 0) {
    const [rows] = await db.query(
      `SELECT * FROM messagerie 
      WHERE (id_expediteur = ? AND id_destinataire = ?) 
      OR (id_expediteur = ? AND id_destinataire = ?) 
      ORDER BY date_envoye DESC 
      LIMIT ? OFFSET ?`,
      [user1Id, user2Id, user2Id, user1Id, limit, offset]
    );
    return rows;
  }

  // Get all conversations for a user (grouped by other participant)
  static async getUserConversations(userId) {
    const [rows] = await db.query(
      `SELECT 
        CASE 
          WHEN id_expediteur = ? THEN id_destinataire 
          ELSE id_expediteur 
        END AS other_user_id,
        MAX(date_envoye) as last_message_date,
        (
          SELECT texte 
          FROM messagerie m2 
          WHERE (
            (m2.id_expediteur = m1.id_expediteur AND m2.id_destinataire = m1.id_destinataire) OR
            (m2.id_expediteur = m1.id_destinataire AND m2.id_destinataire = m1.id_expediteur)
          )
          ORDER BY m2.date_envoye DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT id_expediteur 
          FROM messagerie m2 
          WHERE (
            (m2.id_expediteur = m1.id_expediteur AND m2.id_destinataire = m1.id_destinataire) OR
            (m2.id_expediteur = m1.id_destinataire AND m2.id_destinataire = m1.id_expediteur)
          )
          ORDER BY m2.date_envoye DESC 
          LIMIT 1
        ) as last_sender,
        (
          SELECT COUNT(*) 
          FROM messagerie m3 
          WHERE m3.id_destinataire = ? 
          AND m3.id_expediteur = CASE 
            WHEN id_expediteur = ? THEN id_destinataire 
            ELSE id_expediteur 
          END
          AND m3.is_read = FALSE
        ) as unread_count
      FROM messagerie m1
      WHERE id_expediteur = ? OR id_destinataire = ?
      GROUP BY other_user_id
      ORDER BY last_message_date DESC`,
      [userId, userId, userId, userId]
    );
    return rows;
  }

  // Mark a message as read
  static async markAsRead(messageId) {
    await db.query(
      "UPDATE messagerie SET is_read = TRUE WHERE id = ?",
      [messageId]
    );
  }

  // Mark all messages in a conversation as read
  static async markConversationAsRead(userId, otherUserId) {
    await db.query(
      "UPDATE messagerie SET is_read = TRUE WHERE id_destinataire = ? AND id_expediteur = ? AND is_read = FALSE",
      [userId, otherUserId]
    );
  }

  // Delete a message
  static async delete(id) {
    await db.query("DELETE FROM messagerie WHERE id = ?", [id]);
  }

  // Get unread messages count for a user
  static async getUnreadCount(userId) {
    const [result] = await db.query(
      "SELECT COUNT(*) as count FROM messagerie WHERE id_destinataire = ? AND is_read = FALSE",
      [userId]
    );
    return result[0].count;
  }
}

module.exports = Messagerie;
