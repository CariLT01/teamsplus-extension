import { useRef } from "react";
import { openContextMenu } from "../../../store/ContextMenuStore";
import { Button } from "../../Button";
import { TransparentButton } from "../../TransparentButton";
import { dataManagementService } from "../../../services/DataManagementService";

interface Props {
    themeName: string;
    themeData: string;
}

export function ThemeCard(props: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const onDeleteClicked = () => {
        try {
            const confirmatoin = confirm(
                "Are you sure you want to delete this theme?"
            );
            if (!confirmatoin) return;

            delete dataManagementService.dataManager.currentThemes[
                props.themeName
            ];
            dataManagementService.themesUpdated();
        } catch (e) {
            console.error("Error: ", e);
            alert("An error occurred. Please check the console for more info");
        }
    };

    const onExportClicked = async () => {
        try {
            const data =
                dataManagementService.dataManager.currentThemes[
                    props.themeName
                ];
            if (data == null) {
                throw new Error("Theme not found");
            }

            await navigator.clipboard.writeText(data);
            alert("Copied data to clipboard");
        } catch (err) {
            alert("An error occured. Please check console for more info.");
            console.error(err);
        }
    };

    const onTripleDotsClicked = () => {
        openContextMenu(
            [
                {
                    text: "Delete",
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#1f1f1f"
                        >
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                        </svg>
                    ),
                    callback: onDeleteClicked,
                },
                {
                    text: "Export",
                    icon: (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#1f1f1f"
                        >
                            <path d="M480-480ZM202-65l-56-57 118-118h-90v-80h226v226h-80v-89L202-65Zm278-15v-80h240v-440H520v-200H240v400h-80v-400q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H480Z" />
                        </svg>
                    ),
                    callback: onExportClicked,
                },
            ],
            buttonRef.current as HTMLButtonElement
        );
    };

    const onApplyButtonClicked = async () => {
        try {
            const confirmation = confirm(
                "Are you sure you want to apply this theme? This will replace all current settings."
            );
            if (!confirmation) return;

            const themeData =
                dataManagementService.dataManager.currentThemes[
                    props.themeName
                ];
            if (themeData == null) {
                throw new Error("Theme not found");
            }

            dataManagementService.themeManager.applyTheme(props.themeName);

            // Run data repair by saving and reloading
            await dataManagementService.dataManager.saveData();
            console.log("Fixing data...");
            await dataManagementService.dataManager.loadData();

            // Call dataUpdated to notify React components
            console.log("Notify service");
            dataManagementService.dataUpdated();

            alert("Applied theme");
        } catch (err) {
            console.error(err);
            alert("An error occurred. Check console for more info");
        }
    };

    return (
        <div className="px-4 py-4 border border-black/10 rounded-md w-full">
            <div>
                <div className="flex items-center gap-4 justify-between">
                    <span className="text-2xl font-bold truncate">
                        {props.themeName}
                    </span>

                    <TransparentButton
                        onClick={onTripleDotsClicked}
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#1f1f1f"
                            >
                                <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                            </svg>
                        }
                        ref={buttonRef}
                    ></TransparentButton>
                </div>
                <span className="text-base text-black/50">
                    A TeamsPlus theme
                </span>
            </div>
            <div>
                <Button isSecondary={true} icon={null} smaller={true} onClick={onApplyButtonClicked}>
                    Apply
                </Button>
            </div>
        </div>
    );
}
