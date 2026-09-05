const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  onShown: (callback) => ipcRenderer.on('overlay-shown', callback),

  // screenshot
  makeScreenshot: () => ipcRenderer.send("make-screenshot"),
  onScreenshotCapture: callback => ipcRenderer.on("screenshot-capture", callback),

  sendChatMessage: (text) => ipcRenderer.invoke('ai-chat', text)
});



