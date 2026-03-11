const ElevenLabsClient = require('./elevenlabs');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

class Extractor {
    constructor(apiKey, onProgress = () => { }) {
        this.client = new ElevenLabsClient(apiKey);
        this.onProgress = onProgress;
    }

    async run(agentIds, startAfter = null, startBefore = null, outputDir) {
        let allConversations = [];
        let totalProcessed = 0;

        for (const agentId of agentIds) {
            this.onProgress({ status: `Starting ${agentId}`, processed: totalProcessed });
            let cursor = null;
            let hasMore = true;

            while (hasMore) {
                const data = await this.client.getConversations(agentId, cursor, startAfter, startBefore);

                if (data.conversations && data.conversations.length > 0) {
                    for (const conv of data.conversations) {
                        const details = await this.client.getConversationDetails(conv.conversation_id);

                        const transcript = details.transcript.map(item => {
                            return `${item.role.toUpperCase()}: ${item.message}`;
                        }).join('\n');

                        allConversations.push({
                            conversation_id: details.conversation_id,
                            agent_id: details.agent_id,
                            start_time_unix: details.start_time_unix,
                            duration_seconds: details.duration_seconds,
                            call_successful: details.call_successful,
                            transcript: transcript,
                            message_count: details.transcript.length
                        });
                        totalProcessed++;
                        this.onProgress({ status: `Processing ${details.conversation_id}`, processed: totalProcessed });
                    }
                }

                cursor = data.next_cursor;
                hasMore = !!cursor;
            }
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const jsonPath = path.join(outputDir, 'conversations.json');
        fs.writeFileSync(jsonPath, JSON.stringify(allConversations, null, 2));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(allConversations);
        const csvPath = path.join(outputDir, 'conversations.csv');
        fs.writeFileSync(csvPath, csv);

        return {
            count: allConversations.length,
            jsonPath,
            csvPath
        };
    }
}

module.exports = Extractor;
