
const Session = require("../models/sessionModel");
const { validationResult } = require("express-validator");

// Get all sessions for the authenticated user
exports.getAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.getAllForUser(userId);
    
    res.status(200).json({
      status: 200,
      data: sessions
    });
  } catch (error) {
    console.error("Error getting sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific session by ID with its messages
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.getById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the user is part of this session
    if (session.userId1 !== req.user.id && session.userId2 !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this session" });
    }

    res.status(200).json({
      status: 200,
      data: session
    });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new session
exports.createSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if session already exists between these users
    const existingSession = await Session.findBetweenUsers(
      req.body.userId1, 
      req.body.userId2
    );
    
    if (existingSession) {
      return res.status(409).json({ 
        message: "Session already exists between these users",
        data: existingSession 
      });
    }

    const sessionData = {
      userId1: req.body.userId1,
      userId2: req.body.userId2,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const sessionId = await Session.create(sessionData);
    const session = await Session.getById(sessionId, false);

    res.status(201).json({
      status: 201,
      message: "Session created successfully",
      data: session
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a session
exports.updateSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const session = await Session.getById(req.params.id, false);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the user is part of this session
    if (session.userId1 !== req.user.id && session.userId2 !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this session" });
    }

    const updated = await Session.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(400).json({ message: "Failed to update session" });
    }

    const updatedSession = await Session.getById(req.params.id, false);

    res.status(200).json({
      status: 200,
      message: "Session updated successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.getById(req.params.id, false);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the user is part of this session
    if (session.userId1 !== req.user.id && session.userId2 !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this session" });
    }

    const deleted = await Session.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({ message: "Failed to delete session" });
    }

    res.status(204).json({
      status: 204,
      message: "Session deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Server error" });
  }
};
