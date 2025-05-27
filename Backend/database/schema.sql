
-- Create database if not exists with proper character set
-- Création de la base de données si elle n'existe pas, avec le bon jeu de caractères
CREATE DATABASE IF NOT EXISTS myapp_database1 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
USE myapp_database1;

-- Table des utilisateurs - Mise à jour pour supprimer les champs name, nom, prenom
-- Users Table - Updated to remove name, nom, prenom fields
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,                    -- Prénom de l'utilisateur
    lastName VARCHAR(100) NOT NULL,                     -- Nom de l'utilisateur
    email VARCHAR(100) UNIQUE NOT NULL,                 -- Email (unique) de l'utilisateur
    password VARCHAR(255) NOT NULL,                     -- Mot de passe hashé
    phone VARCHAR(20) DEFAULT NULL,                     -- Numéro de téléphone (optionnel)
    role ENUM('admin', 'user', 'provider') NOT NULL DEFAULT 'user',  -- Rôle de l'utilisateur
    status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',  -- Statut du compte
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Date de création
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Date de mise à jour
    INDEX idx_email (email),                            -- Index sur l'email pour accélérer les recherches
    INDEX idx_role (role),                              -- Index sur le rôle
    INDEX idx_status (status)                           -- Index sur le statut
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sample users with hashed password '123123'
INSERT INTO users (firstName, lastName, email, password, phone, role, status) VALUES
('Admin', 'User', 'admin@example.com', '$2b$10$7BxlWkRnhl9Hg8NjQMg7OuPv.ZBdyu7mBvp94XTT5y66fGvS/t6w6', '+21625478632', 'admin', 'active'),
('Regular', 'User', 'user@example.com', '$2b$10$717nsaed6pxY5h9mewZ8Ke18Uh.KPz0IB9fd2v2EJE98dKPrbYLkq', '+21625478633', 'user', 'active'),
('John', 'Doe', 'john@example.com', '$2b$10$717nsaed6pxY5h9mewZ8Ke18Uh.KPz0IB9fd2v2EJE98dKPrbYLkq', '+21625478634', 'provider', 'active'),
('Jane', 'Smith', 'jane@example.com', '$2b$10$717nsaed6pxY5h9mewZ8Ke18Uh.KPz0IB9fd2v2EJE98dKPrbYLkq', '+21625478635', 'provider', 'active'),
('Sarah', 'Wilson', 'sarah@example.com', '$2b$10$717nsaed6pxY5h9mewZ8Ke18Uh.KPz0IB9fd2v2EJE98dKPrbYLkq', '+21625478636', 'user', 'active');
-- Table des lieux
-- Places Table
CREATE TABLE IF NOT EXISTS places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,                         
    type VARCHAR(50) NOT NULL,                          
    description TEXT,                                   
    location TEXT,                                      
    images TEXT,                                        
    openingHours TEXT,                                  
    entranceFee TEXT,                                   
    provider_id INT,                                    
    average_rating DECIMAL(3,2) DEFAULT 0,              
    isActive BOOLEAN DEFAULT TRUE,                      
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL,  
    INDEX idx_name (name(191)),                         
    INDEX idx_type (type),                              
    INDEX idx_provider (provider_id),                   
    INDEX idx_isActive (isActive)                       
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sample places data with real places in Jendouba
INSERT INTO places (name, type, description, location, images, openingHours, entranceFee, provider_id, average_rating) VALUES
('Bulla Regia', 'historical', 'Ancient Roman city with unique underground villas and well-preserved mosaics', 
JSON_OBJECT('latitude', 36.5581, 'longitude', 8.7550, 'address', 'Jendouba, Tunisia', 'region', 'Jendouba'),
JSON_ARRAY('bulla_regia1.jpg', 'bulla_regia2.jpg'),
JSON_OBJECT('monday', '8:00-17:00', 'tuesday', '8:00-17:00', 'wednesday', '8:00-17:00', 'thursday', '8:00-17:00', 'friday', '8:00-17:00', 'saturday', '9:00-16:00', 'sunday', '9:00-16:00'),
JSON_OBJECT('adult', 12, 'child', 5, 'student', 8),
3, 4.7),

('Chemtou Museum', 'museum', 'Archaeological museum showcasing ancient marble quarries and Roman artifacts', 
JSON_OBJECT('latitude', 36.4894, 'longitude', 8.5750, 'address', 'Chemtou, Jendouba, Tunisia', 'region', 'Jendouba'),
JSON_ARRAY('chemtou1.jpg', 'chemtou2.jpg'),
JSON_OBJECT('monday', 'Closed', 'tuesday', '9:00-16:00', 'wednesday', '9:00-16:00', 'thursday', '9:00-16:00', 'friday', '9:00-16:00', 'saturday', '10:00-15:00', 'sunday', '10:00-15:00'),
JSON_OBJECT('adult', 8, 'child', 3, 'student', 5),
4, 4.5),

('Ain Soltane', 'natural', 'Beautiful natural spring and recreational area surrounded by mountains', 
JSON_OBJECT('latitude', 36.5011, 'longitude', 8.3047, 'address', 'Ain Draham, Jendouba, Tunisia', 'region', 'Jendouba'),
JSON_ARRAY('ain_soltane1.jpg', 'ain_soltane2.jpg'),
JSON_OBJECT('monday', '7:00-19:00', 'tuesday', '7:00-19:00', 'wednesday', '7:00-19:00', 'thursday', '7:00-19:00', 'friday', '7:00-19:00', 'saturday', '7:00-19:00', 'sunday', '7:00-19:00'),
JSON_OBJECT('adult', 5, 'child', 2, 'student', 3),
3, 4.8);

-- Table des événements
-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,                        -- Titre de l'événement
    description TEXT,                                   -- Description détaillée
    startDate DATETIME NOT NULL,                        -- Date et heure de début
    endDate DATETIME NOT NULL,                          -- Date et heure de fin
    location VARCHAR(255),                              -- Lieu de l'événement
    organizer VARCHAR(255),                             -- Organisateur
    ticketPrice DECIMAL(10,2),                          -- Prix du billet
    capacity INT,                                       -- Capacité maximale
    images TEXT,                                        -- URLs des images (format JSON)
    provider_id INT,                                    -- ID du fournisseur/organisateur
    place_id INT,                                       -- ID du lieu associé
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Date de création
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Date de mise à jour
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL,  -- Clé étrangère vers utilisateurs
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL,    -- Clé étrangère vers places
    INDEX idx_startDate (startDate),                    -- Index sur la date de début
    INDEX idx_endDate (endDate),                        -- Index sur la date de fin
    INDEX idx_location (location(191)),                 -- Index sur le lieu
    INDEX idx_provider (provider_id),                   -- Index sur le fournisseur
    INDEX idx_place (place_id)                          -- Index sur le lieu associé
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update sample events data with real events in Jendouba places
INSERT INTO events (title, description, startDate, endDate, location, organizer, ticketPrice, capacity, images, provider_id, place_id) VALUES
('Bulla Regia Night Tour', 'Experience the ancient Roman city by moonlight with expert guides', 
DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY),
'Bulla Regia', 'Historical Heritage Society', 25.00, 30,
JSON_ARRAY('bulla_night1.jpg', 'bulla_night2.jpg'), 3, 1),

('Chemtou Marble Workshop', 'Learn about ancient marble extraction and sculpting techniques',
DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY),
'Chemtou Museum', 'Artisans Association', 15.00, 20,
JSON_ARRAY('marble_workshop1.jpg', 'marble_workshop2.jpg'), 4, 2),

('Spring Festival at Ain Soltane', 'Traditional music and local food festival',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 21 DAY),
'Ain Soltane', 'Jendouba Cultural Committee', 10.00, 200,
JSON_ARRAY('festival1.jpg', 'festival2.jpg'), 3, 3);

-- Table des réservations
-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,                               -- ID de l'utilisateur qui fait la réservation
    eventId INT,                                       -- ID de l'événement (peut être NULL si c'est une réservation de lieu)
    placeId INT,                                       -- ID du lieu (peut être NULL si c'est une réservation d'événement)
    numberOfTickets INT,                               -- Nombre de billets/personnes
    numberOfPersons INT,                               -- Nombre de personnes (utilisé pour les réservations de lieux)
    totalPrice DECIMAL(10,2),                          -- Prix total de la réservation
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending', -- Statut de la réservation
    paymentMethod VARCHAR(50),                         -- Méthode de paiement
    paymentId VARCHAR(100),                            -- ID de référence de la transaction de paiement
    visitDate DATE,                                    -- Date de visite (pour les réservations de lieux)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Date de création
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Date de mise à jour
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,     -- Clé étrangère vers utilisateurs
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL,  -- Clé étrangère vers événements
    FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE SET NULL,  -- Clé étrangère vers lieux
    INDEX idx_userId (userId),                         -- Index sur l'utilisateur
    INDEX idx_eventId (eventId),                       -- Index sur l'événement
    INDEX idx_placeId (placeId),                       -- Index sur le lieu
    INDEX idx_status (status),                         -- Index sur le statut
    INDEX idx_visitDate (visitDate)                    -- Index sur la date de visite
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des sessions
-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId1 INT NOT NULL,                               -- ID du premier utilisateur
    userId2 INT NOT NULL,                               -- ID du deuxième utilisateur
    lastMessageAt TIMESTAMP NULL,                       -- Horodatage du dernier message
    isActive BOOLEAN DEFAULT TRUE,                      -- Statut d'activité de la session
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Date de création
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Date de mise à jour
    FOREIGN KEY (userId1) REFERENCES users(id) ON DELETE CASCADE,  -- Clé étrangère avec suppression en cascade
    FOREIGN KEY (userId2) REFERENCES users(id) ON DELETE CASCADE,  -- Clé étrangère avec suppression en cascade
    INDEX idx_user1 (userId1),                          -- Index sur le premier utilisateur
    INDEX idx_user2 (userId2),                          -- Index sur le deuxième utilisateur
    INDEX idx_last_message (lastMessageAt)              -- Index sur le dernier message
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table des messages
-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sessionId INT NOT NULL,                             -- ID de la session de conversation
    senderId INT NOT NULL,                              -- ID de l'expéditeur
    content TEXT NOT NULL,                              -- Contenu du message
    is_read BOOLEAN DEFAULT FALSE,                      -- Statut de lecture
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Date de création
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Date de mise à jour
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,  -- Clé étrangère avec suppression en cascade
    FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,  -- Clé étrangère avec suppression en cascade
    INDEX idx_sessionId (sessionId),                    -- Index sur la session
    INDEX idx_senderId (senderId)                       -- Index sur l'expéditeur
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sample sessions data
INSERT INTO sessions (userId1, userId2, lastMessageAt, isActive) VALUES
(2, 3, NOW(), true),
(4, 5, NOW(), true),
(1, 3, NOW(), true);

-- Sample messages data
INSERT INTO messages (sessionId, senderId, content, is_read) VALUES
(1, 2, 'Hello, I am interested in your museum tours', false),
(1, 3, 'Thank you for your interest! We have daily tours at 10 AM and 2 PM', true),
(2, 4, 'Is the art gallery open this weekend?', false),
(2, 5, 'Yes, we are open from 11 AM to 5 PM on weekends', true);

-- Table des avis
-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,                                -- ID de l'utilisateur qui a posté l'avis
    placeId INT NOT NULL,                               -- ID du lieu concerné
    rating DECIMAL(3,2) NOT NULL,                       -- Note (sur 5 étoiles)
    comment TEXT,                                       -- Commentaire textuel
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Date de création
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Date de mise à jour
    FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE CASCADE,  -- Clé étrangère avec suppression en cascade
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,  -- Clé étrangère avec suppression en cascade
    INDEX idx_place_id (placeId),                       -- Index sur le lieu
    INDEX idx_user_id (userId)                          -- Index sur l'utilisateur
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sample reviews data
INSERT INTO reviews (userId, placeId, rating, comment) VALUES
(2, 1, 4.5, 'Excellent museum with fascinating artifacts. Very informative guides.'),
(5, 2, 5.0, 'Beautiful art gallery with amazing local artwork. Must visit!'),
(4, 3, 4.8, 'Breathtaking amphitheater. The historical atmosphere is incredible.'),
(3, 1, 4.2, 'Great experience, but would appreciate more detailed descriptions.'),
(2, 2, 4.7, 'Wonderful collection of contemporary art. Very well curated.');

-- Reste des tables et déclencheurs
-- Individual triggers for rating update
CREATE TRIGGER update_place_rating_insert AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE places SET average_rating = (
        SELECT AVG(rating) FROM reviews 
        WHERE placeId = NEW.placeId
    ) WHERE id = NEW.placeId;
END;

CREATE TRIGGER update_place_rating_update AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE places SET average_rating = (
        SELECT AVG(rating) FROM reviews 
        WHERE placeId = NEW.placeId
    ) WHERE id = NEW.placeId;
END;

CREATE TRIGGER update_place_rating_delete AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE places SET average_rating = (
        SELECT AVG(rating) FROM reviews 
        WHERE placeId = OLD.placeId
    ) WHERE id = OLD.placeId;
END;

-- Trigger to update lastMessageAt in session when a new message is created
CREATE TRIGGER update_session_last_message AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    UPDATE sessions 
    SET lastMessageAt = NEW.createdAt
    WHERE id = NEW.sessionId;
END;