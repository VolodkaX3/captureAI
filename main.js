const { GoogleGenAI, ThinkingLevel } = require('@google/genai');
const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, nativeImage, Menu } = require('electron');
const path = require('path');
const fs = require("fs");
const screenshot = require("screenshot-desktop");

let overlayWindow = null;
let splashWindow = null;
let tray = null; // Переменная для tray
let API_KEY;

let ai;
let history = [];
const models = [
  { name: "gemini-3.7-flash", thinkingLevel: ThinkingLevel.LOW },
  { name: "gemini-3.5-flash-lite", thinkingLevel: ThinkingLevel.MINIMAL }
];
const MAX_HISTORY_MESSAGES = 12;
//Мною было добавлено даполнительную ии модель что бы в случае не сработки первой, дублировалось на вторую.
//getResponse getResponseWithRetray

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
  // overlayWindow.webContents.openDevTools();


  overlayWindow.on('blur', () => {
    if (overlayWindow && !overlayWindow.webContents.isDevToolsOpened()) {
      overlayWindow.hide();
    }
  });
}

function toggleOverlay() {
  if (screenshotWin) updateScreenshotWinPosition();
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
  try {
    const apiKeyPath = path.join(__dirname, "api_key.txt");
    const file = fs.readFileSync(apiKeyPath, "utf-8");
    API_KEY = file.trim();
    console.log("Api key file successfully read!");
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log("AI initialization successfully")
  } catch (err) {
    console.error(`Error in reading api key file: ${err.message}`);
  }

  const registered = globalShortcut.register('CommandOrControl+Shift+Space', toggleOverlay);
  if (!registered) {
    console.error('Hotkey registration failed — it may be taken by another app.');
  }

  let icon = nativeImage.createFromPath(path.join(__dirname, "img/MainiconW.png"));
  icon = icon.resize({ width: 22, height: 22 });
  icon.setTemplateImage(false);
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


// screenshot
function updateScreenshotWinPosition() {
  const [x, y] = screenshotWin.getPosition();
  const [width, height] = screenshotWin.getSize();
  const data = {x, y, width, height};

  try {
    const filePath = path.join(app.getPath("userData"), "screenshotWindowSettings.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log("Screenshot window settings updated successfully!");
  } catch (err) {
    console.error(`Error in updating screenshot window settings: ${err.message}`);
  }
  
  workingImage = null;

  screenshotWin.destroy();
  screenshotWin = null;
}

async function desktopCapture() {
  try {
    const img = await screenshot({ format: "png" });
    const imgBase64 = img.toString("base64");
    const htmlDataUrl = `data:image/png;base64,${imgBase64}`;
    return {
      img,
      htmlDataUrl
    };
  } catch (err) {
    console.error(`Error in making screenshot: ${err.message}`);
  }
}

let screenshotWin;
let workingImage;
ipcMain.on("make-screenshot", () => {
  let screenshotWindowSettingsData = {};
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  try {
    const filePath = path.join(app.getPath("userData"), "screenshotWindowSettings.json");
    if (!fs.existsSync(filePath)) throw new Error("Screenshot window settings file doesn't exists");
    screenshotWindowSettingsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (screenshotWindowSettingsData.width > width) screenshotWindowSettingsData.width = null;
    if (screenshotWindowSettingsData.height > height) screenshotWindowSettingsData.height = null;
    if (screenshotWindowSettingsData.x > width) screenshotWindowSettingsData.x = null;
    if (screenshotWindowSettingsData.y > height) screenshotWindowSettingsData.y = null;
  } catch (err) {
    console.log(`Error in reading screenshot window file: ${err.message}`);
    screenshotWindowSettingsData = { width: null, height: null, x: null, y: null };
  }

  const winWidth = screenshotWindowSettingsData.width || width - 100;
  const winHeight = screenshotWindowSettingsData.height || height - 100;
  const x = screenshotWindowSettingsData.x || Math.round((width - winWidth) / 2);
  const y = screenshotWindowSettingsData.y || Math.round((height - winHeight) / 2);
  console.log(`width: ${winWidth}, height: ${winHeight}, x: ${x}, y: ${y}`);
  screenshotWin = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x,
    y,
    useContentSize: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })
  screenshotWin.setMenuBarVisibility(false);
  screenshotWin.loadFile("./renderer/screenshot_wrapper/index.html");
  // screenshotWin.webContents.openDevTools();

  screenshotWin.once("ready-to-show", async () => {
    overlayWindow.hide();
    overlayWindow.once("hide", async () => {
      const capture = await desktopCapture();
      workingImage = capture.img;
      screenshotWin.show();
      screenshotWin.webContents.send("screenshot-capture", capture.htmlDataUrl);
    })
  })

  screenshotWin.on("close", event => {
    updateScreenshotWinPosition();
    event.preventDefault();
  })
})
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
ipcMain.on("new-chat", () => {
  history = [];
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getResponse(userMessage, modelCfg, onChunk) {
  const userMsg = { role: "user", parts: [{ text: userMessage }] };
  const stream = await ai.models.generateContentStream({
    model: modelCfg.name,
    contents: [...history, userMsg],
    config: { thinkingConfig: { thinkingLevel: modelCfg.thinkingLevel } }
  });

  let reply = "";
  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      reply += text;
      onChunk(text);
    }
  }

  history.push(userMsg);
  history.push({ role: "model", parts: [{ text: reply }] });
  if (history.length > MAX_HISTORY_MESSAGES) {
    history = history.slice(-MAX_HISTORY_MESSAGES);
  }
  return reply;
}

async function getResponseWithRetray(maxAttemptsAI, data, onChunk) {
  let started = false;
  const emit = text => { started = true; onChunk(text); };

  for (const modelCfg of models) {
    for (let attempt = 1; attempt <= maxAttemptsAI; attempt++) {
      try {
        await getResponse(data, modelCfg, emit);
        return null;
      } catch (err) {
        console.warn(`${modelCfg.name}: error ${err.status}, attempt ${attempt} from ${maxAttemptsAI}`);
        if (started) return "\n\n…(connection lost)";
        if (err.status == 429) break;
        if (err.status != 500 && err.status != 503) return `Error ${err.status}`;
        await sleep(attempt * 500);
      }
    }
  }
  return "We have some problems with server, try again later...";
}

ipcMain.on("send-message-to-ai", async (event, data) => {
  const maxAttemptsAI = 2;
  const send = (channel, payload) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) overlayWindow.webContents.send(channel, payload);
  };
  const tail = await getResponseWithRetray(maxAttemptsAI, data, text => send("reply-chunk", text));
  send("reply-end", tail);
})
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!