import { useRef } from "react";
import { openContextMenu } from "../../store/ContextMenuStore";
import { useNavigationStore } from "../../store/NavigationStore";
import { useThemesListStore } from "../../store/ThemesListStore";
import { Button } from "../Button";
import { EmptyListNotice } from "./EmptyListNotice";
import { ThemeCard } from "./themeCard/ThemeCard";
import { dataManagementService } from "../../services/DataManagementService";
import { createInputDialog } from "../../store/InputDialogStore";
import { UpdateAvailableNotice } from "./UpdateAvailableNotice";

export function ThemeList() {
    const location = useNavigationStore((state) => state.location);
    const setLocation = useNavigationStore((state) => state.setLocation);
    const themes = useThemesListStore((state) => state.themes);

    const addThemeRef = useRef<HTMLButtonElement>(null);

    if (location != "") return null;


    const editSettingsOnClick = () => {
        setLocation("Theme Settings");
    }

    const exportThemeClicked =  () => {
        createInputDialog("Enter theme name", async (v: string) => {

            if (dataManagementService.dataManager.currentThemes[v] != null) {
                alert("Theme with this name already exists! Please choose a different name");
                return;
            }

            const themeData = await dataManagementService.themeManager.p_generateThemeData(v);

            dataManagementService.dataManager.currentThemes[v] = themeData;
            dataManagementService.themesUpdated();

        })
    }

    const importThemeClicked = () => {
        createInputDialog("Paste theme data", async (v: string) => {

            try {
                const themeData = dataManagementService.themeManager.p_isThemeValid(v);
                if (themeData == undefined) {
                    throw new Error("Invalid theme");
                }

                if (dataManagementService.dataManager.currentThemes[themeData.name] != null) {
                    throw new Error("Theme with the same name already exists! Please delete the other theme");
                }

                dataManagementService.themeManager.addTheme(themeData.name, v);
                dataManagementService.themesUpdated();
            } catch (err) {
                console.error("An error occured: ", err);
                alert("An error occurred: " + err);
            }


        })
    }

    const addThemeOnClick = () => {
        openContextMenu(
            [
                {
                    text: "Export current settings", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-480ZM202-65l-56-57 118-118h-90v-80h226v226h-80v-89L202-65Zm278-15v-80h240v-440H520v-200H240v400h-80v-400q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H480Z" /></svg>,
                    callback: exportThemeClicked
                },
                {
                    text: "Import theme", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M704-240 320-624v344h-80v-480h480v80H376l384 384-56 56Z"/></svg>,
                    callback: importThemeClicked
                }
            ],
            addThemeRef.current as HTMLElement
            
        )
    }

    return (
        <div className="w-full flex gap-4 px-4 py-2 flex-col items-center">
            <UpdateAvailableNotice></UpdateAvailableNotice>
            {Object.keys(themes).length > 0 ? Object.entries(themes).map(([themeName, themeData]) => {
                return (
                    <ThemeCard key={themeName} themeName={themeName} themeData={themeData}></ThemeCard>
                );
            }) : <EmptyListNotice></EmptyListNotice>}

            <Button
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                    >
                        <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                    </svg>
                }
                isSecondary={true}
                ref={addThemeRef}
                onClick={addThemeOnClick}
            >
                Add theme
            </Button>
            <Button
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#ffffff"
                    >
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                    </svg>
                }
                isSecondary={false}
                onClick={editSettingsOnClick}
                
            >
                Edit settings
            </Button>
        </div>
    );
}
