import { ReactNode } from "react";

interface Props {
    onClick?: () => void;
    icon: ReactNode
}

export function TransparentButton(props: Props) {
    return <button className="px-1 py-1 m-0 border-0 bg-transparent cursor-pointer" onClick={props.onClick}>
        {props.icon}
    </button>
}