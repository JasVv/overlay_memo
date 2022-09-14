const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myApp", {
  openJson: async () => ipcRenderer.invoke("openJson"),
  updateTransparent: (callback) =>
    ipcRenderer.on("update-transparent", callback),
  updateContents: (id) => ipcRenderer.on("update-contents", id),
});
