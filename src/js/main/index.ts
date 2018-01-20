import {app, BrowserWindow} from 'electron';

app.on('ready', () => {
    const window = new BrowserWindow({
        width: 600,
        height: 400
    });
    window.loadURL(`file://${__dirname}/../../index.html`);
    window.maximize();
});