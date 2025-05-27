
import { API_URL, ENDPOINTS, getApiUrl } from '../config/apiConfig';

class MessagingService {
  /**
   * Send a message from one user to another
   * @param {number} senderId - The ID of the sender
   * @param {number} receiverId - The ID of the receiver
   * @param {string} content - The message content
   * @returns {Promise} - Result of the API call
   */
  async sendMessage(senderId, receiverId, content) {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.SEND_MESSAGE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get conversation between two users
   * @param {number} userId1 - ID of the first user
   * @param {number} userId2 - ID of the second user
   * @returns {Promise} - Conversation data
   */
  async getConversation(userId1, userId2) {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.GET_CONVERSATION(userId1, userId2)));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for a user
   * @param {number} userId - ID of the user
   * @returns {Promise} - List of conversations
   */
  async listConversations(userId) {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.LIST_CONVERSATIONS(userId)));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to list conversations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing conversations:', error);
      throw error;
    }
  }
}

export default new MessagingService();
