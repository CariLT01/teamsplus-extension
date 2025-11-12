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
import { LoadingScreen } from "./runtime/loadingScreen";
import { AppsMenuManager } from "./ui/appsMenuManager";
import { ImageLoadingOptimizer } from "./runtime/imageLoadingOptimizer";

// Important objects

const appsMenuManager = new AppsMenuManager();
const dataManager = new DataManager();
const twemojiRuntime = new TwemojiRuntime(dataManager);
const stylesRuntime = new RuntimeStyles(dataManager);
const realtimeUpdatesRuntime = new RealtimeUpdatesManager(dataManager, stylesRuntime);
const loadingScreenRuntime = new LoadingScreen();
const imageLoadingOptimizer = new ImageLoadingOptimizer();
if (window.self === window.top) { // Don't initialize in iframes!
    const themesShopHandler = new ThemesShopHandler(new ThemeManager(dataManager), appsMenuManager);
    const gamblingGame = new GamblingGame();
    const encryptionProvider =  new EncryptionProvider(new AuthProvider());
    const snakeGame = new SnakeGame();
}


/////// Utility functions ////////




//////// On window load functions //////////
async function onWindowLoad() {
    console.log("window loaded, wait for main");

    imageLoadingOptimizer.onLoad();

    loadingScreenRuntime.startMutationObserver();

    if (window.self !== window.top) {
        throw new Error("Reject loading in iframe, feature not stable");
    }

    if (window.self === window.top) {
        await waitForElement('[data-tid="app-layout-area--main"]');
    } else {
        console.log("Skip wait in iframe");
    }
    
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