import { useRef, useState } from "react";
import { Tooltip } from "./Tooltip";

interface Props {
    tagText: string;
    description: string;
}

export function ColorEntryTag(props: Props) {
    const [showTooltip, setShowTooltip] = useState(false);
    const timerRef = useRef<number>(null);

    const handleMouseEnter = () => {
        // start a timer when hover begins
        timerRef.current = setTimeout(() => setShowTooltip(true), 500); // 500ms delay
    };

    const handleMouseLeave = () => {
        // clear timer if mouse leaves early
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setShowTooltip(false); // hide tooltip immediately
    };

    return (
        <div
            className="px-2 py-1 rounded-full bg-black/1 text-black/50 text-xs border border-black/10"
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
        >
            {props.tagText}
            <Tooltip showTooltip={showTooltip} text={props.description}></Tooltip>
        </div>
    );
}
