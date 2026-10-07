const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  onShown: (callback) => ipcRenderer.on('overlay-shown', callback),

  // screenshot
  makeScreenshot: () => ipcRenderer.send("make-screenshot"),
  onScreenshotCapture: callback => ipcRenderer.on("screenshot-capture", (event, data) => callback(data)),

  // chat
  newChat: () => ipcRenderer.send("new-chat"),
  sendMessageToAI: data => ipcRenderer.send("send-message-to-ai", data),
  onReplyFromAI: callback => ipcRenderer.on("reply-from-ai", (event, data) => callback(data)),
  
  //onReplyFromAI: callback => ipcRenderer.on("reply-from-ai", (event, data) => callback(data)),
  onReplyChunk: callback => ipcRenderer.on("reply-chunk", (event, data) => callback(data)),
  onReplyEnd: callback => ipcRenderer.on("reply-end", (event, data) => callback(data)),

  // AI panel
  toggleAiPanel: pos => ipcRenderer.send("toggle-ai-panel", pos),
  aiPanelMove: pos => ipcRenderer.send("ai-panel-move", pos),
  aiPanelClose: () => ipcRenderer.send("ai-panel-close"),
  aiPanelReady: () => ipcRenderer.send("ai-panel-ready"),
  onAiScene: callback => ipcRenderer.on("ai-scene", (event, data) => callback(data)),
  getDesktopSourceId: () => ipcRenderer.invoke("get-desktop-source-id"),
  capturePanelScreenshot: () => ipcRenderer.send("ai-panel-screenshot")
});



