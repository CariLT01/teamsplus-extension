import clsx from "clsx";

interface Props {
    text: string;
    primary: boolean;

    onClick: () => void;
}

export function ButtonWithText(props: Props) {
    const buttonStyles = clsx(
        "font-semibold rounded-md px-6 py-4 cursor-pointer transition-colors",
        props.primary ? "bg-white text-black hover:bg-white/85" : "bg-black text-white hover:bg-black/85"
    )

    return <button className={buttonStyles} onClick={() => props.onClick()}>{props.text}</button>
}