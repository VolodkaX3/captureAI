const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, nativeImage, Menu } = require('electron');
const path = require('path');

let overlayWindow = null;
let splashWindow = null;
let tray = null; // Переменная для tray

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winWidth = 514; // +64px боковая панель + 10px отступ
  const winHeight = 380;

  overlayWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: Math.round((width - winWidth) / 2),
    y: Math.round((height - winHeight) / 2) - 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlayWindow.loadFile(path.join(__dirname, 'renderer', 'overlay.html'));
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');


  overlayWindow.on('blur', () => {
    if (overlayWindow && !overlayWindow.webContents.isDevToolsOpened()) {
      overlayWindow.hide();
    }
  });
}

function toggleOverlay() {
  if (!overlayWindow) createOverlayWindow();
  if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  } else {
    overlayWindow.show();
    overlayWindow.focus();
    overlayWindow.webContents.send('overlay-shown');
  }
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 424,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    center: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'renderer', 'splash.html'));

  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    createOverlayWindow();
    overlayWindow.show();
  }, 3000);
}

app.whenReady().then(() => {
  createSplashWindow();

  const registered = globalShortcut.register('CommandOrControl+Shift+Space', toggleOverlay);
  if (!registered) {
    console.error('Hotkey registration failed — it may be taken by another app.');
  }

  const icon = nativeImage.createFromPath(path.join(__dirname, "img/MainlogoW.png"));
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => toggleOverlay()
    },
    {
      type: "separator"
    },
    {
      label: "Exit",
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(contextMenu);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault(); // keep running in the background so the hotkey keeps working
});

ipcMain.on('hide-overlay', () => {
  if (overlayWindow) overlayWindow.hide();
});
