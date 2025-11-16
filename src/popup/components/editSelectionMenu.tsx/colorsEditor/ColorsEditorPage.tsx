import { dataManagementService } from "../../../services/DataManagementService";
import { useCurrentDataStore } from "../../../store/CurrentDataStore";
import { useNavigationStore } from "../../../store/NavigationStore"
import { Seperator } from "../../Seperator";
import { ColorEntry } from "./ColorEntry";

export function ColorsEditorPage() {

    const location = useNavigationStore((state) => state.location);
    const data = useCurrentDataStore((state) => state.currentData);

    if (location != "Theme Settings/Colors") return null;

    const onBlurColorsHandler = (name: string, value: string) => {
        dataManagementService.dataManager.currentData["colors"][name] = value;
        dataManagementService.dataUpdated();
    }

    const onBlurClassColorsHandler = (name: string, value: string) => {
        dataManagementService.dataManager.currentData["classColors"][name] = value;
        dataManagementService.dataUpdated();
    }

    return <div className="w-full flex flex-col">
        <Seperator>Fluent UI Colors</Seperator>
        {Object.entries(data.colors).map(([colorName, value]) => {
            return <ColorEntry name={colorName} value={value} key={colorName} onBlur={onBlurColorsHandler}></ColorEntry>
        })}
        <Seperator>Teams Specific</Seperator>
        {Object.entries(data.classColors).map(([colorName, value]) => {
            return <ColorEntry name={colorName} value={value} key={colorName} onBlur={onBlurClassColorsHandler}></ColorEntry>
        })}
    </div>
}