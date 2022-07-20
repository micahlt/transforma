const path = require("path");
const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const convert = require("./converter.js");

let currentFile = {
  path: "",
  process: null,
  result: null,
};

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    // titleBarStyle: isDev ? "hidden" : "hidden",
    // titleBarOverlay: {
    //   color: "#000000",
    //   symbolColor: "#888888",
    // },
    backgroundColor: "#1c1c1c",
    frame: true,
  });

  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: "*", ...details.requestHeaders } });
    }
  );

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    delete details.responseHeaders["Access-Control-Allow-Origin"];
    delete details.responseHeaders["access-control-allow-origin"];
    callback({
      responseHeaders: {
        "Access-Control-Allow-Origin": ["*"],
        ...details.responseHeaders,
      },
    });
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return null;
  });

  ipcMain.on("choose-file", () => {
    dialog
      .showOpenDialog({
        title: "Select file to convert",
      })
      .then((res) => {
        if (res.canceled) {
          win.webContents.send("cancel-choose");
        } else {
          win.webContents.send("file-chosen");
          currentFile.path = res.filePaths[0];
        }
      });
  });

  ipcMain.on("choose-folder", () => {
    dialog
      .showOpenDialog({
        title: "Select output folder",
        properties: ["openDirectory"],
      })
      .then((res) => {
        if (res.canceled) {
          win.webContents.send("cancel-choose");
        } else {
          win.webContents.send("folder-chosen", res.filePaths[0]);
        }
      });
  });

  ipcMain.on("uploaded-file", (e, file) => {
    currentFile.path = file;
    win.webContents.send("file-chosen");
  });

  ipcMain.on("convert", (e, { format, outputFolder }) => {
    if (!outputFolder) {
      outputFolder = path.dirname(currentFile.path);
    }
    currentFile.result =
      path.join(
        outputFolder,
        path.basename(currentFile.path, path.extname(currentFile.path))
      ) +
      "-converted." +
      format;
    convert(
      currentFile.path,
      outputFolder,
      format,
      win.webContents,
      (command) => {
        currentFile.process = command;
      }
    );
  });

  ipcMain.on("kill-child", () => {
    currentFile.process.kill();
  });

  ipcMain.on("open-result", () => {
    shell.showItemInFolder(currentFile.result);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
