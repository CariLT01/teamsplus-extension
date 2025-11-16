import { ReactNode } from "react";

interface Props {
    icon: ReactNode;
    children: ReactNode;
    onClick?: () => void;
}

export function SettingsTypeButton(props: Props) {
    return <button className="border-b border-black/10 px-4 py-2 flex items-center gap-4 w-full hover:bg-black/15 transition-colors duration-300 cursor-pointer" onClick={props.onClick}>
        <div>
            {props.icon}
        </div>
        <div className="text-xl">
            {props.children}
        </div>
    </button>
}