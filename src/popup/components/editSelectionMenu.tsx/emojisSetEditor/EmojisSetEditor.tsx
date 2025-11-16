import { dataManagementService } from "../../../services/DataManagementService";
import { useCurrentDataStore } from "../../../store/CurrentDataStore";
import { useNavigationStore } from "../../../store/NavigationStore"

export function EmojisSetEditorPage() {

    const location = useNavigationStore(state => state.location);
    const data = useCurrentDataStore(state => state.currentData);

    if (location !== "Theme Settings/Emoji Set") return null;

    const v = data.emojis["set"] == "twemoji";
    const v2 = v ? "true" : "false";

    const onSelectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dataManagementService.dataManager.currentData.emojis["set"] = (e.target.value == "true") ? "twemoji" : "default";
        dataManagementService.dataUpdated();
    }

    return <div className="w-full flex items-center px-2 py-1">
        <div className="w-full px-2 py-1 border-b border-black/10 flex justify-between">
            <span className="text-base">Emoji Set</span>
            <select className="w-[40vw] h-[85%] py-1 rounded-md border border-black/35 focus:border-black/50 focus:outline-none transition-colors duration-300" defaultValue={v2} onChange={onSelectionChanged}>
                <option value="false">Default</option>
                <option value="true">Twemoji (Twitter Emojis)</option>
            </select>
        </div>
    </div>
}