const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  onShown: (callback) => ipcRenderer.on('overlay-shown', callback)
});

