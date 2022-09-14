"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
const path = require("path");
const fs = require("fs");
const isDevelopment = process.env.NODE_ENV !== "production";
declare const __static: string;

let timelineWin: any;

const openJson = async () => {
  return JSON.parse(fs.readFileSync(__static + "/json/timeline.json", "UTF-8"));
};

const saveJson = async (event: object, text: string) => {
  fs.writeFileSync(__static + "/json/timeline.json", text);
};

const changeTransparent = (event: object, value: number) => {
  if (timelineWin) {
    timelineWin.webContents.send("update-transparent", value);
  }
};

const changeContents = (event: object, id: number) => {
  if (timelineWin) {
    timelineWin.webContents.send("update-contents", id);
  }
};

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow(name: string, devPath: string, prodPath: string) {
  // Create the browser window.
  let window;

  if (name == "setting") {
    window = new BrowserWindow({
      width: 800,
      height: 600,
    });
  } else {
    window = new BrowserWindow({
      x: 200,
      y: 100,
      height: 600,
      width: 400,
      frame: false,
      resizable: true,
      transparent: true,
      webPreferences: {
        preload: path.join(__dirname, "preloadTimeline.js"),
      },
    });
    window.setAlwaysOnTop(true, "screen-saver");
  }

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await window.loadURL(
      (process.env.WEBPACK_DEV_SERVER_URL + devPath) as string
    );
    if (!process.env.IS_TEST) window.webContents.openDevTools();
  } else {
    window.loadURL(`app://./${prodPath}`);
  }

  return window;
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow("setting", "", "index.html");
    timelineWin = createWindow("timeline", "timeline", "timeline.html");
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e: any) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol("app");
  }
  createWindow("setting", "", "index.html");
  timelineWin = createWindow("timeline", "timeline", "timeline.html");

  ipcMain.handle("openJson", openJson);
  ipcMain.on("saveJson", saveJson);
  ipcMain.on("change-transparent", changeTransparent);
  ipcMain.on("change-contents", changeContents);
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
