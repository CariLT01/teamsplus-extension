import { useEffect, useState } from "react";

export function UpdateAvailableNotice() {
    const [text, setText] = useState("Checking for update...");

    useEffect(() => {

        const version: string = chrome.runtime.getManifest().version;
        const prefixedVersion: string = "v" + version;

        fetch(
            "https://api.github.com/repos/CariLT01/teamsplus-extension/releases/latest"
        )
            .then((response) => response.json())
            .then((data) => {
                const tagName: string = data.tag_name;
                if (tagName && tagName != prefixedVersion) {
                    setText(
                        "Update available: " + prefixedVersion + "→" + tagName);
                } else if (tagName == prefixedVersion) {
                    setText("")
                }
            })
            .catch((error) => {
                console.error("Failed to check for updates: ", error);
                setText("Failed to check for updates");
            });
    }, []);

    return ((text !== "") ? <div className="w-full px-2 py-1 bg-black/1 border border-black/10 rounded-md flex gap-4 animate-fadeIn">
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#1f1f1f"
                >
                    <path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
                </svg>
            </div>
            <span className="text-base font-bold">{text}</span>
        </div> : null)
     
}
