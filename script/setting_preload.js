const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('myAppSetting', {
  openJson: async () => ipcRenderer.invoke("openJson"),
  changeTransparent: (value) => ipcRenderer.send('change-transparent', value),
  changeContents: (id) => ipcRenderer.send('change-contents', id),
});
