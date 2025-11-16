import { useNavigationStore } from "../../store/NavigationStore";
import { TransparentButton } from "../TransparentButton";
import { BackgroundsEditorPage } from "./backgroundsEditor/BackgroundsEditor";
import { ColorsEditorPage } from "./colorsEditor/ColorsEditorPage";
import { DesignEditorPage } from "./designEditor/DesignEditorPage";
import { EmojisSetEditorPage } from "./emojisSetEditor/EmojisSetEditor";
import { FontsEditorPage } from "./fontsEditor/FontsEditorPage";
import { SettingsTypeMenu } from "./settingsTypeMenu/SettingsTypeMenu";

function goBack(path: string): string {
  if (!path) return "";
  const parts = path.split("/").filter(Boolean); // remove empty segments
  parts.pop(); // remove last segment
  return parts.join("/"); // join with no slashes at beginning or end
}

export function EditorSelectionPage() {
    const location = useNavigationStore((state) => state.location);
    const setLocation = useNavigationStore((state) => state.setLocation);

    if (location == "") {
        return null;
    }


    const locationSplitted = location.split("/");
    const name = locationSplitted[locationSplitted.length - 1];

    const goBackOnClick = () => {
        setLocation(goBack(location));
    }

    return (
        <div className="w-full">
            <div className="w-full flex gap-4 items-center px-4 py-2 border-b border-black/35 sticky top-0 bg-white shadow-md">
                <TransparentButton
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#1f1f1f"
                        >
                            <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z" />
                        </svg>
                    }
                    onClick={goBackOnClick}
                ></TransparentButton>
                <span className="text-2xl font-bold">{name}</span>
            </div>
            <div>
                <SettingsTypeMenu></SettingsTypeMenu>
                <ColorsEditorPage></ColorsEditorPage>
                <DesignEditorPage></DesignEditorPage>
                <FontsEditorPage></FontsEditorPage>
                <BackgroundsEditorPage></BackgroundsEditorPage>
                <EmojisSetEditorPage></EmojisSetEditorPage>
            </div>
        </div>
    );
}
