import { DataManager } from "../dataManagement";

export class TeamNameMappings {
    private dataManager: DataManager;

    constructor(dataManager: DataManager) {
        this.dataManager = dataManager;
    }

    private processTeamButton(b: HTMLButtonElement) {
        const teamNameRaw = b.getAttribute("aria-label");

        if (teamNameRaw == null) return;
        
        const teamName = teamNameRaw.trim();

        const span = b.querySelector("span");
        if (span == null) return;

        const storedName =
            this.dataManager.currentSettings["teamsNameMappings"][teamName];

        console.log("Current settings: ", this.dataManager.currentSettings);

        console.log("Stored name: ", storedName, " query: ", teamName);

        span.textContent = storedName != null ? storedName : teamName;

        // Add new span

        const buttonRename = document.createElement("span");
        buttonRename.classList.add("teamNameRename");

        buttonRename.textContent = "Rename...";

        b.appendChild(buttonRename);

        // Update button styles

        b.style.display = "flex !important";
        b.style.flexDirection = "column !important";
        b.style.justifyContent = "space-between !important";

        buttonRename.addEventListener("click", (e) => {
            try {
                e.stopImmediatePropagation();
                e.stopPropagation();

                const newName = prompt("Rename (leave empty to cancel):");
                if (newName == null || newName == "") return;

                this.dataManager.currentSettings["teamsNameMappings"][
                    teamName
                ] = newName;
                this.dataManager.saveSettings();

                alert("Renamed. Refresh to apply.");
            } catch (err) {
                console.error(err);

                alert("An error occurred. Check console for more info.")
            }
        });
    }

    private createMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    // Only care about elements
                    if (!(node instanceof HTMLElement)) continue;

                    // Case 1: The added node itself matches
                    if (node.matches('[data-testid="team-name"]')) {
                        this.processTeamButton(node as HTMLButtonElement);
                    }

                    // Case 2: The added node contains matching elements
                    const innerMatches = node.querySelectorAll(
                        '[data-testid="team-name"]'
                    );
                    innerMatches.forEach((el) => {
                        this.processTeamButton(el as HTMLButtonElement);
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    start() {
        this.createMutationObserver();
    }
}
