
/**
 * Modèle Utilisateur - Gère les opérations liées aux utilisateurs dans la base de données
 */
const db = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Classe User - Contient toutes les méthodes pour interagir avec la table users
 */
class User {
  /**
   * Crée un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur (firstName, lastName, email, password, etc.)
   * @returns {Promise<number>} ID du nouvel utilisateur
   */
  static async create({ firstName, lastName, email, password, role = 'user', phone = null }) {
    try {
      // Hashage simplifié du mot de passe
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;
      
      // Insertion dans la base de données
      const [result] = await db.execute(
        'INSERT INTO users (firstName, lastName, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [firstName, lastName, email, passwordHash, role, phone, 'active']
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Erreur lors de la création d\'un utilisateur:', error);
      throw error;
    }
  }

  /**
   * Recherche un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object|null>} Données de l'utilisateur
   */
  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  /**
   * Recherche un utilisateur par son ID
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object|null>} Données de l'utilisateur (sans le mot de passe)
   */
  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, firstName, lastName, email, role, phone, status, createdAt FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  /**
   * Met à jour un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {Object} updates - Champs à mettre à jour
   * @returns {Promise<boolean>} Succès de l'opération
   */
  static async update(id, updates) {
    // Hashage du mot de passe si fourni
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Construction de la requête dynamique
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    // Exécution de la mise à jour
    const [result] = await db.query(`UPDATE users SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  /**
   * Supprime un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<boolean>} Succès de l'opération
   */
  static async delete(id) {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  /**
   * Récupère tous les utilisateurs
   * @returns {Promise<Array>} Liste des utilisateurs (sans les mots de passe)
   */
  static async getAll() {
    const [rows] = await db.query("SELECT id, firstName, lastName, email, role, phone, status FROM users ORDER BY createdAt DESC");
    return rows;
  }

  /**
   * Vérifie si un mot de passe correspond au hash stocké
   * @param {string} plainPassword - Mot de passe en clair
   * @param {string} hashedPassword - Hash du mot de passe stocké
   * @returns {Promise<boolean>} Résultat de la vérification
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
