import { dataManagementService } from "../../../services/DataManagementService";
import { useCurrentDataStore } from "../../../store/CurrentDataStore";
import { useNavigationStore } from "../../../store/NavigationStore";
import { Seperator } from "../../Seperator";
import { ColorEntry } from "./ColorEntry";

const COLORS_TAGS: { [key: string]: string[] } = {
    "Background Colors": ["--colorNeutralBackground", "--colorDefaultBackground", "--backgroundCanvas"],
    "Foreground Colors": ["--colorNeutralForeground"],
    "Brand Background Colors": ["--colorBrandBackground"],
    "Link Colors": ["--colorBrandForegroundLink"]
};

const ORDERED_TAGS = ["Background Colors", "Foreground Colors", "Brand Background Colors", "Link Colors"];

type SortedColorGroup = { [key: string]: string };

function sortColors(colors: { [key: string]: string }) {
    const grouped: { [key: string]: SortedColorGroup } = {};

    // Initialize groups
    ORDERED_TAGS.forEach((tag) => {
        grouped[tag] = {};
    });
    grouped["Other Colors"] = {}; // catch-all group

    // Assign colors to groups
    for (const color in colors) {
        let found = false;

        for (const tag in COLORS_TAGS) {
            const prefixes = COLORS_TAGS[tag];
            if (prefixes.some((prefix) => color.startsWith(prefix))) {
                grouped[tag][color] = colors[color];
                found = true;
                break;
            }
        }

        if (!found) {
            grouped["Other Colors"][color] = colors[color];
        }
    }

    // Convert to array in desired order
    const sortedList: { name: string; data: SortedColorGroup }[] = [];

    ORDERED_TAGS.forEach((tag) => {
        if (Object.keys(grouped[tag]).length > 0) {
            sortedList.push({ name: tag, data: grouped[tag] });
        }
    });

    if (Object.keys(grouped["Other Colors"]).length > 0) {
        sortedList.push({ name: "Other Colors", data: grouped["Other Colors"] });
    }

    return sortedList;
}



export function ColorsEditorPage() {
    const location = useNavigationStore((state) => state.location);
    const data = useCurrentDataStore((state) => state.currentData);

    if (location != "Theme Settings/Colors") return null;

    const onBlurColorsHandler = (name: string, value: string) => {
        dataManagementService.dataManager.currentData["colors"][name] = value;
        dataManagementService.dataUpdated();
    };

    const onBlurClassColorsHandler = (name: string, value: string) => {
        dataManagementService.dataManager.currentData["classColors"][name] =
            value;
        dataManagementService.dataUpdated();
    };

    const sortedList = sortColors(data.colors);

    return (
        <div className="w-full flex flex-col animate-fadeIn">
            <Seperator>Fluent UI Colors</Seperator>
            {Object.entries(sortedList).map(([_, colorGroup]) => {
                return (
                    <div>
                        <Seperator>{colorGroup.name}</Seperator>
                        {Object.entries(colorGroup.data).map(([colorName, value]) => {
                            return <ColorEntry name={colorName} value={value} key={colorName} onBlur={onBlurColorsHandler}></ColorEntry>
                        })}
                        
                    </div>
                );
            })}
            <Seperator>Teams Specific</Seperator>
            {Object.entries(data.classColors).map(([colorName, value]) => {
                return (
                    <ColorEntry
                        name={colorName}
                        value={value}
                        key={colorName}
                        onBlur={onBlurClassColorsHandler}
                    ></ColorEntry>
                );
            })}
        </div>
    );
}
