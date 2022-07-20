const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  // Renderer -> Main (methods)
  chooseFile: () => ipcRenderer.send("choose-file"),
  chooseFolder: () => ipcRenderer.send("choose-folder"),
  uploadedFile: (file) => ipcRenderer.send("uploaded-file", file),
  killChild: () => ipcRenderer.send("kill-child"),
  openResult: () => ipcRenderer.send("open-result"),
  convert: (format, outputFolder) =>
    ipcRenderer.send("convert", { format, outputFolder }),
  // Main -> Renderer (event listeners)
  onCancelChooseFile: (callback) => ipcRenderer.on("cancel-choose", callback),
  onFileChosen: (callback) => ipcRenderer.on("file-chosen", callback),
  onFolderChosen: (callback) => ipcRenderer.on("folder-chosen", callback),
  onInvalidFile: (callback) => ipcRenderer.on("invalid-file", callback),
  onStdOut: (callback) => ipcRenderer.on("stdout", callback),
  onStdErr: (callback) => ipcRenderer.on("stderr", callback),
  onFinish: (callback) => ipcRenderer.on("finish", callback),
});
