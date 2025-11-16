import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export function Seperator(props: Props) {
    return <div className="w-full flex items-center gap-2 px-1 py-1">
        <span className="grow h-[1px] bg-black/50"></span>
        <span className="text-base text-black/50">{props.children}</span>
        <span className="grow h-[1px] bg-black/50"></span>
    </div>
     
}