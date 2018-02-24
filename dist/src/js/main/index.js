"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.app.on("ready", () => {
    const window = new electron_1.BrowserWindow({
        width: 600,
        height: 400,
        backgroundColor: '#23262F'
    });
    window.loadURL(`file://${__dirname}/../../index.html`);
    window.maximize();
    window.webContents.openDevTools();
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: 'ReactIDE',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    accelerator: 'CommandOrControl+O',
                    click: (item, browserWindow) => {
                        browserWindow.webContents.send("open");
                    }
                },
                {
                    label: 'Save',
                    accelerator: 'CommandOrControl+S',
                    click: (item, browserWindow) => {
                        browserWindow.webContents.send("save");
                    }
                },
                {
                    label: 'Close',
                    accelerator: 'CommandOrControl+W',
                    click: (item, browserWindow) => {
                        browserWindow.webContents.send("close");
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Open Command Palette',
                    accelerator: 'CommandOrControl+Shift+P',
                    click: () => {
                        window.webContents.send('commandPalette');
                    }
                }
            ]
        },
        {
            label: 'Go',
            submenu: [
                {
                    label: 'Go to File',
                    accelerator: 'CommandOrControl+P',
                    click: () => {
                        window.webContents.send('goToFile');
                    }
                }
            ]
        },
        {
            label: 'Developer',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CommandOrControl+R',
                    click: () => {
                        window.reload();
                    }
                }
            ]
        }
    ]);
    electron_1.Menu.setApplicationMenu(menu);
    const ctxMenu = new electron_1.Menu();
    ctxMenu.append(new electron_1.MenuItem({ role: "copy" }));
    ctxMenu.append(new electron_1.MenuItem({ role: "cut" }));
    ctxMenu.append(new electron_1.MenuItem({ role: "paste" }));
    ctxMenu.append(new electron_1.MenuItem({ role: "selectall" }));
    window.webContents.on("context-menu", function (e, params) {
        ctxMenu.popup(window);
    });
});
