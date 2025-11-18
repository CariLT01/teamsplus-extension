import { useEffect, useRef, useState } from "react";
import { RgbaColor, RgbaColorPicker, RgbColorPicker } from "react-colorful";
import tinycolor from "tinycolor2";
import { ColorEntryTag } from "./ColorEntryTag";

const TAGS_TO_FIND: string[] = [
    "Hover",
    "Pressed",
    "Selected",
    "Disabled",
    "Active",
    "Inverted",
];

const DESCRIPTIONS: { [key: string]: string } = {
    "Hover": "The color used whenever items are hovered over.",
    "Pressed": "The color used whenever items are clicked or tapped.",
    "Selected": "The color used whenever items are selected.",
    "Disabled": "The color used whenever items cannot be used.",
    "Active": "The color used whenever items are active or in use.",
    "Inverted": "A contrasting version of the color for emphasis or variation."
};

interface Props {
    name: string;
    value: string;
    onBlur?: (name: string, value: string) => void;
}

export function formatTokenName(token: string): string {
    // remove leading dashes
    let stripped = token.replace(/^--/, "");

    // remove leading "color"
    stripped = stripped.replace(/^color/, "");

    // uppercase first letter
    const capitalized = stripped.charAt(0).toUpperCase() + stripped.slice(1);

    // split into words: uppercase boundaries + numbers
    const parts = capitalized.match(/[A-Z][a-z]*|[0-9]+/g);

    if (!parts) return capitalized;

    return parts.join(" ");
}

function getTags(token: string): string[] {
    const tags: string[] = [];

    for (const tag of TAGS_TO_FIND) {
        if (token.includes(tag)) {
            tags.push(tag);
        }
    }

    return tags;
}

function filterTokenFromTags(token: string): string {

    let s = token;

    for (const tag of TAGS_TO_FIND) {
        if (token.includes(tag)) {
            s = s.replace(tag, "");
        }
    }

    return s;
}

export function ColorEntry(props: Props) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [color, setColor] = useState<RgbaColor>({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
    });
    const colorRef = useRef<RgbaColor>(color);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        colorRef.current = color;
    }, [color]);

    useEffect(() => {
        const tc = tinycolor(props.value);
        const rgba = tc.toRgb();
        setColor({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a });
    }, [props.value]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setPickerVisible(false);

                if (!props.onBlur) return;
                console.log("Set: ", color);
                props.onBlur(
                    props.name,
                    `rgba(${colorRef.current.r}, ${colorRef.current.g}, ${colorRef.current.b}, ${colorRef.current.a})`
                );
            }
        }

        if (pickerVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [pickerVisible]);

    const buttonOnClick = () => {
        setPickerVisible(true);
    };

    const tags = getTags(props.name);

    return (
        <div
            className="w-full px-4 py-2 flex items-center gap-4 justify-between border-b border-black/10"
            ref={containerRef}
        >
            <div className="flex items-center gap-2">
                <span className="text-base">
                    {formatTokenName(filterTokenFromTags(props.name))}
                </span>

                {tags.map((value) => {
                    return <ColorEntryTag tagText={value} description={DESCRIPTIONS[value]} key={value}></ColorEntryTag>;
                })}
            </div>

            {!pickerVisible && (
                <div className="bg-checkerboard w-6 h-6 rounded-md relative">
                    <button
                        className="w-full h-full rounded-md border border-black/35 cursor-pointer absolute p-[1px] top-1/2 left-1/2 -translate-1/2 brightness-100 hover:brightness-75 transition duration-300"
                        style={{ backgroundColor: props.value }}
                        onClick={buttonOnClick}
                    ></button>
                </div>
            )}
            {pickerVisible && (
                <RgbaColorPicker
                    color={color}
                    onChange={setColor}
                ></RgbaColorPicker>
            )}
        </div>
    );
}
