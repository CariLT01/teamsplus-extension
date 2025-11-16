import { useNavigationStore } from "../../../store/NavigationStore";
import { SettingsTypeButton } from "./typeButton/SettingsTypeButton";

export function SettingsTypeMenu() {
    const location = useNavigationStore((state) => state.location);
    const setLocation = useNavigationStore((state) => state.setLocation);

    if (location !== "Theme Settings") return null;

    const onColorsClicked = () => {
        setLocation("Theme Settings/Colors");
    };
    const onDesignClicked = () => {
        setLocation("Theme Settings/Design");
    }
    const onFontsClicked = () => {
        setLocation("Theme Settings/Custom Fonts");
    }
    const onBackgroundsClicked = () => {
        setLocation("Theme Settings/Custom Background");
    }
    const onEmojisClicked = () => {
        setLocation("Theme Settings/Emoji Set");
    }

    return (
        <div>
            <SettingsTypeButton
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                    >
                        <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-220 40q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120-160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm200 0q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120 160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z" />
                    </svg>
                }
                onClick={onColorsClicked}
            >
                Colors
            </SettingsTypeButton>
            <SettingsTypeButton
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                    >
                        <path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z" />
                    </svg>
                }
                onClick={onDesignClicked}
            >
                Design
            </SettingsTypeButton>
            <SettingsTypeButton
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                    >
                        <path d="M256-240h84l44-122h192l44 122h84L522-720h-84L256-240Zm152-192 70-198h4l70 198H408ZM160-80q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v640q0 33-23.5 56.5T800-80H160Zm0-80h640v-640H160v640Zm0-640v640-640Z" />
                    </svg>
                }
                onClick={onFontsClicked}
            >
                Custom Fonts
            </SettingsTypeButton>
            <SettingsTypeButton
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                    >
                        <path d="M200-120q-33 0-56.5-23.5T120-200v-240h80v240h240v80H200Zm320 0v-80h240v-240h80v240q0 33-23.5 56.5T760-120H520ZM240-280l120-160 90 120 120-160 150 200H240ZM120-520v-240q0-33 23.5-56.5T200-840h240v80H200v240h-80Zm640 0v-240H520v-80h240q33 0 56.5 23.5T840-760v240h-80Zm-140-40q-26 0-43-17t-17-43q0-26 17-43t43-17q26 0 43 17t17 43q0 26-17 43t-43 17Z" />
                    </svg>
                }
                onClick={onBackgroundsClicked}
            >
                Custom Background
            </SettingsTypeButton>
            <SettingsTypeButton
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                    >
                        <path d="M620-40q-104 0-183.5-62T331-260q45 2 89-9t84-31h164q1-11 1.5-21.5t.5-21.5q0-9-.5-18.5T668-380h-59q16-18 29.5-38t24.5-42h141q-20-30-48-52.5T693-547q5-20 6.5-41t.5-41q96 26 158 105.5T920-340q0 125-87.5 212.5T620-40Zm-95-102q-7-20-12.5-39t-9.5-39h-67q17 25 39.5 45t49.5 33Zm95 14q12-22 20.5-45t14.5-47h-70q6 24 15 47t20 45Zm95-14q27-13 49.5-33t39.5-45h-67q-5 20-10 39t-12 39Zm33-158h88q2-10 3-19.5t1-20.5q0-11-1-20.5t-3-19.5h-88q1 9 1.5 18.5t.5 18.5q0 11-.5 21.5T748-300Zm-408-20q-125 0-212.5-87.5T40-620q0-125 87.5-212.5T340-920q125 0 212.5 87.5T640-620q0 125-87.5 212.5T340-320Zm0-80q91 0 155.5-64.5T560-620q0-91-64.5-155.5T340-840q-91 0-155.5 64.5T120-620q0 91 64.5 155.5T340-400ZM240-640q17 0 28.5-11.5T280-680q0-17-11.5-28.5T240-720q-17 0-28.5 11.5T200-680q0 17 11.5 28.5T240-640Zm100 176q48 0 85.5-27t54.5-69H200q17 42 54.5 69t85.5 27Zm100-176q17 0 28.5-11.5T480-680q0-17-11.5-28.5T440-720q-17 0-28.5 11.5T400-680q0 17 11.5 28.5T440-640Zm-100 20Z" />
                    </svg>
                }
                onClick={onEmojisClicked}
            >
                Emoji set
            </SettingsTypeButton>
        </div>
    );
}
