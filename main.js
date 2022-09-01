// アプリケーションの寿命の制御と、ネイティブなブラウザウインドウを作成するモジュール
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const createSettingWindow = () => {
  const win = new BrowserWindow({
    height: 600,
    width: 800,
    frame: true,
  });

  win.loadFile('setting.html');

  // デベロッパー ツールを開きます。
  // mainWindow.webContents.openDevTools()
};

const createWindow1 = () => {
  const win = new BrowserWindow({
    height: 300,
    width: 300,
    frame: false,
    resizable: true,
    transparent: true,
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.loadFile('index.html');
}

const createWindow2 = () => {
  const win = new BrowserWindow({
    height: 600,
    width: 800,
    frame: false,
    resizable: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  })

  win.setAlwaysOnTop(true, "screen-saver");
  win.loadFile('index2.html');

  // デベロッパー ツールを開きます。
  // win.webContents.openDevTools();
}

// このメソッドは、Electron の初期化が完了し、
// ブラウザウインドウの作成準備ができたときに呼ばれます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.whenReady().then(() => {
  // createSettingWindow()
  // createWindow1()
  createWindow2();

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

const openJson = async () => {
  return JSON.parse(fs.readFileSync("./json/content.json", "UTF-8"))
};

ipcMain.handle("openJson", openJson);
