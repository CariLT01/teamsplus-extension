import { dataManagementService } from "../../../services/DataManagementService";
import { useCurrentDataStore } from "../../../store/CurrentDataStore"
import { useNavigationStore } from "../../../store/NavigationStore";
import { DesignEntry } from "./DesignEntry";

export function DesignEditorPage() {

    const location = useNavigationStore((state) => state.location);
    const data = useCurrentDataStore((state) => state.currentData);

    const onBlur = (name: string, value: string) => {
        dataManagementService.dataManager.currentData["pixelValues"][name] = value;
        dataManagementService.dataUpdated();
    }

    if (location !== "Theme Settings/Design") return null;

    return <div className="w-full flex flex-col">
        {Object.entries(data.pixelValues).map(([colorName, value]) => {
            return <DesignEntry name={colorName} value={value} key={colorName} onBlur={onBlur}></DesignEntry>
        })}
    </div>
}