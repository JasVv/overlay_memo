// アプリケーションの寿命の制御と、ネイティブなブラウザウインドウを作成するモジュール
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const openJson = async () => {
  return JSON.parse(fs.readFileSync("./json/content.json", "UTF-8"))
};

const changeTransparent = (event, value) => {
  if (overlayWindow) {
    overlayWindow.webContents.send('update-transparent', value)
  }
}

let settingWindow = null;
let overlayWindow = null;

const createWindow = () => {
  settingWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, './script/setting_preload.js')
    },
  });

  settingWindow.loadFile('setting.html');

  settingWindow.webContents.openDevTools()

  overlayWindow = new BrowserWindow({
    x: 200,
    y: 100,
    height: 600,
    width: 400,
    frame: false,
    resizable: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, './script/preload.js')
    },
  })

  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.loadFile('index.html');

  overlayWindow.webContents.openDevTools()
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("openJson", openJson);
  ipcMain.on('change-transparent', changeTransparent);

  app.on('activate', () => {
    // macOS では、Dock アイコンのクリック時に他に開いているウインドウがない
    // 場合、アプリのウインドウを再作成するのが一般的です。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
})

// macOS を除き、全ウインドウが閉じられたときに終了します。 ユーザーが
// Cmd + Q で明示的に終了するまで、アプリケーションとそのメニューバーを
// アクティブにするのが一般的です。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});
