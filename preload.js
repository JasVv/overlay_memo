const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('myApp', {
  openJson: async () => ipcRenderer.invoke("openJson"),
});
