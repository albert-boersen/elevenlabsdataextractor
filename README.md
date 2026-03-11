# ElevenLabs Conversation Data Extractor

This tool extracts transcripts and metadata for all conversations from a list of ElevenLabs Agents. The data is saved in both JSON and CSV formats (ready for Excel/Sheets).

## Features
- **Desktop App (NEW)**: Premium GUI for non-developers.
- **Multi-Agent Support**: Processes multiple Agent IDs sequentially.
- **Transcripts**: Extracts the full dialogue for every conversation.
- **Date Filters**: Filter conversations based on start and end dates.
- **Privacy First**: Sensitive data like API Keys are not stored locally.
- **Excel Ready**: Exports directly to a CSV file for analysis.

## Installation

1. Ensure [Node.js](https://nodejs.org/) is installed.
2. Clone or download this repository.
3. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

Open the `.env` file and provide the following details:

- `XI_API_KEY`: Your ElevenLabs API Key.
- `AGENT_IDS`: A comma-separated list of Agent IDs.
- `START_DATE`: (Optional) Only conversations starting after this date (e.g., `2024-03-01`).
- `END_DATE`: (Optional) Only conversations starting before this date.

## Usage

### 1. Desktop App (Recommended)
This is the easiest way to use the tool.

- **Development Mode**: Run the app in development mode:
  ```bash
  npm start
  ```
- **Building the Executable**: Generate a portable `.exe` for Windows:
  ```bash
  npm run build
  ```
  The resulting file will be in the `dist/` folder.

### 2. CLI Tool (Advanced)
You can still run the extraction via the command line:

```bash
node index.js
```

Or provide the API Key and Agent IDs directly:
```bash
node index.js <API_KEY> <AGENT_ID1,AGENT_ID2>
```

## Output

Results are saved in the `output/` directory:
- `conversations.json`: Full detailed data in JSON format.
- `conversations.csv`: Formatted for Excel/Google Sheets with columns for ID, Agent, Time, Duration, and Transcript.

---

Developed with ❤️ by **Albert Boursin**

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/albertboursin)
