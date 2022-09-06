const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('myAppSetting', {
  changeTransparent: (value) => ipcRenderer.send('change-transparent', value),
});