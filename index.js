require('dotenv').config();
const ElevenLabsClient = require('./lib/elevenlabs');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

async function main() {
    const apiKey = process.env.XI_API_KEY || process.argv[2];
    const agentIdsRaw = process.env.AGENT_IDS || process.argv[3];

    if (!apiKey || !agentIdsRaw) {
        console.error('Usage: node index.js <API_KEY> <AGENT_IDS_COMMAS_SEPARATED> or set XI_API_KEY and AGENT_IDS in .env');
        process.exit(1);
    }

    const agentIds = agentIdsRaw.split(',').map(id => id.trim());
    const client = new ElevenLabsClient(apiKey);
    let allConversations = [];

    console.log(`Starting data extraction for ${agentIds.length} agents...`);

    try {
        for (const agentId of agentIds) {
            console.log(`\n--- Agent: ${agentId} ---`);
            let cursor = null;
            let hasMore = true;
            let agentConvCount = 0;

            while (hasMore) {
                console.log(`Fetching conversations for ${agentId}... ${cursor ? '(next page)' : ''}`);
                const data = await client.getConversations(agentId, cursor);

                if (data.conversations && data.conversations.length > 0) {
                    for (const conv of data.conversations) {
                        console.log(`Fetching details for conversation: ${conv.conversation_id}`);
                        const details = await client.getConversationDetails(conv.conversation_id);

                        // Extract transcription
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
                        agentConvCount++;
                    }
                }

                cursor = data.next_cursor;
                hasMore = !!cursor;
            }
            console.log(`Done with agent ${agentId}. Extracted ${agentConvCount} conversations.`);
        }

        console.log(`\nAll done! Total extracted: ${allConversations.length} conversations across all agents.`);

        // Ensure output directory exists
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Save as JSON
        const jsonPath = path.join(outputDir, 'conversations.json');
        fs.writeFileSync(jsonPath, JSON.stringify(allConversations, null, 2));
        console.log(`Saved JSON to: ${jsonPath}`);

        // Save as CSV
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(allConversations);
        const csvPath = path.join(outputDir, 'conversations.csv');
        fs.writeFileSync(csvPath, csv);
        console.log(`Saved CSV to: ${csvPath}`);

    } catch (error) {
        console.error('An error occurred:', error.response ? error.response.data : error.message);
    }
}

main();
