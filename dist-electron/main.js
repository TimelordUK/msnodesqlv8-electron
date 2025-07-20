import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js")
    }
  });
  mainWindow.loadFile("index.html");
  if (process.env.NODE_ENV === "development" || process.argv.includes("--dev")) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      mainWindow.webContents.toggleDevTools();
    }
    if (input.key === "F12") {
      mainWindow.webContents.toggleDevTools();
    }
  });
  mainWindow.webContents.once("dom-ready", () => {
    console.log("Main window DOM ready");
    mainWindow.webContents.executeJavaScript(`
      console.log('DevTools available - Press F12 or Ctrl+Shift+I to open');
      console.log('Application starting...');
    `);
  });
  return mainWindow;
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
