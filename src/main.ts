/**
 * File: main.ts
 * 
 * Applies styles during runtime.
 */

///////// IMPORTS //////////
import { DataManager } from "./dataManagement";
import { TwemojiRuntime } from "./runtime/twemoji";
import { RuntimeStyles } from "./runtime/styles";
import { RealtimeUpdatesManager } from "./runtime/realtimeUpdates";
import { waitForElement } from "./utils";
import { ThemesShopHandler } from "./api/themesShop";
import { ThemeManager } from "./popup/themes";
import { GamblingGame } from "./games/gamble";
import { EncryptionProvider } from "./api/encryptionProvider";
import { AuthProvider } from "./api/authorizationProvider";
import { SnakeGame } from "./games/snake";

// Important objects

const dataManager = new DataManager();
const twemojiRuntime = new TwemojiRuntime(dataManager);
const stylesRuntime = new RuntimeStyles(dataManager);
const realtimeUpdatesRuntime = new RealtimeUpdatesManager(dataManager, stylesRuntime);
const themesShopHandler = new ThemesShopHandler(new ThemeManager(dataManager));
const gamblingGame = new GamblingGame();
const encryptionProvider =  new EncryptionProvider(new AuthProvider());
const snakeGame = new SnakeGame();

/////// Utility functions ////////




//////// On window load functions //////////
async function onWindowLoad() {
    console.log("window loaded, wait for main");
    await waitForElement('[data-tid="app-layout-area--main"]');
    console.log("window found main");
    await dataManager.loadColors();
    await dataManager.loadClassColors();
    await dataManager.loadFonts();
    await dataManager.loadPixelValues();
    await dataManager.loadBackgrounds();
    stylesRuntime.applyFonts(null);
    console.log("Apply colors on win load");
    realtimeUpdatesRuntime.detectChange();
    twemojiRuntime.applyTwemoji();
    stylesRuntime.applyColors();
    stylesRuntime.applyBackgrounds();
}







// Detects when contents in storage changed. Used for live updates. //


/////// Init ////////
window.onload = onWindowLoad;
console.log("Hello");