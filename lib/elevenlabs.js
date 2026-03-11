const axios = require('axios');

class ElevenLabsClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.elevenlabs.io/v1/convai';
    }

    async getConversations(agentId, cursor = null) {
        const params = {
            agent_id: agentId,
            call_successful: 'success'
        };
        if (cursor) {
            params.cursor = cursor;
        }

        const response = await axios.get(`${this.baseUrl}/conversations`, {
            headers: { 'xi-api-key': this.apiKey },
            params
        });

        return response.data;
    }

    async getConversationDetails(conversationId) {
        const response = await axios.get(`${this.baseUrl}/conversations/${conversationId}`, {
            headers: { 'xi-api-key': this.apiKey }
        });
        return response.data;
    }
}

module.exports = ElevenLabsClient;
