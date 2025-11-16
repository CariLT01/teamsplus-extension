import clsx from "clsx";
import { forwardRef, ReactNode } from "react";

interface Props {
    icon: ReactNode;
    isSecondary: boolean;
    children?: ReactNode;
    smaller?: boolean;
    onClick?: () => void;
}

export const Button = forwardRef<HTMLButtonElement, Props>( function Button(props: Props, ref) {

    const buttonClasses = clsx(
        props.smaller ? 'py-1 px-2' : 'py-2 px-[1.8rem]',
        'rounded-md border',
        props.isSecondary ? 'bg-transparent' : 'bg-black',
        props.isSecondary ? 'border-black/35' : 'border-transparent',
        'flex items-center gap-4 cursor-pointer',
        props.isSecondary ? 'hover:bg-black/25' : 'hover:bg-black/85',
        'transition-colors duration-300'
    )

    const textClasses = clsx(
        props.smaller ? 'font-bold text-base' : 'font-bold text-[1.1rem]',
        props.isSecondary ? 'text-black' : 'text-white'
    )

    return <button onClick={props.onClick} className={buttonClasses} ref={ref}>
        {props.icon ? <div>
            {props.icon}
        </div> : null}
        {props.children ? <div className={textClasses}>
            {props.children}
        </div> : null}
    </button>
})