/**
 * File: popup.js
 * 
 * Controls all of extension popup.
 *  
 *
 */

////////// Imports //////////

import { DataManager } from '../dataManagement';
import { ThemeManager } from './themes';
import { ButtonHandlers } from './buttons';
import { ColorInputsManager } from './colorInputs';
import { popupUI_init } from './popupUi';


const dataManager = new DataManager();
const themeManager = new ThemeManager(dataManager);
const buttonHandlers = new ButtonHandlers(dataManager, themeManager);
const colorInputs = new ColorInputsManager(dataManager);
//// Onload functions ////



async function p_postLoad() {

    popupUI_init();

    buttonHandlers.p_exportHandlers();
    buttonHandlers.importHandlers();
    await dataManager.loadColors();
    await dataManager.loadClassColors();
    await dataManager.loadPixelValues();
    await dataManager.loadThemes();

    ///// DELETE DATA HANDLER /////

    document.querySelector("#deldata")?.addEventListener("click", function() {
        const a = prompt("enter y/n");
        if (a == 'y') {
            chrome.storage.local.remove("colors");
            chrome.storage.local.remove("fonts");
            chrome.storage.local.remove("classColors");
            chrome.storage.local.remove("pixelValues");
            alert("deleted data");
        } else {
            alert("data not deleted");
        }

    })
    console.error("Loaded");

    ///// Documentation link /////
    
    const docsBtn = document.querySelector("#opendocs");
    if (docsBtn) {
        docsBtn.addEventListener("click", function() {
            chrome.runtime.openOptionsPage();
        })
    }

    ////// FONTS //////

    const fontsContainer1 = document.querySelector("#current-font-container") as HTMLDivElement;
    const fontsContainer2 = document.querySelector("#font-imports-container") as HTMLDivElement;

    // Fonts input
    const fontsInput = document.createElement("input");
    await dataManager.loadFonts();
    fontsInput.value = dataManager.currentFonts["fontFamily"];
    fontsInput.addEventListener("input", () => {
        console.log("Font changed");
        dataManager.currentFonts["fontFamily"] = fontsInput.value;
        dataManager.saveFonts();
    })
    fontsContainer1.appendChild(fontsInput);
    console.error(dataManager.currentFonts);


    // Font imports //
    const importsInput = document.createElement("textarea");
    importsInput.setAttribute("rows", "5");
    importsInput.setAttribute("placeholder", "Additional custom imports");
    importsInput.value = dataManager.currentFonts["imports"];
    importsInput.addEventListener("input", () => {
        console.log("Imports changed!");
        dataManager.currentFonts["imports"] = importsInput.value;
        dataManager.saveFonts();
    })
    fontsContainer2.appendChild(importsInput);
    // Twemoji support //
    const i = document.querySelector("#twemojiSupport") as HTMLInputElement;
    if (i) {
        i.checked = await dataManager.isTwemojiEnabled();
        i.addEventListener("input", function() {
            console.log("Save Twemoji state");
            chrome.storage.local.set({"twemoji": i.checked});
        })
    }


    // Color inputs //
    colorInputs.p_createColorInputs(document.querySelector("#css-variable-colors") as HTMLDivElement);
    colorInputs.p_createClassColorInputs(document.querySelector("#css-classes-colors") as HTMLDivElement);


    const pixelValuesDiv = document.createElement("div");
    colorInputs.p_createPixelValues(document.querySelector("#css-custom-values") as HTMLDivElement);
    document.body.appendChild(pixelValuesDiv);
    // Update theme //
    await themeManager.updateThemesList();

}

function p_onload() {
    setTimeout(p_postLoad, 250);
}

/// Trigger when window finishes loading ///
document.addEventListener("DOMContentLoaded", p_onload);

