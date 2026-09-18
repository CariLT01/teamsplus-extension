import clsx from "clsx";
import { forwardRef, useState } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TeamsPlusInput = forwardRef<HTMLInputElement, Props>(
    (props: Props, ref) => {
        const [focused, setFocused] = useState(false);

        const divClasses = clsx(
            "px-2 py-1 rounded-md overflow-hidden border border-black/35 w-full relative transition-colors duration-300",
            "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black",
            "after:transition-all after:duration-150",
            focused ? "after:scale-x-100" : "after:scale-x-0",
            focused ? "border-black/75" : "border-black/35"
        );

        return (
            <div className={divClasses}>
                <input
                    className="focus:outline-none m-0 w-full h-full"
                    ref={ref}
                    {...props}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                ></input>
            </div>
        );
    }
);
