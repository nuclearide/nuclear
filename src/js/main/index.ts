import { app, BrowserWindow, Menu, MenuItem } from "electron";

app.on("ready", () => {
  const window = new BrowserWindow({
    width: 600,
    height: 400
  });
  window.loadURL(`file://${__dirname}/../../index.html`);
  window.maximize();
  window.webContents.openDevTools();

  const menu = Menu.buildFromTemplate([
    {
      label: 'ReactIDE',
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
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
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  const ctxMenu = new Menu();
  ctxMenu.append(new MenuItem({ role: "copy" }));
  ctxMenu.append(new MenuItem({ role: "cut" }));
  ctxMenu.append(new MenuItem({ role: "paste" }));
  ctxMenu.append(new MenuItem({ role: "selectall" }));
  window.webContents.on("context-menu", function (e, params) {
    ctxMenu.popup(window);
  });
});
