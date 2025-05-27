const db = require("../config/db");

/**
 * Classe Review - Gère les avis des utilisateurs sur les lieux
 * Cette classe contient toutes les méthodes pour créer, récupérer,
 * mettre à jour et supprimer des avis.
 */
class Review {
  /**
   * Récupère tous les avis avec des filtres optionnels
   * @param {Object} filters - Filtres (placeId, userId)
   * @returns {Promise<Array>} Liste des avis
   */
  static async getAll(filters = {}) {
    let query = `
      SELECT r.*, u.firstName, u.lastName, p.name as placeName 
      FROM reviews r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN places p ON r.placeId = p.id
      WHERE 1=1`;
    const params = [];

    // Filtre par lieu
    if (filters.placeId) {
      query += " AND r.placeId = ?";
      params.push(filters.placeId);
    }

    // Filtre par utilisateur
    if (filters.userId) {
      query += " AND r.userId = ?";
      params.push(filters.userId);
    }

    // Trier par date de création (décroissant)
    query += " ORDER BY r.createdAt DESC";

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Récupère un avis par son identifiant
   * @param {number} id - Identifiant de l'avis
   * @returns {Promise<Object>} Détails de l'avis
   */
  static async getById(id) {
    const [rows] = await db.query(
      `
      SELECT r.*, u.firstName, u.lastName, p.name as placeName
      FROM reviews r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN places p ON r.placeId = p.id
      WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Récupère les avis pour un lieu spécifique
   * @param {number} placeId - Identifiant du lieu
   * @returns {Promise<Array>} Liste des avis pour ce lieu
   */
  static async getByPlaceId(placeId) {
    const [rows] = await db.query(
      `
      SELECT r.*, u.firstName, u.lastName
      FROM reviews r
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.placeId = ?
      ORDER BY r.createdAt DESC`,
      [placeId]
    );
    return rows;
  }

  /**
   * Récupère les avis d'un utilisateur spécifique
   * @param {number} userId - Identifiant de l'utilisateur
   * @returns {Promise<Array>} Liste des avis de cet utilisateur
   */
  static async getByUserId(userId) {
    const [rows] = await db.query(
      `
      SELECT r.*, p.name as placeName
      FROM reviews r
      LEFT JOIN places p ON r.placeId = p.id
      WHERE r.userId = ?
      ORDER BY r.createdAt DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Crée un nouvel avis
   * @param {Object} reviewData - Données de l'avis (userId, placeId, rating, comment)
   * @returns {Promise<number>} Identifiant du nouvel avis
   */
  static async create(reviewData) {
    const [result] = await db.query(
      `INSERT INTO reviews 
    (userId, placeId, rating, comment, status, createdAt)
    VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        reviewData.userId,
        reviewData.placeId,
        reviewData.rating,
        reviewData.comment,
        reviewData.status || "pending", // Default to 'pending' if not provided
      ]
    );
    return result.insertId;
  }
  /**
   * Met à jour un avis existant
   * @param {number} id - Identifiant de l'avis
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<void>}
   */
  static async update(id, updates) {
    updates.updatedAt = new Date(); // Ajouter l'horodatage de mise à jour

    const fields = Object.keys(updates).join(" = ?, ") + " = ?";
    const values = Object.values(updates);

    await db.query(`UPDATE reviews SET ${fields} WHERE id = ?`, [
      ...values,
      id,
    ]);
  }

  /**
   * Supprime un avis
   * @param {number} id - Identifiant de l'avis
   * @returns {Promise<void>}
   */
  static async delete(id) {
    await db.query("DELETE FROM reviews WHERE id = ?", [id]);
  }

  /**
   * Calcule la note moyenne pour un lieu
   * @param {number} placeId - Identifiant du lieu
   * @returns {Promise<Object>} Objet contenant la note moyenne et le nombre d'avis
   */
  static async getAverageRatingForPlace(placeId) {
    const [rows] = await db.query(
      "SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM reviews WHERE placeId = ?",
      [placeId]
    );
    return {
      averageRating: rows[0]?.average_rating || 0,
      reviewCount: rows[0]?.review_count || 0,
    };
  }
}

module.exports = Review;
