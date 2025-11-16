import clsx from "clsx";
import { useState } from "react";

interface Props {
    value: boolean;
    name: string;
    onClick?: (v: boolean) => void;
}

export function ToggleSwitch(props: Props) {

    const [checked, setChecked] = useState(props.value);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
        if (!props.onClick) return;
        props.onClick(e.target.checked);
    }

    const labelClasses = clsx(
        "inline-block w-8 h-4 rounded-full cursor-pointer relative transition-colors duration-300",
        "before:absolute before:content-[''] before:bg-white before:w-3 before:h-3 before:m-[0.125rem] before:rounded-full before:transition-transform before:duration-300",
        checked ? "bg-black" : "bg-black/35",
        checked ? "before:translate-x-4" : ""
    );

    return <div>
        <input type="checkbox" defaultChecked={props.value} id={props.name} className="hidden" onChange={onChange}></input>
        <label htmlFor={props.name}  className={labelClasses}></label>
    </div>
}