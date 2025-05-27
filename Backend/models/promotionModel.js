
const db = require("../config/db");

class Promotion {
  // Récupérer toutes les promotions avec filtres optionnels
  static async getAll(filters = {}) {
    let query = "SELECT * FROM promotions WHERE 1=1";
    const params = [];

    // Filtre par lieu
    if (filters.place_id) {
      query += " AND place_id = ?";
      params.push(filters.place_id);
    }

    // Filtre par créateur
    if (filters.created_by) {
      query += " AND created_by = ?";
      params.push(filters.created_by);
    }

    // Filtre des promotions actives
    if (filters.active) {
      const now = new Date().toISOString().slice(0, 10);
      query += " AND start_date <= ? AND end_date >= ?";
      params.push(now, now);
    }

    // Tri par date de début (décroissant)
    query += " ORDER BY start_date DESC";

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Récupérer une promotion par son ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM promotions WHERE promotion_id = ?", [id]);
    return rows[0];
  }

  // Créer une nouvelle promotion
  static async create(promotionData) {
    const [result] = await db.query(
      `INSERT INTO promotions 
      (place_id, title, description, discount_percent, start_date, end_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        promotionData.place_id,
        promotionData.title,
        promotionData.description,
        promotionData.discount_percent,
        promotionData.start_date,
        promotionData.end_date,
        promotionData.created_by,
      ]
    );
    return result.insertId;
  }

  // Mettre à jour une promotion existante
  static async update(id, updates) {
    const fields = Object.keys(updates).join(" = ?, ") + " = ?";
    const values = Object.values(updates);

    await db.query(`UPDATE promotions SET ${fields} WHERE promotion_id = ?`, [
      ...values,
      id,
    ]);
  }

  // Supprimer une promotion
  static async delete(id) {
    await db.query("DELETE FROM promotions WHERE promotion_id = ?", [id]);
  }

  // Récupérer les promotions actives pour un lieu
  static async getActivePromotions(placeId) {
    const now = new Date().toISOString().slice(0, 10);
    const [rows] = await db.query(
      `SELECT * FROM promotions 
      WHERE place_id = ? AND start_date <= ? AND end_date >= ?
      ORDER BY discount_percent DESC`,
      [placeId, now, now]
    );
    return rows;
  }
}

module.exports = Promotion;
