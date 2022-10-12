"use strict";

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");
const store = new Store();

const isDevelopment = process.env.NODE_ENV !== "production";
declare const __static: string;

let timelineWin: BrowserWindow;
let settingWin: BrowserWindow;

const getInitTimeline = () => {
  return JSON.stringify({
    contents: [
      {
        id: 1,
        title: "Sample",
        beforeCount: 5,
        timeline: [
          {
            id: 1,
            time: "00:00",
            action: "START",
            memo: "",
          },
          {
            id: 2,
            time: "00:05",
            action: "ACTION1",
            memo: "",
          },
          {
            id: 3,
            time: "00:10",
            action: "ACTION2",
            memo: "",
          },
        ],
      },
    ],
  });
};

const openJson = async () => {
  const timeline = store.get("timeline") || getInitTimeline();
  return JSON.parse(timeline);
};

const saveJson = async (event: object, text: string) => {
  const timeline = store.set("timeline", text);
};

const importFile = async () => {
  const win: any = BrowserWindow.getFocusedWindow();

  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [
      {
        name: "Documents",
        extensions: ["json"],
      },
    ],
  });

  if (result.canceled) {
    return;
  }

  if (result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const textData = fs.readFileSync(filePath, "utf8");

    try {
      await saveJson({}, JSON.stringify(JSON.parse(textData), null, 4));

      if (timelineWin) {
        timelineWin.close();
      }

      if (settingWin) {
        settingWin.close();
      }

      createWindow("setting", "", "index.html");
      createWindow("timeline", "timeline", "timeline.html");
    } catch (e: any) {
      console.error("import failed", e.toString());
    }
  }
};

const exportFile = async () => {
  const win: any = BrowserWindow.getFocusedWindow();

  const result = await dialog.showSaveDialog(win, {
    filters: [
      {
        name: "Documents",
        extensions: ["json"],
      },
    ],
  });

  if (result.canceled) {
    return;
  }

  const timeline = store.get("timeline") || getInitTimeline();
  fs.writeFileSync(
    result.filePath,
    JSON.stringify(JSON.parse(timeline), null, 4)
  );
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

const isMac = process.platform === "darwin";

const template = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      isMac ? { role: "close" } : { role: "quit" },
      {
        label: "Import",
        click: () => {
          importFile();
        },
      },
      {
        label: "Export",
        click: () => {
          exportFile();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
];

const menu = Menu.buildFromTemplate(template as any);
Menu.setApplicationMenu(menu);

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
      webPreferences: {
        preload: path.join(__dirname, "preloadSetting.js"),
      },
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

  if (name == "setting") {
    window.on("close", () => {
      if (timelineWin) {
        timelineWin.close();
      }
    });
  }

  if (name == "timeline") {
    timelineWin = await window;
  }

  if (name == "setting") {
    settingWin = await window;
  }
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
    createWindow("timeline", "timeline", "timeline.html");
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
  createWindow("timeline", "timeline", "timeline.html");

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
