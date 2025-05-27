
const Message = require("../models/messageModel");
const Session = require("../models/sessionModel");
const { validationResult } = require("express-validator");

// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.getAll();
    res.status(200).json({
      status: 200,
      data: messages
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific message by ID
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.getById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is part of the session this message belongs to
    const session = await Session.getById(message.sessionId, false);
    if (!session || (session.userId1 !== req.user.id && session.userId2 !== req.user.id)) {
      return res.status(403).json({ message: "Not authorized to access this message" });
    }

    res.status(200).json({
      status: 200,
      data: message
    });
  } catch (error) {
    console.error("Error getting message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if session exists
    const session = await Session.getById(req.body.sessionId, false);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is part of this session
    if (session.userId1 !== req.user.id && session.userId2 !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to send message to this session" });
    }

    // Check if sender is the authenticated user
    if (req.body.senderId !== req.user.id) {
      return res.status(403).json({ message: "You can only send messages as yourself" });
    }

    const messageData = {
      sessionId: req.body.sessionId,
      senderId: req.body.senderId,
      content: req.body.content
    };

    const messageId = await Message.create(messageData);
    const message = await Message.getById(messageId);

    res.status(201).json({
      status: 201,
      message: "Message sent successfully",
      data: message
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a message (e.g., mark as read)
exports.updateMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const message = await Message.getById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is part of the session this message belongs to
    const session = await Session.getById(message.sessionId, false);
    if (!session || (session.userId1 !== req.user.id && session.userId2 !== req.user.id)) {
      return res.status(403).json({ message: "Not authorized to update this message" });
    }

    // Only allow updating read status and content if sender is current user
    const updateData = {};
    if (req.body.read !== undefined) {
      updateData.read = req.body.read;
    }
    
    if (req.body.content !== undefined) {
      if (message.senderId !== req.user.id) {
        return res.status(403).json({ message: "You can only edit your own messages" });
      }
      updateData.content = req.body.content;
    }

    const updated = await Message.update(req.params.id, updateData);
    
    if (!updated) {
      return res.status(400).json({ message: "Failed to update message" });
    }

    const updatedMessage = await Message.getById(req.params.id);

    res.status(200).json({
      status: 200,
      message: "Message updated successfully",
      data: updatedMessage
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.getById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is part of the session this message belongs to
    const session = await Session.getById(message.sessionId, false);
    if (!session || (session.userId1 !== req.user.id && session.userId2 !== req.user.id)) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // Only allow deletion if sender is current user or admin
    if (message.senderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const deleted = await Message.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({ message: "Failed to delete message" });
    }

    res.status(204).json({
      status: 204,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all messages for a session
exports.getMessagesBySession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    // Check if session exists
    const session = await Session.getById(sessionId, false);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is part of this session
    if (session.userId1 !== req.user.id && session.userId2 !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access messages from this session" });
    }

    const messages = await Message.getBySessionId(sessionId);
    
    // Mark all messages as read for the current user
    await Message.markSessionMessagesAsRead(sessionId, req.user.id);

    res.status(200).json({
      status: 200,
      data: messages
    });
  } catch (error) {
    console.error("Error getting session messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
