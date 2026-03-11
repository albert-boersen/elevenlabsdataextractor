const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Extractor = require('./lib/extractor');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity in this tool, but usually true with preload
        }
    });

    win.loadFile('index.html');
    // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) return null;
    return filePaths[0];
});

ipcMain.handle('start-extraction', async (event, { apiKey, agentIds, startDate, endDate, outputDir }) => {
    const extractor = new Extractor(apiKey, (progress) => {
        event.sender.send('progress-update', progress);
    });

    const ids = agentIds.split(',').map(id => id.trim()).filter(id => id);

    const toUnix = (dateStr) => {
        if (!dateStr) return null;
        const ms = Date.parse(dateStr);
        return isNaN(ms) ? null : Math.floor(ms / 1000);
    };

    try {
        const result = await extractor.run(ids, toUnix(startDate), toUnix(endDate), outputDir);
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
