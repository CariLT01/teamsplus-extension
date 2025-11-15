
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import "./../styles/tailwind.css"
import "./App.css"



function onLoad() {
    const container = document.querySelector("#reactRoot") as HTMLDivElement;

    const root = createRoot(container);
    root.render(<App/>)

}

window.onload = onLoad;