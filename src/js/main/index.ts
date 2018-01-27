import { app, BrowserWindow, Menu, MenuItem } from "electron";

app.on("ready", () => {
  const window = new BrowserWindow({
    width: 600,
    height: 400
  });
  window.loadURL(`file://${__dirname}/../../index.html`);
  window.maximize();

  const ctxMenu = new Menu();
  ctxMenu.append(new MenuItem({ role: "copy" }));
  ctxMenu.append(new MenuItem({ role: "cut" }));
  ctxMenu.append(new MenuItem({ role: "paste" }));
  ctxMenu.append(new MenuItem({ role: "selectall" }));
  window.webContents.on("context-menu", function(e, params) {
    ctxMenu.popup(window);
  });
});
