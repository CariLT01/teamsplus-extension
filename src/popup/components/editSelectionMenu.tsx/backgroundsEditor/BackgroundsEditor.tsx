import clsx from "clsx";
import { useCurrentDataStore } from "../../../store/CurrentDataStore";
import { useNavigationStore } from "../../../store/NavigationStore";
import { ToggleSwitch } from "../../ToggleSwitch";
import { Seperator } from "../../Seperator";
import { dataManagementService } from "../../../services/DataManagementService";

export function BackgroundsEditorPage() {

    const location = useNavigationStore(state => state.location);
    const data = useCurrentDataStore(state => state.currentData);

    if (location !== "Theme Settings/Custom Background") return null;

    const sectionClasses = clsx(
        "w-full flex items-center px-2 py-2 justify-between border-b border-black/10"
    );
    const inputClasses = clsx(
        "w-[40vw] px-2 py-1 h-[85%] rounded-md border border-black/35 focus:outline-none focus:border-black/50 transition-colors duration-300 font-mono"
    )


    /* Event handlers */

    const onFBEChanged = (v: boolean) => {
        dataManagementService.dataManager.currentData.backgrounds["fullBackgroundExperience"] = v ? "true" : "false";
        dataManagementService.dataUpdated();
    }

    const onURLChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        dataManagementService.dataManager.currentData.backgrounds["channelAndChatBackground"] = e.target.value;
        dataManagementService.dataUpdated();
    }

    const onInterfaceOpacityChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        dataManagementService.dataManager.currentData.backgrounds["interfaceOpacity"] = e.target.value;
        dataManagementService.dataUpdated();
    }

    const onBackdropFilterChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        dataManagementService.dataManager.currentData.backgrounds["backdropFilter"] = e.target.value;
        dataManagementService.dataUpdated();
    }

    return <div className="w-full flex flex-col items-center px-2">
        {/* FBE Switch */}
        <div className="w-full flex items-center px-2 py-1 justify-between">
            <span className="text-base">Full Background Experience</span>
            <ToggleSwitch name="fbe_toggle" value={data.backgrounds["fullBackgroundExperience"] === "true"} onClick={onFBEChanged}></ToggleSwitch>
        </div>

        {/* Seperator */}
        <Seperator>Background Settings</Seperator>

        <div className="w-full flex flex-col items-center">
            <div className={sectionClasses}>
                <span className="text-base">Background Source</span>
                <input defaultValue={data.backgrounds["channelAndChatBackground"]} type="text" className={inputClasses} onBlur={onURLChanged}></input>
            </div>
            <div className={sectionClasses}>
                <span  className="text-base">Interface Opacity</span>
                <input defaultValue={data.backgrounds["interfaceOpacity"]} type="number" className={inputClasses} onBlur={onInterfaceOpacityChanged}></input>
            </div>
            <div className={sectionClasses}>
                <span className="text-base">Backdrop Filter</span>
                <input defaultValue={data.backgrounds["backdropFilter"]} type="text" className={inputClasses} onBlur={onBackdropFilterChanged}></input>
            </div>
        </div>

    </div>
}