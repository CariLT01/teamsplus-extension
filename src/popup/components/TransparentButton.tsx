import { forwardRef, ReactNode } from "react";

interface Props {
    onClick?: () => void;
    icon: ReactNode
}

export const TransparentButton = forwardRef<HTMLButtonElement, Props>(function(props: Props, ref) {
    return <button className="px-1 py-1 m-0 border-0 bg-transparent cursor-pointer" onClick={props.onClick} ref={ref}>
        {props.icon}
    </button>
})