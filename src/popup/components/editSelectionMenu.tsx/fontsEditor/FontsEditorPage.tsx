import clsx from "clsx";
import AceEditor from "react-ace";
import { useNavigationStore } from "../../../store/NavigationStore";

import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-monokai";
import { useCurrentDataStore } from "../../../store/CurrentDataStore";
import { useRef } from "react";
import { dataManagementService } from "../../../services/DataManagementService";
import { TeamsPlusInput } from "../../basic/TPInput";

export function FontsEditorPage() {

    const location = useNavigationStore(state => state.location);
    const data = useCurrentDataStore(data => data.currentData);

    const editorRef = useRef<AceEditor>(null);

    if (location !== "Theme Settings/Custom Fonts") return null;

    const sectionClass = clsx("px-2 py-2 border border-black/10 bg-black/1 rounded-md flex items-center gap-4 flex-col w-full");
    const sectionlabelClass = clsx("text-base font-bold")

    const editorOnBlur = () => {
        if (editorRef.current == null) return;
        dataManagementService.dataManager.currentData.fonts["imports"] = editorRef.current.editor.getValue();
        dataManagementService.dataUpdated();
    }

    const inputOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        dataManagementService.dataManager.currentData.fonts["fontFamily"] = e.target.value;
        dataManagementService.dataUpdated();
    }


    return <div className="flex gap-4 items-center px-4 py-2 flex-col animate-fadeIn">
        <div className={sectionClass}>
            <span className={sectionlabelClass}>Custom imports</span>
            <div className="px-2 w-full">
                <div className="rounded-md w-full h-[40vh] border border-black/10 overflow-hidden">
                    <AceEditor
                        ref={editorRef}
                        mode="css"
                        theme="monokai"
                        width="100%"
                        height="100%"
                        value={data.fonts["imports"]}
                        setOptions={{wrap: true}}
                        onBlur={editorOnBlur}
                        >

                    </AceEditor>
                </div>
            </div>
        </div>
        <div className={sectionClass}>
            <span className={sectionlabelClass}>Fonts</span>
            <div className="px-2 w-full">
                <TeamsPlusInput defaultValue={data.fonts["fontFamily"]} onBlur={inputOnBlur}></TeamsPlusInput>
            </div>
            
        </div>

    </div>
}