const { ipcRenderer } = require('electron');

const form = document.getElementById('extractor-form');
const browseBtn = document.getElementById('browse-btn');
const outputDirInput = document.getElementById('output-dir');
const disclaimerCheck = document.getElementById('disclaimer-check');
const startBtn = document.getElementById('start-btn');
const statusContainer = document.getElementById('status-container');
const statusText = document.getElementById('status-text');
const processedCount = document.getElementById('processed-count');
const progressIndicator = document.getElementById('progress-indicator');
const resultMessage = document.getElementById('result-message');

disclaimerCheck.addEventListener('change', () => {
    startBtn.disabled = !disclaimerCheck.checked;
});

browseBtn.addEventListener('click', async () => {
    const path = await ipcRenderer.invoke('select-directory');
    if (path) {
        outputDirInput.value = path;
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const apiKey = document.getElementById('api-key').value;
    const agentIds = document.getElementById('agent-ids').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const outputDir = outputDirInput.value;

    if (!apiKey || !agentIds || !outputDir) {
        showError('Please fill in all required fields.');
        return;
    }

    // Reset UI
    statusContainer.classList.remove('hidden');
    resultMessage.classList.add('hidden');
    statusText.innerText = 'Initializing...';
    processedCount.innerText = '0 extracted';
    progressIndicator.style.width = '0%';
    startBtn.disabled = true;

    try {
        const response = await ipcRenderer.invoke('start-extraction', {
            apiKey, agentIds, startDate, endDate, outputDir
        });

        if (response.success) {
            statusText.innerText = 'Extraction Complete!';
            progressIndicator.style.width = '100%';
            showSuccess(`Successfully extracted ${response.result.count} conversations! Files saved in selected folder.`);
        } else {
            showError(`Error: ${response.error}`);
        }
    } catch (err) {
        showError(`Unexpected error: ${err.message}`);
    } finally {
        startBtn.disabled = false;
    }
});

ipcRenderer.on('progress-update', (event, progress) => {
    statusText.innerText = progress.status;
    processedCount.innerText = `${progress.processed} extracted`;
    // We don't have a total count easily, so we just animate it or show work is being done
    progressIndicator.style.width = '50%'; // Simple placeholder for "active"
});

function showSuccess(msg) {
    resultMessage.innerText = msg;
    resultMessage.className = 'result-message success';
    resultMessage.classList.remove('hidden');
}

function showError(msg) {
    resultMessage.innerText = msg;
    resultMessage.className = 'result-message error';
    resultMessage.classList.remove('hidden');
    statusContainer.classList.add('hidden');
}
