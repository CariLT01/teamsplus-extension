import { DataManager } from "../dataManagement";
import { GROUP_DESCRIPTIONS } from "../shared";

import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/classic.min.css'

function formatString(str: string) {
    // Remove leading hyphens
    let s = str.replace(/^-+/, '');
    // Split camelCase and handle numbers by adding spaces
    s = s
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
      .replace(/([A-Za-z])(\d)/g, '$1 $2') // Letter followed by number
      .replace(/(\d)([A-Za-z])/g, '$1 $2'); // Number followed by letter
    // Split into parts and join with spaces
    const parts = s.split(/\s+/);
    // Lowercase all parts and join with spaces
    const result = parts.join(' ').toLowerCase();
    // Capitalize the first letter of the resulting string
    return result.charAt(0).toUpperCase() + result.slice(1);
  }



export class ColorInputsManager {
    dataManager: InstanceType<typeof DataManager>;

    constructor(dataManager: InstanceType<typeof DataManager>) {
        this.dataManager = dataManager;
    }

    p_createColorInputs(el: HTMLDivElement) {
        const variableDescriptionBox: HTMLDivElement = document.querySelector("#variable-description") as HTMLDivElement;
        el.innerHTML = ""; // clear html
        console.error(this.dataManager.currentColors);
        for (const property in this.dataManager.currentColors) {
            const newDiv = document.createElement("div");

            const label = document.createElement("label");

            label.addEventListener("mouseenter", function () {
                const rect = label.getBoundingClientRect();
                variableDescriptionBox.style.display = "block";
                const boxRect = window.getComputedStyle(variableDescriptionBox);
                console.log(boxRect.height);
                const s = document.querySelector("strong") as HTMLElement;
                const p = document.querySelector("p") as HTMLElement;
                s.textContent = property;
                p.textContent = GROUP_DESCRIPTIONS[property] || "No description"
                variableDescriptionBox.style.top = `${rect.top + parseFloat(boxRect.height) / 2}px`;
                variableDescriptionBox.style.left = `${rect.left}px`;
                label.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
            });
            label.addEventListener("mouseleave", function () {
                label.style.backgroundColor = "transparent";
                variableDescriptionBox.style.display = "none";
            })

            const colorBtnParent = document.createElement("div");
            colorBtnParent.classList.add("choose-color-btn-parent");

            const colorBtn = document.createElement("button");
            colorBtn.classList.add("choose-color-btn");
            colorBtn.style.background = this.dataManager.currentColors[property];

            colorBtnParent.appendChild(colorBtn);

            //console.error("Property: " + "#" + property);
            newDiv.appendChild(label);
            newDiv.appendChild(colorBtnParent);

            let colorInput: HTMLDivElement | null = null;


            colorInput = document.createElement("div");
            newDiv.classList.add("color-input");

            newDiv.appendChild(colorInput);
            colorInput.style.backgroundColor = this.dataManager.currentColors[property];
            let innerColorInput = document.createElement("div");
            colorInput.appendChild(innerColorInput);
            innerColorInput.setAttribute("id", property);


            setTimeout(() => {

                const pickr = Pickr.create({
                    el: colorBtn,  // The element where the color picker will be initialized
                    useAsButton: true,
                    theme: 'classic',     // Choose theme (classic, monolith, or nano)
                    swatches: ['#000', '#fff', '#ff0000', '#00ff00', '#0000ff'], // Color swatches
                    default: this.dataManager.currentColors[property],   // Default color
                    components: {
                        preview: true,       // Show color preview
                        opacity: true,       // Enable opacity slider
                        hue: true,           // Enable hue slider
                        interaction: {
                            hex: true,          // Enable hex color input
                            rgba: true,         // Enable rgba color input
                            hsla: true,         // Enable hsla color input
                            cmyk: true,         // Enable cmyk color input
                        },
                    },
                });


                pickr.on('change', (color: any) => {
                    console.log("Changed!");
                    colorBtn.style.background = color.toHEXA().toString();
                    this.dataManager.currentColors[property] = color.toHEXA().toString();
                    this.dataManager.saveColors();

                })
            }, 0); // or a small delay like 50ms if necessary
            //console.warn("Created for: ", property);
            el.appendChild(newDiv);

            console.warn(document.querySelector("#" + property));

            label.setAttribute("for", property);
            label.textContent = `${formatString(property)}`;
        }


    }



    p_createClassColorInputs(el: HTMLDivElement) {
        const variableDescriptionBox: HTMLDivElement = document.querySelector("#variable-description") as HTMLDivElement;
        el.innerHTML = ""; // clear html
        console.error(this.dataManager.currentClassesColors);
        for (const property in this.dataManager.currentClassesColors) {
            const newDiv = document.createElement("div");
            const label = document.createElement("label");

            label.addEventListener("mouseenter", function () {
                const rect = label.getBoundingClientRect();
                variableDescriptionBox.style.display = "block";
                const boxRect = window.getComputedStyle(variableDescriptionBox);
                console.log(boxRect.height);
                const s = document.querySelector("strong") as HTMLElement;
                const p = document.querySelector("p") as HTMLElement;
                s.textContent = property;
                p.textContent = GROUP_DESCRIPTIONS[property] || "No description"
                variableDescriptionBox.style.top = `${rect.top + parseFloat(boxRect.height) / 2}px`;
                variableDescriptionBox.style.left = `${rect.left}px`;
                label.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
            });
            label.addEventListener("mouseleave", function () {
                label.style.backgroundColor = "transparent";
                variableDescriptionBox.style.display = "none";
            })

            const colorBtnParent = document.createElement("div");
            colorBtnParent.classList.add("choose-color-btn-parent");

            const colorBtn = document.createElement("button");
            colorBtn.classList.add("choose-color-btn");
            colorBtn.style.background = this.dataManager.currentClassesColors[property];
            colorBtnParent.appendChild(colorBtn);

            //console.error("Property: " + "#" + property);
            newDiv.appendChild(label);
            newDiv.appendChild(colorBtn);

            let colorInput: HTMLDivElement | null = null;
            colorInput = document.createElement("div");

            newDiv.appendChild(colorInput);
            newDiv.classList.add("color-input");
            colorInput.style.backgroundColor = this.dataManager.currentClassesColors[property];
            let innerColorInput = document.createElement("div");
            colorInput.appendChild(innerColorInput);
            innerColorInput.setAttribute("id", property);

            setTimeout(() => {

                const pickr = Pickr.create({
                    el: colorBtn,  // The element where the color picker will be initialized
                    useAsButton: true,
                    theme: 'classic',     // Choose theme (classic, monolith, or nano)
                    swatches: ['#000', '#fff', '#ff0000', '#00ff00', '#0000ff'], // Color swatches
                    default: this.dataManager.currentClassesColors[property],   // Default color
                    components: {
                        preview: true,
                        opacity: true,
                        hue: true,
                        interaction: {
                            hex: true,
                            rgba: true,
                            hsla: true,
                            cmyk: true,
                        },
                    },
                });


                pickr.on('change', (color: any) => {
                    console.log("Changed! to: ", color.toHEXA().toString());
                    colorBtn.style.background = color.toHEXA().toString();
                    this.dataManager.currentClassesColors[property] = color.toHEXA().toString();
                    this.dataManager.saveClassColors();

                })
            }, 0);
            el.appendChild(newDiv);


            console.warn(document.querySelector("#" + property));
            label.setAttribute("for", property);
            label.textContent = `class: ${property}`;
        }
    }



    p_createPixelValues(el: HTMLDivElement) {
        for (const property in this.dataManager.currentPixelValues) {
            const newDiv = document.createElement("div");
            const labelElement = document.createElement("label");
            labelElement.textContent = formatString(property);
            labelElement.setAttribute("for", property);

            newDiv.appendChild(labelElement);
            newDiv.classList.add("value-input");

            const inputElement = document.createElement("input");
            inputElement.setAttribute("id", property);
            inputElement.value = this.dataManager.currentPixelValues[property];

            inputElement.addEventListener("input", () => {
                console.log("CHange detected!");

                this.dataManager.currentPixelValues[property] = inputElement.value;
                this.dataManager.savePixelValues();
            })

            newDiv.appendChild(inputElement);
            el.appendChild(newDiv);
        }

    }
}